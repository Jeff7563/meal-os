import { prisma } from "@/lib/db";
import { getInitialSeedPlan } from "@/lib/seed-data";
import { aggregateMealPlanIngredients } from "@/lib/shopping/aggregator";
import {
  MealItem,
  MealPlanDayItem,
  MealPlanItem,
  MealStatus,
  MealType,
  ProgressSummary,
  ShoppingListItem,
  ShoppingStatus,
  UserProfile,
  WeightRecord,
} from "@/types/meal";
import { MealPlanImportType } from "@/schemas/meal-plan.schema";
import {
  getBangkokTodayString,
  getWeekDates,
  getDayLabelFromDate,
} from "@/lib/date-utils";

// In-Memory / Fallback Store state (resilient for environments without live Postgres DB)
interface MemoryStoreState {
  user: UserProfile;
  mealPlan: MealPlanItem;
  mealLogs: Map<string, { status: MealStatus; completedAt?: Date; note?: string }>;
  shoppingItems: ShoppingListItem[];
  weightLogs: WeightRecord[];
}

let memoryStore: MemoryStoreState | null = null;
let isDbConnected: boolean | null = null;

async function checkDbConnection(): Promise<boolean> {
  if (isDbConnected !== null) return isDbConnected;
  try {
    // Fast test query
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    return false;
  }
}

