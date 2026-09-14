"use server";

import { revalidatePath } from "next/cache";
import {
  updateShoppingItemStatus,
  importMealPlan,
  exportMealPlan,
} from "@/lib/repository";
import { ShoppingStatus } from "@/types/meal";

export async function updateShoppingStatusAction(
  name: string,
  unit: string,
  status: ShoppingStatus
): Promise<{ success: boolean }> {
  try {
    await updateShoppingItemStatus(name, unit, status);
    revalidatePath("/ingredients");
    return { success: true };
  } catch (err) {
    console.error("Failed to update shopping item:", err);
    return { success: false };
  }
}

export async function resetShoppingListAction(): Promise<{ success: boolean }> {
  try {
    const current = await exportMealPlan();
    await importMealPlan(current, "replace");
    revalidatePath("/ingredients");
    return { success: true };
  } catch (err) {
    console.error("Failed to reset shopping list:", err);
    return { success: false };
  }
}
