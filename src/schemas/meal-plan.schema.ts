import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"], {
  message: "ประเภทมื้อต้องเป็น breakfast, lunch, dinner หรือ snack",
});

export const IngredientInputSchema = z.object({
  name: z.string().trim().min(1, "ชื่อวัตถุดิบต้องไม่ว่างเปล่า"),
  amount: z.number().positive("ปริมาณวัตถุดิบต้องมากกว่า 0"),
  unit: z.string().trim().min(1, "หน่วยของวัตถุดิบต้องไม่ว่างเปล่า"),
  category: z.string().trim().optional().default("other"),
});

export const NutritionSchema = z
  .object({
    calories: z.number().nonnegative("แคลอรีต้องไม่ติดลบ").optional().nullable(),
    protein: z.number().nonnegative("โปรตีนต้องไม่ติดลบ").optional().nullable(),
    carbs: z.number().nonnegative("คาร์บต้องไม่ติดลบ").optional().nullable(),
    fat: z.number().nonnegative("ไขมันต้องไม่ติดลบ").optional().nullable(),
  })
  .optional();

export const MealInputSchema = z.object({
  externalId: z.string().optional(),
  type: z.string().toLowerCase().pipe(MealTypeSchema),
  time: z.string().regex(timeRegex, "รูปแบบเวลาต้องเป็น HH:mm (เช่น 07:30)"),
  name: z.string().trim().min(1, "ชื่อเมนูต้องไม่ว่างเปล่า"),
  description: z.string().optional().default(""),
  prepTime: z.number().nonnegative("เวลาเตรียมต้องไม่ติดลบ").optional().default(15),
  nutrition: NutritionSchema,
  ingredients: z.array(IngredientInputSchema).min(1, "ต้องมีวัตถุดิบอย่างน้อย 1 รายการ"),
  instructions: z.array(z.string().trim()).default([]),
  tags: z.array(z.string().trim()).default([]),
});

export const DayInputSchema = z.object({
  day: z.number().int().min(1).max(7, "ลำดับวันต้องอยู่ระหว่าง 1 - 7"),
  label: z.string().trim().min(1, "ป้ายชื่อวันต้องไม่ว่างเปล่า"),
  date: z.string().regex(dateRegex, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"),
  meals: z.array(MealInputSchema).min(1, "ต้องมีมื้ออาหารอย่างน้อย 1 มื้อในแต่ละวัน"),
});

export const PlanInputSchema = z.object({
  name: z.string().trim().min(1, "ชื่อแผนอาหารต้องไม่ว่างเปล่า"),
  description: z.string().optional().default(""),
  startDate: z.string().regex(dateRegex, "startDate ต้องเป็นรูปแบบ YYYY-MM-DD"),
  days: z.array(DayInputSchema).min(1, "ต้องมีข้อมูลตารางอาหารอย่างน้อย 1 วัน"),
});

export const MealPlanImportSchema = z.object({
  version: z.literal("1.0", {
    message: 'เวอร์ชันต้องเป็น "1.0"',
  }),
  plan: PlanInputSchema,
});

export type MealPlanImportType = z.infer<typeof MealPlanImportSchema>;
export type PlanInputType = z.infer<typeof PlanInputSchema>;
export type DayInputType = z.infer<typeof DayInputSchema>;
export type MealInputType = z.infer<typeof MealInputSchema>;
export type IngredientInputType = z.infer<typeof IngredientInputSchema>;

/**
 * Format Zod errors into user-friendly Thai error messages
 * Example: Day 3 > Lunch > ingredient[2]: Missing field amount
 */
export function formatFriendlyValidationError(error: z.ZodError): string[] {
  const issues = error.issues || [];
  return issues.map((err) => {
    const pathParts = (err.path || []).map((segment) => {
      if (typeof segment === "number") {
        return `[${segment + 1}]`;
      }
      if (segment === "days") return "วัน";
      if (segment === "meals") return "มื้ออาหาร";
      if (segment === "ingredients") return "วัตถุดิบ";
      if (segment === "instructions") return "วิธีทำ";
      if (segment === "plan") return "แผน";
      return String(segment);
    });

    const path = pathParts.join(" > ");
    return `${path ? path + ": " : ""}${err.message}`;
  });
}
