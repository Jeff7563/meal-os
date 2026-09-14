"use server";

import { revalidatePath } from "next/cache";
import { addWeightLog } from "@/lib/repository";
import { getBangkokTodayString } from "@/lib/date-utils";

export async function logWeightAction(
  weightKg: number,
  note?: string,
  dateStr = getBangkokTodayString()
): Promise<{ success: boolean }> {
  try {
    if (!weightKg || weightKg <= 0 || weightKg > 400) {
      return { success: false };
    }
    await addWeightLog(dateStr, weightKg, note);
    revalidatePath("/progress");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Failed to log weight:", err);
    return { success: false };
  }
}
