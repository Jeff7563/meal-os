import { describe, it, expect } from "vitest";
import {
  MealPlanImportSchema,
  formatFriendlyValidationError,
} from "@/schemas/meal-plan.schema";
import { getInitialSeedPlan } from "@/lib/seed-data";

describe("JSON Schema Validation Tests", () => {
  it("should successfully validate standard 7-day seed JSON plan", () => {
    const validPlan = getInitialSeedPlan("2026-09-14");
    const result = MealPlanImportSchema.safeParse(validPlan);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe("1.0");
      expect(result.data.plan.days.length).toBe(7);
      expect(result.data.plan.days[0].meals.length).toBe(3);
    }
  });

  it("should fail validation if version is not 1.0", () => {
    const invalidPlan: Record<string, unknown> = {
      ...getInitialSeedPlan("2026-09-14"),
      version: "2.0",
    };

    const result = MealPlanImportSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
    if (!result.success) {
      const friendlyErrors = formatFriendlyValidationError(result.error);
      expect(friendlyErrors.some((e) => e.includes("เวอร์ชัน"))).toBe(true);
    }
  });

  it("should fail validation and pinpoint missing ingredient amount", () => {
    const brokenPlan = getInitialSeedPlan("2026-09-14");
    // Set negative amount in day 1, meal 1, ingredient 1
    brokenPlan.plan.days[0].meals[0].ingredients[0].amount = -5;

    const result = MealPlanImportSchema.safeParse(brokenPlan);
    expect(result.success).toBe(false);
    if (!result.success) {
      const friendly = formatFriendlyValidationError(result.error);
      expect(friendly.some((msg) => msg.includes("ปริมาณวัตถุดิบต้องมากกว่า 0"))).toBe(true);
    }
  });

  it("should fail validation if date format is not YYYY-MM-DD", () => {
    const invalidDatePlan = getInitialSeedPlan("2026-09-14");
    invalidDatePlan.plan.startDate = "14/09/2026";

    const result = MealPlanImportSchema.safeParse(invalidDatePlan);
    expect(result.success).toBe(false);
    if (!result.success) {
      const friendly = formatFriendlyValidationError(result.error);
      expect(friendly.some((msg) => msg.includes("YYYY-MM-DD"))).toBe(true);
    }
  });
});
