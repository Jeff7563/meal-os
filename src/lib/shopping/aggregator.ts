// Ingredient and Shopping List Aggregator
import { MealPlanDayItem, ShoppingListItem } from "@/types/meal";

export interface RawIngredient {
  name: string;
  amount: number;
  unit: string;
  category?: string | null;
  mealName?: string;
  dayLabel?: string;
}

/**
 * Normalizes an ingredient name for consistent grouping
 * e.g., " อกไก่  " -> "อกไก่", "Chicken Breast" -> "chicken breast"
 */
export function normalizeIngredientName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes unit string
 * e.g. "g" vs "กรัม", "kg" vs "กก."
 */
export function normalizeUnit(unit: string): string {
  const trimmed = unit.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "กรัม" || lower === "g" || lower === "gram" || lower === "grams") {
    return "g";
  }
  if (lower === "กิโลกรัม" || lower === "kg" || lower === "กก." || lower === "kilogram") {
    return "kg";
  }
  if (lower === "มิลลิลิตร" || lower === "ml" || lower === "มล.") {
    return "ml";
  }
  if (lower === "ลิตร" || lower === "l" || lower === "liter") {
    return "L";
  }
  return trimmed;
}

/**
 * Aggregates a list of ingredients:
 * Combines ingredients with the SAME name and SAME unit.
 * Keeps items with different units SEPARATE (e.g. ข้าว 200 g vs ข้าว 1 ทัพพี).
 */
export function aggregateIngredients(ingredients: RawIngredient[]): ShoppingListItem[] {
  // Key: normalizedName + "::" + normalizedUnit
  const map = new Map<string, ShoppingListItem>();

  for (const item of ingredients) {
    if (!item.name || typeof item.amount !== "number" || isNaN(item.amount) || item.amount <= 0) {
      continue;
    }

    const normName = normalizeIngredientName(item.name);
    const normUnit = normalizeUnit(item.unit);
    const key = `${normName.toLowerCase()}::${normUnit.toLowerCase()}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.amount = Math.round((existing.amount + item.amount) * 100) / 100;
      if (item.mealName || item.dayLabel) {
        existing.sources = existing.sources || [];
        existing.sources.push({
          mealName: item.mealName || "",
          dayLabel: item.dayLabel || "",
          amount: item.amount,
        });
      }
    } else {
      map.set(key, {
        ingredientName: normName,
        amount: Math.round(item.amount * 100) / 100,
        unit: normUnit,
        category: item.category || "other",
        status: "NEEDED",
        sources:
          item.mealName || item.dayLabel
            ? [
                {
                  mealName: item.mealName || "",
                  dayLabel: item.dayLabel || "",
                  amount: item.amount,
                },
              ]
            : [],
      });
    }
  }

  // Convert map to sorted array
  const categoryOrder: Record<string, number> = {
    protein: 1,
    vegetable: 2,
    carb: 3,
    seasoning: 4,
    other: 5,
  };

  return Array.from(map.values()).sort((a, b) => {
    const catA = categoryOrder[a.category?.toLowerCase() || "other"] || 99;
    const catB = categoryOrder[b.category?.toLowerCase() || "other"] || 99;
    if (catA !== catB) return catA - catB;
    return a.ingredientName.localeCompare(b.ingredientName, "th");
  });
}

/**
 * Aggregates all ingredients across a meal plan's days
 */
export function aggregateMealPlanIngredients(days: MealPlanDayItem[]): ShoppingListItem[] {
  const rawList: RawIngredient[] = [];

  for (const day of days) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients) {
        rawList.push({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category,
          mealName: meal.name,
          dayLabel: day.label,
        });
      }
    }
  }

  return aggregateIngredients(rawList);
}
