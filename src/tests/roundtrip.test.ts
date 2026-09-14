import { describe, it, expect } from "vitest";
import { validateMealPlanJsonAction } from "@/lib/import/actions";
import { getInitialSeedPlan } from "@/lib/seed-data";

describe("Export / Import Round-trip Verification", () => {
  it("should ensure exported plan JSON can be imported without loss of data", async () => {
    // 1. Simulate an exported plan from seed
    const seed = getInitialSeedPlan("2026-09-14");
    const exportedPayload = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      plan: seed.plan,
    };

    // 2. Serialize as would happen in /api/export
    const exportedJson = JSON.stringify(exportedPayload, null, 2);

    // 3. Round-trip through validation action
    const validationResult = await validateMealPlanJsonAction(exportedJson);

    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);
    expect(validationResult.data).toBeDefined();

    const imported = validationResult.data!;
    expect(imported.version).toBe("1.0");
    expect(imported.plan.name).toBe(seed.plan.name);
    expect(imported.plan.startDate).toBe(seed.plan.startDate);
    expect(imported.plan.days.length).toBe(seed.plan.days.length);

    // Verify day 1 meal 1 details (macros, ingredients, instructions, tags)
    const originalMeal = seed.plan.days[0].meals[0];
    const importedMeal = imported.plan.days[0].meals[0];

    expect(importedMeal.name).toBe(originalMeal.name);
    expect(importedMeal.nutrition?.calories).toBe(originalMeal.nutrition?.calories);
    expect(importedMeal.nutrition?.protein).toBe(originalMeal.nutrition?.protein);
    expect(importedMeal.nutrition?.carbs).toBe(originalMeal.nutrition?.carbs);
    expect(importedMeal.nutrition?.fat).toBe(originalMeal.nutrition?.fat);
    expect(importedMeal.prepTime).toBe(originalMeal.prepTime);
    expect(importedMeal.ingredients.length).toBe(originalMeal.ingredients.length);
    expect(importedMeal.instructions.length).toBe(originalMeal.instructions.length);
    expect(importedMeal.tags).toEqual(originalMeal.tags);
  });
});
