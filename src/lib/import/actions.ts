"use server";

import { revalidatePath } from "next/cache";
import {
  MealPlanImportSchema,
  MealPlanImportType,
  formatFriendlyValidationError,
} from "@/schemas/meal-plan.schema";
import { importMealPlan } from "@/lib/repository";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: MealPlanImportType;
  stats?: {
    planName: string;
    description?: string;
    startDate: string;
    endDate?: string;
    daysCount: number;
    mealsCount: number;
    ingredientsCount: number;
  };
}

export async function validateMealPlanJsonAction(rawJson: string): Promise<ValidationResult> {
  if (!rawJson || !rawJson.trim()) {
    return {
      valid: false,
      errors: ["กรุณาวางโค้ด JSON ของตารางอาหาร"],
    };
  }

  // Security check: Limit raw JSON length to 1MB
  if (rawJson.length > 1024 * 1024) {
    return {
      valid: false,
      errors: ["ขนาด JSON เกินขีดจำกัด 1 MB กรุณาลดขนาดข้อมูล"],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid JSON";
    return {
      valid: false,
      errors: [`รูปแบบ JSON ไม่ถูกต้อง: ${msg}`],
    };
  }

  const result = MealPlanImportSchema.safeParse(parsed);
  if (!result.success) {
    const friendlyErrors = formatFriendlyValidationError(result.error);
    return {
      valid: false,
      errors: friendlyErrors,
    };
  }

  const data = result.data;
  let totalMeals = 0;
  let totalIngredients = 0;
  for (const day of data.plan.days) {
    totalMeals += day.meals.length;
    for (const meal of day.meals) {
      totalIngredients += meal.ingredients.length;
    }
  }

  const endDate = data.plan.days[data.plan.days.length - 1]?.date || data.plan.startDate;

  return {
    valid: true,
    errors: [],
    data,
    stats: {
      planName: data.plan.name,
      description: data.plan.description,
      startDate: data.plan.startDate,
      endDate,
      daysCount: data.plan.days.length,
      mealsCount: totalMeals,
      ingredientsCount: totalIngredients,
    },
  };
}

export async function executeImportAction(
  planData: MealPlanImportType,
  mode: "create" | "replace" = "replace"
): Promise<{ success: boolean; message: string; planId?: string }> {
  try {
    // Server-side re-validation
    const check = MealPlanImportSchema.safeParse(planData);
    if (!check.success) {
      return {
        success: false,
        message: "ข้อมูลไม่ผ่านการตรวจสอบความถูกต้อง",
      };
    }

    const { planId, daysCount, mealsCount } = await importMealPlan(check.data, mode);

    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/ingredients");
    revalidatePath("/progress");
    revalidatePath("/settings");

    return {
      success: true,
      message: `นำเข้าตารางอาหารสำเร็จ (${daysCount} วัน, ${mealsCount} มื้อ)`,
      planId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "ระบบยกเลิกการบันทึกทั้งหมด";
    console.error("Import error in server action:", err);
    return {
      success: false,
      message: `เกิดข้อผิดพลาดระหว่างนำเข้า: ${msg}`,
    };
  }
}