function initMemoryStore(startDate = getBangkokTodayString()): MemoryStoreState {
  const seed = getInitialSeedPlan(startDate);
  const planId = "plan_seed_1";

  const days: MealPlanDayItem[] = seed.plan.days.map((d, dIdx) => {
    const dayId = `day_${dIdx + 1}`;
    return {
      id: dayId,
      mealPlanId: planId,
      dayIndex: d.day,
      date: d.date,
      label: d.label,
      meals: d.meals.map((m, mIdx) => {
        const mealId = `meal_${dIdx + 1}_${mIdx + 1}`;
        return {
          id: mealId,
          mealPlanDayId: dayId,
          externalId: m.externalId,
          type: m.type.toUpperCase() as MealType,
          time: m.time,
          name: m.name,
          description: m.description,
          prepTimeMinutes: m.prepTime,
          calories: m.nutrition?.calories ?? null,
          protein: m.nutrition?.protein ?? null,
          carbs: m.nutrition?.carbs ?? null,
          fat: m.nutrition?.fat ?? null,
          ingredients: m.ingredients.map((ing, iIdx) => ({
            id: `ing_${mealId}_${iIdx}`,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category,
          })),
          instructions: m.instructions.map((inst, iIdx) => ({
            id: `inst_${mealId}_${iIdx}`,
            step: iIdx + 1,
            text: inst,
          })),
          tags: m.tags.map((t, tIdx) => ({
            id: `tag_${mealId}_${tIdx}`,
            name: t,
          })),
          status: "PENDING",
        };
      }),
    };
  });

  const plan: MealPlanItem = {
    id: planId,
    name: seed.plan.name,
    description: seed.plan.description,
    startDate: seed.plan.startDate,
    endDate: seed.plan.days[seed.plan.days.length - 1]?.date,
    isActive: true,
    days,
  };

  const shopping = aggregateMealPlanIngredients(days);

  const initialLogs = new Map<string, { status: MealStatus; completedAt?: Date }>();
  // Pre-seed 2 completed meals for Monday (today) so the user immediately sees the progress bar!
  if (days[0]?.meals[0]) {
    initialLogs.set(`${days[0].meals[0].id}::${days[0].date}`, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
  }
  if (days[0]?.meals[1]) {
    initialLogs.set(`${days[0].meals[1].id}::${days[0].date}`, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
  }

  return {
    user: {
      id: "user_default",
      name: "คุณเจฟฟี่",
      height: 175,
      currentWeight: 76.5,
      goalWeight: 68.0,
      breakfastTime: "07:30",
      lunchTime: "12:00",
      dinnerTime: "18:30",
    },
    mealPlan: plan,
    mealLogs: initialLogs,
    shoppingItems: shopping,
    weightLogs: [
      {
        id: "w1",
        date: "2026-09-01",
        weightKg: 78.0,
        note: "เริ่มคุมอาหาร",
        createdAt: new Date().toISOString(),
      },
      {
        id: "w2",
        date: "2026-09-07",
        weightKg: 77.2,
        note: "จบสัปดาห์แรก",
        createdAt: new Date().toISOString(),
      },
      {
        id: "w3",
        date: "2026-09-14",
        weightKg: 76.5,
        note: "ชั่งเช้าวันจันทร์",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function getMemoryStore(): MemoryStoreState {
  if (!memoryStore) {
    memoryStore = initMemoryStore();
  }
  return memoryStore;
}

// ==========================================
// REPOSITORY IMPLEMENTATION
// ==========================================

export async function getActiveMealPlan(dateStr = getBangkokTodayString()): Promise<MealPlanItem | null> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const plan = await prisma.mealPlan.findFirst({
        where: { isActive: true },
        include: {
          days: {
            orderBy: { dayIndex: "asc" },
            include: {
              meals: {
                orderBy: { time: "asc" },
                include: {
                  ingredients: true,
                  instructions: { orderBy: { step: "asc" } },
                  tags: true,
                  logs: {
                    where: { date: dateStr },
                  },
                },
              },
            },
          },
        },
      });

      // If database is empty, automatically seed it with our 7-day plan!
      if (!plan) {
        await seedDatabase();
        return getActiveMealPlan(dateStr);
      }

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        isActive: plan.isActive,
        days: plan.days.map((d) => ({
          id: d.id,
          mealPlanId: d.mealPlanId,
          dayIndex: d.dayIndex,
          date: d.date,
          label: d.label,
          meals: d.meals.map((m) => ({
            id: m.id,
            mealPlanDayId: m.mealPlanDayId,
            externalId: m.externalId,
            type: m.type as MealType,
            time: m.time,
            name: m.name,
            description: m.description,
            prepTimeMinutes: m.prepTimeMinutes,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            ingredients: m.ingredients,
            instructions: m.instructions,
            tags: m.tags,
            status: (m.logs[0]?.status as MealStatus) || "PENDING",
          })),
        })),
      };
    } catch (err) {
      console.warn("Prisma error, falling back to memory store:", err);
    }
  }

  // Fallback / In-Memory
  const store = getMemoryStore();
  // Attach status for the requested date
  const mappedDays = store.mealPlan.days.map((day) => ({
    ...day,
    meals: day.meals.map((m) => {
      const logKey = `${m.id}::${day.date}`;
      const log = store.mealLogs.get(logKey);
      return {
        ...m,
        status: log?.status || "PENDING",
      };
    }),
  }));

  return {
    ...store.mealPlan,
    days: mappedDays,
  };
}

export async function getMealsForDate(dateStr = getBangkokTodayString()): Promise<{
  dayLabel: string;
  meals: MealItem[];
  planName: string;
}> {
  const plan = await getActiveMealPlan(dateStr);
  if (!plan || !plan.days || plan.days.length === 0) {
    return { dayLabel: getDayLabelFromDate(dateStr), meals: [], planName: "" };
  }

  // Find day matching dateStr, or match by dayIndex if date offset
  let targetDay = plan.days.find((d) => d.date === dateStr);
  if (!targetDay) {
    // If exact date not matched, find day with matching weekday label
    const label = getDayLabelFromDate(dateStr);
    targetDay = plan.days.find((d) => d.label === label) || plan.days[0];
  }

  const dbOk = await checkDbConnection();
  if (dbOk) {
    try {
      const mealIds = targetDay.meals.map((m) => m.id);
      const logs = await prisma.mealLog.findMany({
        where: {
          mealId: { in: mealIds },
          date: dateStr,
        },
      });
      const logMap = new Map(logs.map((l) => [l.mealId, l.status as MealStatus]));

      const mealsWithStatus = targetDay.meals.map((m) => ({
        ...m,
        status: logMap.get(m.id) || "PENDING",
      }));

      return {
        dayLabel: targetDay.label,
        meals: mealsWithStatus,
        planName: plan.name,
      };
    } catch (err) {
      console.warn("Error fetching meal logs from DB:", err);
    }
  }

  // In-memory fallback
  const store = getMemoryStore();
  const mealsWithStatus = targetDay.meals.map((m) => {
    const logKey = `${m.id}::${dateStr}`;
    const log = store.mealLogs.get(logKey);
    return {
      ...m,
      status: log?.status || "PENDING",
    };
  });

  return {
    dayLabel: targetDay.label,
    meals: mealsWithStatus,
    planName: plan.name,
  };
}

export async function getMealDetail(mealId: string, dateStr = getBangkokTodayString()): Promise<MealItem | null> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const meal = await prisma.meal.findUnique({
        where: { id: mealId },
        include: {
          ingredients: true,
          instructions: { orderBy: { step: "asc" } },
          tags: true,
          logs: {
            where: { date: dateStr },
          },
        },
      });

      if (!meal) return null;

      return {
        id: meal.id,
        mealPlanDayId: meal.mealPlanDayId,
        externalId: meal.externalId,
        type: meal.type as MealType,
        time: meal.time,
        name: meal.name,
        description: meal.description,
        prepTimeMinutes: meal.prepTimeMinutes,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        tags: meal.tags,
        status: (meal.logs[0]?.status as MealStatus) || "PENDING",
      };
    } catch (err) {
      console.warn("DB meal detail error, checking memory:", err);
    }
  }

  // Memory fallback
  const store = getMemoryStore();
  for (const day of store.mealPlan.days) {
    const found = day.meals.find((m) => m.id === mealId);
    if (found) {
      const logKey = `${found.id}::${dateStr}`;
      const log = store.mealLogs.get(logKey);
      return {
        ...found,
        status: log?.status || "PENDING",
      };
    }
  }

  return null;
}

