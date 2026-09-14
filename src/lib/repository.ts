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
import { DEFAULT_USER_ID, DEFAULT_USER_PROFILE, getCurrentUser } from "@/lib/auth";

function getIsProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

let cachedDbStatus: boolean | null = null;
let lastDbCheckTime = 0;

/**
 * Checks PostgreSQL connectivity via Prisma
 */
export async function isDatabaseConnected(): Promise<boolean> {
  const now = Date.now();
  // Cache check for 5 seconds to avoid spamming SELECT 1
  if (cachedDbStatus !== null && now - lastDbCheckTime < 5000) {
    return cachedDbStatus;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    cachedDbStatus = true;
    lastDbCheckTime = now;
    return true;
  } catch (err) {
    cachedDbStatus = false;
    lastDbCheckTime = now;
    if (getIsProduction()) {
      console.error("❌ PostgreSQL connection failed in Production:", err);
    }
    return false;
  }
}

// Development In-Memory Preview Cache (READ-ONLY preview when DB is not configured locally)
let devPreviewStore: {
  plan: MealPlanItem;
  shopping: ShoppingListItem[];
  logs: Map<string, { status: MealStatus; completedAt?: Date }>;
  weights: WeightRecord[];
} | null = null;

function getDevPreviewStore(): typeof devPreviewStore {
  if (devPreviewStore) return devPreviewStore;

  const seed = getInitialSeedPlan(getBangkokTodayString());
  const planId = "plan_seed_preview";

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

  const initialLogs = new Map<string, { status: MealStatus; completedAt?: Date }>();
  if (days[0]?.meals[0]) {
    initialLogs.set(`${days[0].meals[0].id}::${days[0].date}`, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
  }

  devPreviewStore = {
    plan,
    shopping: aggregateMealPlanIngredients(days),
    logs: initialLogs,
    weights: [
      { id: "w1", date: "2026-09-01", weightKg: 78.0, note: "เริ่มคุมอาหาร", createdAt: new Date().toISOString() },
      { id: "w2", date: "2026-09-07", weightKg: 77.2, note: "จบสัปดาห์ที่ 1", createdAt: new Date().toISOString() },
      { id: "w3", date: "2026-09-14", weightKg: 76.5, note: "ชั่งเช้าวันจันทร์", createdAt: new Date().toISOString() },
    ],
  };

  return devPreviewStore;
}

// ==========================================
// DATA ACCESS IMPLEMENTATION (END-TO-END)
// ==========================================

export async function getActiveMealPlan(dateStr = getBangkokTodayString()): Promise<MealPlanItem | null> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    let plan = await prisma.mealPlan.findFirst({
      where: {
        userId: DEFAULT_USER_ID,
        isActive: true,
      },
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

    // If database has no plan, auto-seed the initial 7-day plan
    if (!plan) {
      await seedDatabase();
      plan = await prisma.mealPlan.findFirst({
        where: {
          userId: DEFAULT_USER_ID,
          isActive: true,
        },
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
    }

    if (!plan) return null;

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
  }

  // In Production: Never pretend database exists when disconnected
  if (getIsProduction()) {
    throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้ กรุณาตรวจสอบ DATABASE_URL");
  }

  // In Development only: Return demo seed preview
  const devStore = getDevPreviewStore()!;
  return {
    ...devStore.plan,
    days: devStore.plan.days.map((day) => ({
      ...day,
      meals: day.meals.map((m) => {
        const log = devStore.logs.get(`${m.id}::${day.date}`);
        return {
          ...m,
          status: log?.status || "PENDING",
        };
      }),
    })),
  };
}

export async function getMealsForDate(dateStr = getBangkokTodayString()): Promise<{
  dayLabel: string;
  meals: MealItem[];
  planName: string;
  isDbLive: boolean;
}> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const plan = await getActiveMealPlan(dateStr);
    if (!plan || plan.days.length === 0) {
      return { dayLabel: getDayLabelFromDate(dateStr), meals: [], planName: "", isDbLive: true };
    }

    let targetDay = plan.days.find((d) => d.date === dateStr);
    if (!targetDay) {
      const label = getDayLabelFromDate(dateStr);
      targetDay = plan.days.find((d) => d.label === label) || plan.days[0];
    }

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
      isDbLive: true,
    };
  }

  if (getIsProduction()) {
    throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้");
  }

  // Dev Demo Preview
  const devStore = getDevPreviewStore()!;
  const targetDay = devStore.plan.days[0];
  const mealsWithStatus = targetDay.meals.map((m) => {
    const log = devStore.logs.get(`${m.id}::${dateStr}`);
    return {
      ...m,
      status: log?.status || "PENDING",
    };
  });

  return {
    dayLabel: targetDay.label,
    meals: mealsWithStatus,
    planName: devStore.plan.name,
    isDbLive: false,
  };
}

