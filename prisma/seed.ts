import { PrismaClient, MealType } from "@prisma/client";
import { getInitialSeedPlan } from "../src/lib/seed-data";
import { aggregateMealPlanIngredients } from "../src/lib/shopping/aggregator";
import { DEFAULT_USER_ID } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Upsert default user (V1 Single User Strategy)
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      name: "คุณเจฟฟี่",
      height: 175,
      currentWeight: 76.5,
      goalWeight: 68.0,
      breakfastTime: "07:30",
      lunchTime: "12:00",
      dinnerTime: "18:30",
    },
  });
  console.log(`👤 User ready: ${user.name} (${user.id})`);

  // 2. Check if active meal plan already exists
  const existingPlan = await prisma.mealPlan.findFirst({
    where: { userId: user.id, isActive: true },
  });

  if (!existingPlan) {
    const seedData = getInitialSeedPlan("2026-09-14");

    const createdPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        name: seedData.plan.name,
        description: seedData.plan.description,
        startDate: seedData.plan.startDate,
        endDate: seedData.plan.days[seedData.plan.days.length - 1]?.date,
        isActive: true,
      },
    });

    for (const day of seedData.plan.days) {
      const createdDay = await prisma.mealPlanDay.create({
        data: {
          mealPlanId: createdPlan.id,
          dayIndex: day.day,
          date: day.date,
          label: day.label,
        },
      });

      for (const meal of day.meals) {
        const createdMeal = await prisma.meal.create({
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

        if (meal.ingredients.length > 0) {
          await prisma.mealIngredient.createMany({
            data: meal.ingredients.map((ing) => ({
              mealId: createdMeal.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              category: ing.category,
            })),
          });
        }

        if (meal.instructions.length > 0) {
          await prisma.mealInstruction.createMany({
            data: meal.instructions.map((text, idx) => ({
              mealId: createdMeal.id,
              step: idx + 1,
              text,
            })),
          });
        }

        if (meal.tags.length > 0) {
          await prisma.mealTag.createMany({
            data: meal.tags.map((t) => ({
              mealId: createdMeal.id,
              name: t,
            })),
          });
        }
      }
    }

    // Generate and insert shopping items
    const fullPlan = await prisma.mealPlan.findUnique({
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
      const mappedDays = fullPlan.days.map((d) => ({
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
      await prisma.shoppingItem.createMany({
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

    console.log(`🥗 Meal plan seeded: ${createdPlan.name}`);
  } else {
    console.log("ℹ️ Active meal plan already exists, skipping plan seed.");
  }

  // 3. Seed weight logs if none exist
  const weightCount = await prisma.weightLog.count({
    where: { userId: user.id },
  });

  if (weightCount === 0) {
    await prisma.weightLog.createMany({
      data: [
        {
          userId: user.id,
          date: "2026-09-01",
          weightKg: 78.0,
          note: "เริ่มคุมอาหารจริงจัง",
        },
        {
          userId: user.id,
          date: "2026-09-07",
          weightKg: 77.2,
          note: "จบสัปดาห์ที่ 1",
        },
        {
          userId: user.id,
          date: "2026-09-14",
          weightKg: 76.5,
          note: "ชั่งเช้าวันจันทร์",
        },
      ],
    });
    console.log("⚖️ Weight logs seeded.");
  }

  console.log("✅ Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