export async function toggleMealStatus(
  mealId: string,
  dateStr = getBangkokTodayString(),
  overrideStatus?: MealStatus
): Promise<MealStatus> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const existing = await prisma.mealLog.findUnique({
        where: {
          mealId_date: {
            mealId,
            date: dateStr,
          },
        },
      });

      const nextStatus: MealStatus =
        overrideStatus ??
        (existing?.status === "COMPLETED" ? "PENDING" : "COMPLETED");

      await prisma.mealLog.upsert({
        where: {
          mealId_date: {
            mealId,
            date: dateStr,
          },
        },
        create: {
          mealId,
          date: dateStr,
          status: nextStatus,
          completedAt: nextStatus === "COMPLETED" ? new Date() : null,
        },
        update: {
          status: nextStatus,
          completedAt: nextStatus === "COMPLETED" ? new Date() : null,
        },
      });

      return nextStatus;
    } catch (err) {
      console.warn("DB toggle status error, falling back to memory:", err);
    }
  }

  // Memory fallback
  const store = getMemoryStore();
  const logKey = `${mealId}::${dateStr}`;
  const current = store.mealLogs.get(logKey)?.status || "PENDING";
  const nextStatus: MealStatus =
    overrideStatus ?? (current === "COMPLETED" ? "PENDING" : "COMPLETED");

  store.mealLogs.set(logKey, {
    status: nextStatus,
    completedAt: nextStatus === "COMPLETED" ? new Date() : undefined,
  });

  return nextStatus;
}

export async function getShoppingItems(planId?: string): Promise<ShoppingListItem[]> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const plan = await prisma.mealPlan.findFirst({
        where: planId ? { id: planId } : { isActive: true },
        include: {
          shoppingItems: {
            orderBy: [{ status: "asc" }, { ingredientName: "asc" }],
          },
        },
      });

      if (plan && plan.shoppingItems.length > 0) {
        return plan.shoppingItems.map((item) => ({
          id: item.id,
          ingredientName: item.ingredientName,
          amount: item.amount,
          unit: item.unit,
          category: item.category,
          status: item.status as ShoppingStatus,
        }));
      }

      // If no shopping items in DB, generate from plan
      if (plan) {
        const fullPlan = await getActiveMealPlan();
        if (fullPlan) {
          const aggregated = aggregateMealPlanIngredients(fullPlan.days);
          await prisma.shoppingItem.createMany({
            data: aggregated.map((item) => ({
              mealPlanId: plan.id,
              ingredientName: item.ingredientName,
              amount: item.amount,
              unit: item.unit,
              category: item.category,
              status: item.status,
            })),
          });
          return aggregated;
        }
      }
    } catch (err) {
      console.warn("DB shopping items error, using fallback:", err);
    }
  }

  const store = getMemoryStore();
  return store.shoppingItems;
}

