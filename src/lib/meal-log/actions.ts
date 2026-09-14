"use server";

import { revalidatePath } from "next/cache";
import { toggleMealStatus } from "@/lib/repository";
import { MealStatus } from "@/types/meal";
import { getBangkokTodayString } from "@/lib/date-utils";

export async function toggleMealCompleteAction(
  mealId: string,
  dateStr = getBangkokTodayString()
): Promise<{ success: boolean; newStatus: MealStatus }> {
  try {
    const newStatus = await toggleMealStatus(mealId, dateStr);
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/progress");
    revalidatePath(`/meals/${mealId}`);
    return { success: true, newStatus };
  } catch (err: unknown) {
    console.error("Failed to toggle meal status:", err);
    return { success: false, newStatus: "PENDING" };
  }
}
