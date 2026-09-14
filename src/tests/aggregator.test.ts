import { describe, it, expect } from "vitest";
import {
  aggregateIngredients,
  normalizeIngredientName,
  normalizeUnit,
  RawIngredient,
} from "@/lib/shopping/aggregator";

describe("Ingredient Aggregation Algorithm Tests", () => {
  it("should combine ingredients with the same name and same unit correctly", () => {
    // Example from user spec:
    // อกไก่: Monday 200g, Tuesday 180g, Friday 200g -> Total 580g
    const ingredients: RawIngredient[] = [
      { name: "อกไก่", amount: 200, unit: "g", category: "protein", dayLabel: "จันทร์" },
      { name: "อกไก่", amount: 180, unit: "g", category: "protein", dayLabel: "อังคาร" },
      { name: "อกไก่", amount: 200, unit: "g", category: "protein", dayLabel: "ศุกร์" },
    ];

    const result = aggregateIngredients(ingredients);
    expect(result.length).toBe(1);
    expect(result[0].ingredientName).toBe("อกไก่");
    expect(result[0].amount).toBe(580);
    expect(result[0].unit).toBe("g");
    expect(result[0].sources?.length).toBe(3);
  });

  it("should KEEP ingredients with DIFFERENT units SEPARATED", () => {
    // Example from user spec:
    // ข้าว 200 g กับ ข้าว 1 ทัพพี ให้แยก
    const ingredients: RawIngredient[] = [
      { name: "ข้าวสวย", amount: 200, unit: "g", category: "carb" },
      { name: "ข้าวสวย", amount: 1, unit: "ทัพพี", category: "carb" },
    ];

    const result = aggregateIngredients(ingredients);
    expect(result.length).toBe(2);

    const gramItem = result.find((i) => i.unit === "g");
    const thapPhiItem = result.find((i) => i.unit === "ทัพพี");

    expect(gramItem).toBeDefined();
    expect(gramItem?.amount).toBe(200);

    expect(thapPhiItem).toBeDefined();
    expect(thapPhiItem?.amount).toBe(1);
  });

  it("should trim whitespace so '  อกไก่  ' combines with 'อกไก่'", () => {
    const ingredients: RawIngredient[] = [
      { name: "  อกไก่  ", amount: 150, unit: "g", category: "protein" },
      { name: "อกไก่", amount: 250, unit: "g", category: "protein" },
    ];

    const result = aggregateIngredients(ingredients);
    expect(result.length).toBe(1);
    expect(result[0].ingredientName).toBe("อกไก่");
    expect(result[0].amount).toBe(400);
  });

  it("should be case-insensitive for English ingredient names ('Egg' and 'egg')", () => {
    const ingredients: RawIngredient[] = [
      { name: "Egg", amount: 2, unit: "ฟอง", category: "protein" },
      { name: "egg", amount: 3, unit: "ฟอง", category: "protein" },
    ];

    const result = aggregateIngredients(ingredients);
    expect(result.length).toBe(1);
    expect(result[0].amount).toBe(5);
    expect(result[0].unit).toBe("ฟอง");
  });

  it("should keep 1000 g and 1 kg separate to avoid unit conversion bugs in V1", () => {
    const ingredients: RawIngredient[] = [
      { name: "อกไก่", amount: 1000, unit: "g", category: "protein" },
      { name: "อกไก่", amount: 1, unit: "kg", category: "protein" },
    ];

    const result = aggregateIngredients(ingredients);
    expect(result.length).toBe(2);
    const gItem = result.find((i) => i.unit === "g");
    const kgItem = result.find((i) => i.unit === "kg");
    expect(gItem?.amount).toBe(1000);
    expect(kgItem?.amount).toBe(1);
  });

  it("should support diverse Thai units (ฟอง, ลูก, หัว, แพ็ก, ช้อนชา, ช้อนโต๊ะ)", () => {
    const ingredients: RawIngredient[] = [
      { name: "ไข่", amount: 2, unit: "ฟอง", category: "protein" },
      { name: "ไข่", amount: 3, unit: "ฟอง", category: "protein" },
      { name: "แตงกวา", amount: 1, unit: "ลูก", category: "vegetable" },
      { name: "แตงกวา", amount: 2, unit: "ลูก", category: "vegetable" },
      { name: "กะหล่ำปลี", amount: 0.5, unit: "หัว", category: "vegetable" },
      { name: "กะหล่ำปลี", amount: 0.5, unit: "หัว", category: "vegetable" },
      { name: "ซีอิ๊วขาว", amount: 1, unit: "ช้อนโต๊ะ", category: "seasoning" },
      { name: "พริกไทย", amount: 2, unit: "ช้อนชา", category: "seasoning" },
    ];

    const result = aggregateIngredients(ingredients);

    const egg = result.find((i) => i.ingredientName === "ไข่");
    expect(egg?.amount).toBe(5);
    expect(egg?.unit).toBe("ฟอง");

    const cucumber = result.find((i) => i.ingredientName === "แตงกวา");
    expect(cucumber?.amount).toBe(3);
    expect(cucumber?.unit).toBe("ลูก");

    const cabbage = result.find((i) => i.ingredientName === "กะหล่ำปลี");
    expect(cabbage?.amount).toBe(1);
    expect(cabbage?.unit).toBe("หัว");
  });

  it("should normalize ingredient strings properly", () => {
    expect(normalizeIngredientName("   สันในไก่   ")).toBe("สันในไก่");
    expect(normalizeIngredientName("Chicken   Breast")).toBe("Chicken Breast");
    expect(normalizeUnit("  g  ")).toBe("g");
  });
});