export async function updateShoppingItemStatus(
  ingredientName: string,
  unit: string,
  newStatus: ShoppingStatus
): Promise<void> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const activePlan = await prisma.mealPlan.findFirst({
        where: { isActive: true },
      });
      if (activePlan) {
        await prisma.shoppingItem.updateMany({
          where: {
            mealPlanId: activePlan.id,
            ingredientName,
            unit,
          },
          data: { status: newStatus },
        });
        return;
      }
    } catch (err) {
      console.warn("DB update shopping error:", err);
    }
  }

  const store = getMemoryStore();
  const found = store.shoppingItems.find(
    (i) =>
      i.ingredientName.toLowerCase() === ingredientName.toLowerCase() &&
      i.unit.toLowerCase() === unit.toLowerCase()
  );
  if (found) {
    found.status = newStatus;
  }
}

export async function getProgressSummary(baseDateStr = getBangkokTodayString()): Promise<ProgressSummary> {
  const plan = await getActiveMealPlan(baseDateStr);
  const weekDays = getWeekDates(baseDateStr);

  let todayCompleted = 0;
  let todayTotal = 0;
  let weekCompleted = 0;
  let weekTotal = 0;

  const weekDaysStatus: ProgressSummary["weekDaysStatus"] = [];

  for (const dayInfo of weekDays) {
    const isToday = dayInfo.date === baseDateStr;
    const dayData = plan?.days.find((d) => d.date === dayInfo.date) ||
      plan?.days.find((d) => d.label === dayInfo.label);

    let dayMealsCount = dayData?.meals.length || 3;
    let dayDoneCount = 0;

    if (dayData) {
      dayMealsCount = dayData.meals.length;
      for (const meal of dayData.meals) {
        if (meal.status === "COMPLETED") {
          dayDoneCount++;
        }
      }
    }

    if (isToday) {
      todayTotal = dayMealsCount;
      todayCompleted = dayDoneCount;
    }

    weekTotal += dayMealsCount;
    weekCompleted += dayDoneCount;

    weekDaysStatus.push({
      date: dayInfo.date,
      label: dayInfo.label,
      completed: dayDoneCount,
      total: dayMealsCount,
      isAllDone: dayDoneCount > 0 && dayDoneCount >= dayMealsCount,
      isToday,
    });
  }

  // Calculate streak
  let streak = 0;
  for (let i = weekDaysStatus.length - 1; i >= 0; i--) {
    const d = weekDaysStatus[i];
    if (d.completed > 0) {
      streak++;
    } else if (!d.isToday) {
      break;
    }
  }
  if (streak === 0 && todayCompleted > 0) streak = 1;
  if (streak === 0) streak = 3; // Default pleasant streak for demo seed

  return {
    todayCompleted,
    todayTotal: todayTotal || 3,
    todayPercentage: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
    weekCompleted,
    weekTotal: weekTotal || 21,
    weekPercentage: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
    currentStreak: streak,
    weekDaysStatus,
  };
}

export async function getWeightLogs(): Promise<WeightRecord[]> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const logs = await prisma.weightLog.findMany({
        orderBy: { date: "desc" },
        take: 30,
      });
      return logs.map((l) => ({
        id: l.id,
        date: l.date,
        weightKg: l.weightKg,
        note: l.note,
        createdAt: l.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn("DB weight logs error:", err);
    }
  }

  const store = getMemoryStore();
  return store.weightLogs;
}

export async function addWeightLog(
  dateStr = getBangkokTodayString(),
  weightKg: number,
  note?: string
): Promise<WeightRecord> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const created = await prisma.weightLog.create({
        data: {
          date: dateStr,
          weightKg,
          note,
        },
      });

      // Also update user's current weight
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentWeight: weightKg },
        });
      }

      return {
        id: created.id,
        date: created.date,
        weightKg: created.weightKg,
        note: created.note,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("DB add weight error:", err);
    }
  }

  const store = getMemoryStore();
  const record: WeightRecord = {
    id: `w_${Date.now()}`,
    date: dateStr,
    weightKg,
    note,
    createdAt: new Date().toISOString(),
  };
  store.weightLogs.unshift(record);
  store.user.currentWeight = weightKg;
  return record;
}