export async function getMealDetail(mealId: string, dateStr = getBangkokTodayString()): Promise<MealItem | null> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
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
  }

  if (getIsProduction()) {
    throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้");
  }

  const devStore = getDevPreviewStore()!;
  for (const day of devStore.plan.days) {
    const found = day.meals.find((m) => m.id === mealId);
    if (found) {
      const log = devStore.logs.get(`${found.id}::${dateStr}`);
      return {
        ...found,
        status: log?.status || "PENDING",
      };
    }
  }

  return null;
}

/**
 * Update Meal Status (PENDING, COMPLETED, SKIPPED)
 * MUST succeed in PostgreSQL before returning success.
 */
export async function setMealStatus(
  mealId: string,
  dateStr: string,
  newStatus: MealStatus
): Promise<MealStatus> {
  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถบันทึกสถานะได้เนื่องจากไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL");
    }
    const store = getDevPreviewStore()!;
    store.logs.set(`${mealId}::${dateStr}`, {
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
    });
    return newStatus;
  }

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
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : null,
    },
  });

  return newStatus;
}

export async function toggleMealStatus(
  mealId: string,
  dateStr = getBangkokTodayString()
): Promise<MealStatus> {
  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้");
    }
    const store = getDevPreviewStore()!;
    const log = store.logs.get(`${mealId}::${dateStr}`);
    const nextStatus: MealStatus =
      log?.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    return await setMealStatus(mealId, dateStr, nextStatus);
  }

  const existing = await prisma.mealLog.findUnique({
    where: {
      mealId_date: {
        mealId,
        date: dateStr,
      },
    },
  });

  const nextStatus: MealStatus =
    existing?.status === "COMPLETED" ? "PENDING" : "COMPLETED";

  return await setMealStatus(mealId, dateStr, nextStatus);
}

export async function getShoppingItems(planId?: string): Promise<ShoppingListItem[]> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const plan = await prisma.mealPlan.findFirst({
      where: planId
        ? { id: planId, userId: DEFAULT_USER_ID }
        : { userId: DEFAULT_USER_ID, isActive: true },
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
  }

  if (getIsProduction()) {
    throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล PostgreSQL ได้");
  }

  const devStore = getDevPreviewStore()!;
  return devStore.shopping;
}

export async function updateShoppingItemStatus(
  ingredientName: string,
  unit: string,
  newStatus: ShoppingStatus
): Promise<void> {
  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถอัปเดตวัตถุดิบได้เนื่องจากฐานข้อมูลไม่พร้อมใช้งาน");
    }
    const store = getDevPreviewStore()!;
    const item = store.shopping.find(
      (i) => i.ingredientName === ingredientName && i.unit === unit
    );
    if (item) {
      item.status = newStatus;
    }
    return;
  }

  const activePlan = await prisma.mealPlan.findFirst({
    where: { userId: DEFAULT_USER_ID, isActive: true },
  });

  if (!activePlan) {
    throw new Error("ไม่พบแผนอาหารที่กำลังใช้งาน");
  }

  await prisma.shoppingItem.updateMany({
    where: {
      mealPlanId: activePlan.id,
      ingredientName,
      unit,
    },
    data: { status: newStatus },
  });
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

    let dayMealsCount = dayData?.meals.length || 0;
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

  // Calculate streak from week history
  let streak = 0;
  for (let i = weekDaysStatus.length - 1; i >= 0; i--) {
    const d = weekDaysStatus[i];
    if (d.completed > 0) {
      streak++;
    } else if (!d.isToday) {
      break;
    }
  }

  return {
    todayCompleted,
    todayTotal,
    todayPercentage: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
    weekCompleted,
    weekTotal,
    weekPercentage: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
    currentStreak: streak,
    weekDaysStatus,
  };
}

