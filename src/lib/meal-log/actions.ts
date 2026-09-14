"use server";

import { revalidatePath } from "next/cache";
import { setMealStatus, toggleMealStatus } from "@/lib/repository";
import { MealStatus } from "@/types/meal";
import { getBangkokTodayString } from "@/lib/date-utils";

export async function toggleMealCompleteAction(
  mealId: string,
  dateStr = getBangkokTodayString()
): Promise<{ success: boolean; newStatus: MealStatus; error?: string }> {
  try {
    const newStatus = await toggleMealStatus(mealId, dateStr);
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/progress");
    revalidatePath(`/meals/${mealId}`);
    return { success: true, newStatus };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกสถานะ";
    console.error("Failed to toggle meal status:", err);
    return { success: false, newStatus: "PENDING", error: msg };
  }
}

export async function setMealStatusAction(
  mealId: string,
  dateStr: string,
  status: MealStatus
): Promise<{ success: boolean; newStatus: MealStatus; error?: string }> {
  try {
    const newStatus = await setMealStatus(mealId, dateStr, status);
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/progress");
    revalidatePath(`/meals/${mealId}`);
    return { success: true, newStatus };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกสถานะ";
    console.error("Failed to set meal status:", err);
    return { success: false, newStatus: "PENDING", error: msg };
  }
}
