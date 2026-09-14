import React from "react";
import { getShoppingItems } from "@/lib/repository";
import { ShoppingList } from "@/components/ingredients/ShoppingList";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { ShoppingListItem } from "@/types/meal";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  let items: ShoppingListItem[] = [];
  let errorMsg: string | null = null;

  try {
    items = await getShoppingItems();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          เกิดข้อผิดพลาดในการโหลดรายการวัตถุดิบ
        </h1>
        <p className="text-xs text-slate-500">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              วัตถุดิบ & รายการช้อปปิ้ง (Ingredients)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ตรวจเช็กวัตถุดิบที่มีในตู้เย็น และรายการที่ต้องเตรียมซื้อสำหรับสัปดาห์นี้
          </p>
        </div>
      </div>

      {/* Shopping list interactive component */}
      <ShoppingList initialItems={items} />
    </div>
  );
}