export async function getWeightLogs(): Promise<WeightRecord[]> {
  const dbConnected = await isDatabaseConnected();

  if (dbConnected) {
    const logs = await prisma.weightLog.findMany({
      where: { userId: DEFAULT_USER_ID },
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
  }

  if (getIsProduction()) {
    throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
  }

  const devStore = getDevPreviewStore()!;
  return devStore.weights;
}

export async function addWeightLog(
  dateStr = getBangkokTodayString(),
  weightKg: number,
  note?: string
): Promise<WeightRecord> {
  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถบันทึกน้ำหนักได้เนื่องจากฐานข้อมูลไม่พร้อมใช้งาน");
    }
    const store = getDevPreviewStore()!;
    const entry: WeightRecord = {
      id: `weight_${Date.now()}`,
      date: dateStr,
      weightKg,
      note,
      createdAt: new Date().toISOString(),
    };
    store.weights.unshift(entry);
    return entry;
  }

  const created = await prisma.weightLog.create({
    data: {
      userId: DEFAULT_USER_ID,
      date: dateStr,
      weightKg,
      note,
    },
  });

  await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data: { currentWeight: weightKg },
  });

  return {
    id: created.id,
    date: created.date,
    weightKg: created.weightKg,
    note: created.note,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function getUserProfile(): Promise<UserProfile> {
  return await getCurrentUser();
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถแก้ไขโปรไฟล์ได้เนื่องจากฐานข้อมูลไม่พร้อมใช้งาน");
    }
    return {
      id: DEFAULT_USER_ID,
      name: profile.name || DEFAULT_USER_PROFILE.name,
      height: profile.height,
      currentWeight: profile.currentWeight,
      goalWeight: profile.goalWeight,
      breakfastTime: profile.breakfastTime || DEFAULT_USER_PROFILE.breakfastTime,
      lunchTime: profile.lunchTime || DEFAULT_USER_PROFILE.lunchTime,
      dinnerTime: profile.dinnerTime || DEFAULT_USER_PROFILE.dinnerTime,
    };
  }

  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {
      ...profile,
    },
    create: {
      id: DEFAULT_USER_ID,
      name: profile.name || DEFAULT_USER_PROFILE.name,
      height: profile.height,
      currentWeight: profile.currentWeight,
      goalWeight: profile.goalWeight,
      breakfastTime: profile.breakfastTime || DEFAULT_USER_PROFILE.breakfastTime,
      lunchTime: profile.lunchTime || DEFAULT_USER_PROFILE.lunchTime,
      dinnerTime: profile.dinnerTime || DEFAULT_USER_PROFILE.dinnerTime,
    },
  });

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

// ==========================================
// TRANSACTIONAL IMPORT & EXPORT
// ==========================================

export async function importMealPlan(
  data: MealPlanImportType,
  mode: "create" | "replace" = "replace"
): Promise<{ planId: string; daysCount: number; mealsCount: number }> {
  const daysCount = data.plan.days.length;
  let mealsCount = 0;
  for (const day of data.plan.days) {
    mealsCount += day.meals.length;
  }

  const dbConnected = await isDatabaseConnected();

  if (!dbConnected) {
    if (getIsProduction()) {
      throw new Error("ไม่สามารถนำเข้าข้อมูลได้เนื่องจากฐานข้อมูล PostgreSQL ไม่พร้อมใช้งาน");
    }
    const planId = `plan_imported_${Date.now()}`;
    const days: MealPlanDayItem[] = data.plan.days.map((d, dIdx) => ({
      id: `day_${dIdx + 1}`,
      mealPlanId: planId,
      dayIndex: d.day,
      date: d.date,
      label: d.label,
      meals: d.meals.map((m, mIdx) => ({
        id: `meal_${dIdx + 1}_${mIdx + 1}`,
        mealPlanDayId: `day_${dIdx + 1}`,
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
          id: `ing_${iIdx}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
        })),
        instructions: m.instructions.map((inst, iIdx) => ({
          id: `inst_${iIdx}`,
          step: iIdx + 1,
          text: inst,
        })),
        tags: m.tags.map((t, tIdx) => ({
          id: `tag_${tIdx}`,
          name: t,
        })),
        status: "PENDING",
      })),
    }));

    devPreviewStore = {
      plan: {
        id: planId,
        name: data.plan.name,
        description: data.plan.description,
        startDate: data.plan.startDate,
        endDate: data.plan.days[data.plan.days.length - 1]?.date,
        isActive: true,
        days,
      },
      shopping: aggregateMealPlanIngredients(days),
      logs: new Map(),
      weights: devPreviewStore?.weights || [],
    };

    return { planId, daysCount, mealsCount };
  }

  // Ensure default user exists before inserting plan
  await getCurrentUser();

  // Transactional import with Prisma
  return await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      await tx.mealPlan.updateMany({
        where: { userId: DEFAULT_USER_ID, isActive: true },
        data: { isActive: false },
      });
    }

    const createdPlan = await tx.mealPlan.create({
      data: {
        userId: DEFAULT_USER_ID,
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

    // Generate and save shopping items inside transaction
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

    return { planId: createdPlan.id, daysCount, mealsCount };
  });
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