export async function getUserProfile(): Promise<UserProfile> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        return {
          id: user.id,
          name: user.name,
          height: user.height,
          currentWeight: user.currentWeight,
          goalWeight: user.goalWeight,
          breakfastTime: user.breakfastTime,
          lunchTime: user.lunchTime,
          dinnerTime: user.dinnerTime,
        };
      }
    } catch (err) {
      console.warn("DB user profile error:", err);
    }
  }

  const store = getMemoryStore();
  return store.user;
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const dbOk = await checkDbConnection();

  if (dbOk) {
    try {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.name || "ผู้ใช้งาน",
            height: profile.height,
            currentWeight: profile.currentWeight,
            goalWeight: profile.goalWeight,
            breakfastTime: profile.breakfastTime || "07:30",
            lunchTime: profile.lunchTime || "12:00",
            dinnerTime: profile.dinnerTime || "18:30",
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...profile,
          },
        });
      }

      return {
        id: user.id,
        name: user.name,
        height: user.height,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
        breakfastTime: user.breakfastTime,
        lunchTime: user.lunchTime,
        dinnerTime: user.dinnerTime,
      };
    } catch (err) {
      console.warn("DB update profile error:", err);
    }
  }

  const store = getMemoryStore();
  store.user = {
    ...store.user,
    ...profile,
  };
  return store.user;
}

// ==========================================
// IMPORT & EXPORT LOGIC (TRANSACTIONAL)
// ==========================================

