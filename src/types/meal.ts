export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type MealStatus = "PENDING" | "COMPLETED" | "SKIPPED";
export type ShoppingStatus = "NEEDED" | "HAVE" | "PURCHASED";

export interface NutritionInfo {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

export interface IngredientItem {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  category?: string | null;
}

export interface InstructionItem {
  id?: string;
  step: number;
  text: string;
}

export interface TagItem {
  id?: string;
  name: string;
}

export interface MealItem {
  id: string;
  mealPlanDayId: string;
  externalId?: string | null;
  type: MealType;
  time: string;
  name: string;
  description?: string | null;
  prepTimeMinutes?: number | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  ingredients: IngredientItem[];
  instructions: InstructionItem[];
  tags: TagItem[];
  status?: MealStatus; // Calculated from MealLog for given date
}

export interface MealPlanDayItem {
  id: string;
  mealPlanId: string;
  dayIndex: number;
  date: string; // YYYY-MM-DD
  label: string; // จันทร์, etc.
  meals: MealItem[];
}

export interface MealPlanItem {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  days: MealPlanDayItem[];
}

export interface ShoppingListItem {
  id?: string;
  ingredientName: string;
  amount: number;
  unit: string;
  category?: string | null;
  status: ShoppingStatus;
  sources?: { mealName: string; dayLabel: string; amount: number }[];
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  note?: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  height?: number | null;
  currentWeight?: number | null;
  goalWeight?: number | null;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

export interface ProgressSummary {
  todayCompleted: number;
  todayTotal: number;
  todayPercentage: number;
  weekCompleted: number;
  weekTotal: number;
  weekPercentage: number;
  currentStreak: number;
  weekDaysStatus: {
    date: string;
    label: string;
    completed: number;
    total: number;
    isAllDone: boolean;
    isToday: boolean;
  }[];
}
