"use server";

import { revalidatePath } from "next/cache";
import { updateUserProfile, importMealPlan } from "@/lib/repository";
import { UserProfile } from "@/types/meal";
import { getInitialSeedPlan } from "@/lib/seed-data";
import { getBangkokTodayString } from "@/lib/date-utils";

export async function saveProfileSettingsAction(
  data: Partial<UserProfile>
): Promise<{ success: boolean }> {
  try {
    await updateUserProfile(data);
    revalidatePath("/settings");
    revalidatePath("/progress");
    return { success: true };
  } catch (err) {
    console.error("Failed to update profile settings:", err);
    return { success: false };
  }
}

export async function resetToDefaultPlanAction(): Promise<{ success: boolean }> {
  try {
    const seed = getInitialSeedPlan(getBangkokTodayString());
    await importMealPlan(seed, "replace");
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/ingredients");
    revalidatePath("/progress");
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Failed to reset default plan:", err);
    return { success: false };
  }
}