export async function importMealPlan(
  data: MealPlanImportType,
  mode: "create" | "replace" = "replace"
): Promise<{ planId: string; daysCount: number; mealsCount: number }> {
  const dbOk = await checkDbConnection();
  const daysCount = data.plan.days.length;
  let mealsCount = 0;
  for (const day of data.plan.days) {
    mealsCount += day.meals.length;
  }

  if (dbOk) {
    // Transactional Import with Prisma
    return await prisma.$transaction(async (tx) => {
      if (mode === "replace") {
        // Set all existing plans to inactive
        await tx.mealPlan.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const createdPlan = await tx.mealPlan.create({
        data: {
          name: data.plan.name,
          description: data.plan.description,
          startDate: data.plan.startDate,
          endDate: data.plan.days[data.plan.days.length - 1]?.date,
          isActive: true,
        },
      });

      for (const day of data.plan.days) {
        const createdDay = await tx.mealPlanDay.create({
          data: {
            mealPlanId: createdPlan.id,
            dayIndex: day.day,
            date: day.date,
            label: day.label,
          },
        });

        for (const meal of day.meals) {
          const createdMeal = await tx.meal.create({
            data: {
              mealPlanDayId: createdDay.id,
              externalId: meal.externalId,
              type: meal.type.toUpperCase() as MealType,
              time: meal.time,
              name: meal.name,
              description: meal.description,
              prepTimeMinutes: meal.prepTime,
              calories: meal.nutrition?.calories,
              protein: meal.nutrition?.protein,
              carbs: meal.nutrition?.carbs,
              fat: meal.nutrition?.fat,
            },
          });

          if (meal.ingredients && meal.ingredients.length > 0) {
            await tx.mealIngredient.createMany({
              data: meal.ingredients.map((ing) => ({
                mealId: createdMeal.id,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                category: ing.category,
              })),
            });
          }

          if (meal.instructions && meal.instructions.length > 0) {
            await tx.mealInstruction.createMany({
              data: meal.instructions.map((text, idx) => ({
                mealId: createdMeal.id,
                step: idx + 1,
                text,
              })),
            });
          }

          if (meal.tags && meal.tags.length > 0) {
            await tx.mealTag.createMany({
              data: meal.tags.map((t) => ({
                mealId: createdMeal.id,
                name: t,
              })),
            });
          }
        }
      }

      // Generate shopping items in transaction
      const fullPlan = await tx.mealPlan.findUnique({
        where: { id: createdPlan.id },
        include: {
          days: {
            include: {
              meals: {
                include: { ingredients: true },
              },
            },
          },
        },
      });

      if (fullPlan) {
        const mappedDays: MealPlanDayItem[] = fullPlan.days.map((d) => ({
          id: d.id,
          mealPlanId: d.mealPlanId,
          dayIndex: d.dayIndex,
          date: d.date,
          label: d.label,
          meals: d.meals.map((m) => ({
            id: m.id,
            mealPlanDayId: m.mealPlanDayId,
            type: m.type as MealType,
            time: m.time,
            name: m.name,
            ingredients: m.ingredients,
            instructions: [],
            tags: [],
          })),
        }));

        const shoppingList = aggregateMealPlanIngredients(mappedDays);
        await tx.shoppingItem.createMany({
          data: shoppingList.map((item) => ({
            mealPlanId: createdPlan.id,
            ingredientName: item.ingredientName,
            amount: item.amount,
            unit: item.unit,
            category: item.category,
            status: "NEEDED",
          })),
        });
      }

      return {
        planId: createdPlan.id,
        daysCount,
        mealsCount,
      };
    });
  }

  // Memory fallback import
  const planId = `plan_imported_${Date.now()}`;
  const days: MealPlanDayItem[] = data.plan.days.map((d, dIdx) => {
    const dayId = `day_${planId}_${dIdx + 1}`;
    return {
      id: dayId,
      mealPlanId: planId,
      dayIndex: d.day,
      date: d.date,
      label: d.label,
      meals: d.meals.map((m, mIdx) => {
        const mealId = `meal_${planId}_${dIdx + 1}_${mIdx + 1}`;
        return {
          id: mealId,
          mealPlanDayId: dayId,
          externalId: m.externalId,
          type: m.type.toUpperCase() as MealType,
          time: m.time,
          name: m.name,
          description: m.description,
          prepTimeMinutes: m.prepTime,
          calories: m.nutrition?.calories ?? null,
          protein: m.nutrition?.protein ?? null,
          carbs: m.nutrition?.carbs ?? null,
          fat: m.nutrition?.fat ?? null,
          ingredients: m.ingredients.map((ing, iIdx) => ({
            id: `ing_${mealId}_${iIdx}`,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category,
          })),
          instructions: m.instructions.map((inst, iIdx) => ({
            id: `inst_${mealId}_${iIdx}`,
            step: iIdx + 1,
            text: inst,
          })),
          tags: m.tags.map((t, tIdx) => ({
            id: `tag_${mealId}_${tIdx}`,
            name: t,
          })),
          status: "PENDING",
        };
      }),
    };
  });

  const plan: MealPlanItem = {
    id: planId,
    name: data.plan.name,
    description: data.plan.description,
    startDate: data.plan.startDate,
    endDate: data.plan.days[data.plan.days.length - 1]?.date,
    isActive: true,
    days,
  };

  const store = getMemoryStore();
  store.mealPlan = plan;
  store.mealLogs.clear(); // Reset logs for fresh new plan
  store.shoppingItems = aggregateMealPlanIngredients(days);

  return { planId, daysCount, mealsCount };
}

export async function exportMealPlan(): Promise<MealPlanImportType> {
  const plan = await getActiveMealPlan();
  if (!plan) {
    return getInitialSeedPlan();
  }

  return {
    version: "1.0",
    plan: {
      name: plan.name,
      description: plan.description || "",
      startDate: plan.startDate,
      days: plan.days.map((day) => ({
        day: day.dayIndex,
        label: day.label,
        date: day.date,
        meals: day.meals.map((meal) => ({
          externalId: meal.externalId || undefined,
          type: meal.type.toLowerCase() as "breakfast" | "lunch" | "dinner" | "snack",
          time: meal.time,
          name: meal.name,
          description: meal.description || "",
          prepTime: meal.prepTimeMinutes || 15,
          nutrition:
            meal.calories || meal.protein || meal.carbs || meal.fat
              ? {
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                  fat: meal.fat,
                }
              : undefined,
          ingredients: meal.ingredients.map((ing) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category || "other",
          })),
          instructions: meal.instructions.map((inst) => inst.text),
          tags: meal.tags.map((t) => t.name),
        })),
      })),
    },
  };
}

async function seedDatabase(): Promise<void> {
  const seed = getInitialSeedPlan(getBangkokTodayString());
  await importMealPlan(seed, "create");
}
