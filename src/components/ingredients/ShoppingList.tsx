"use client";

import React, { useState, useTransition } from "react";
import {
  RotateCcw,
  Sparkles,
  Search,
} from "lucide-react";
import { ShoppingListItem, ShoppingStatus } from "@/types/meal";
import { updateShoppingStatusAction, resetShoppingListAction } from "@/lib/shopping/actions";
import { useToast } from "@/components/ui/toast";

interface ShoppingListProps {
  initialItems: ShoppingListItem[];
}

export function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"all" | ShoppingStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (
    item: ShoppingListItem,
    newStatus: ShoppingStatus
  ) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.ingredientName === item.ingredientName && i.unit === item.unit
          ? { ...i, status: newStatus }
          : i
      )
    );

    const statusText =
      newStatus === "PURCHASED"
        ? "ซื้อแล้ว"
        : newStatus === "HAVE"
        ? "มีอยู่แล้ว"
        : "ต้องซื้อ";
    toast(`${item.ingredientName}: ${statusText} เรียบร้อย`, "success");

    startTransition(async () => {
      const res = await updateShoppingStatusAction(
        item.ingredientName,
        item.unit,
        newStatus
      );
      if (!res.success) {
        toast("เกิดข้อผิดพลาดในการปรับสถานะ", "error");
      }
    });
  };

  const handleReset = () => {
    if (!confirm("ต้องการรีเซ็ตสถานะรายการช้อปปิ้งทั้งหมดหรือไม่?")) return;
    startTransition(async () => {
      await resetShoppingListAction();
      toast("รีเซ็ตรายการช้อปปิ้งสำเร็จ", "info");
      window.location.reload();
    });
  };

  // Filter items
  const filtered = items.filter((item) => {
    const matchStatus = activeTab === "all" || item.status === activeTab;
    const matchSearch =
      item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Group by category
  const categories: Record<string, ShoppingListItem[]> = {};
  for (const item of filtered) {
    const cat = item.category || "other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  }

  const categoryLabels: Record<string, { label: string; color: string }> = {
    protein: { label: "🥩 โปรตีน (Protein)", color: "text-rose-600 dark:text-rose-400" },
    vegetable: { label: "🥦 ผักสด (Vegetables)", color: "text-emerald-600 dark:text-emerald-400" },
    carb: { label: "🍚 คาร์โบไฮเดรต (Carbs)", color: "text-amber-600 dark:text-amber-400" },
    seasoning: { label: "🧂 เครื่องปรุง (Seasonings)", color: "text-sky-600 dark:text-sky-400" },
    other: { label: "📦 วัตถุดิบอื่นๆ (Others)", color: "text-slate-600 dark:text-slate-400" },
  };

  const neededCount = items.filter((i) => i.status === "NEEDED").length;
  const haveCount = items.filter((i) => i.status === "HAVE").length;
  const purchasedCount = items.filter((i) => i.status === "PURCHASED").length;

  return (
    <div className="space-y-6 pb-24">
      {/* Top Summary Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            รายการวัตถุดิบรวมทั้งสัปดาห์
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            รวมวัตถุดิบชื่อเดียวกันและหน่วยเดียวกันโดยอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="รีเซ็ตสถานะทั้งหมด"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("NEEDED")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "NEEDED"
                ? "bg-amber-600 text-white"
                : "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            ต้องซื้อ ({neededCount})
          </button>
          <button
            onClick={() => setActiveTab("HAVE")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "HAVE"
                ? "bg-sky-600 text-white"
                : "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            มีอยู่แล้ว ({haveCount})
          </button>
          <button
            onClick={() => setActiveTab("PURCHASED")}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "PURCHASED"
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            ซื้อแล้ว ({purchasedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาวัตถุดิบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            ไม่มีของที่ต้องซื้อ 🎉
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            วัตถุดิบทั้งหมดมีอยู่แล้วหรือได้ซื้อเตรียมไว้เรียบร้อย
          </p>
        </div>
      )}

      {/* Categorized Lists */}
      {Object.entries(categories).map(([catKey, catItems]) => {
        const catInfo = categoryLabels[catKey] || categoryLabels.other;

        return (
          <div
            key={catKey}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm"
          >
            <h3 className={`text-sm font-bold mb-3 ${catInfo.color}`}>
              {catInfo.label}
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {catItems.map((item, idx) => {
                const isPurchased = item.status === "PURCHASED";
                const isHave = item.status === "HAVE";

                return (
                  <div
                    key={`${item.ingredientName}-${item.unit}-${idx}`}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isPurchased
                              ? "line-through text-slate-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {item.ingredientName}
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {item.amount} {item.unit}
                        </span>
                      </div>
                      {item.sources && item.sources.length > 1 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          (ใช้ใน {item.sources.length} มื้อตลอดทั้งสัปดาห์)
                        </p>
                      )}
                    </div>

                    {/* Status Action Buttons (44px min touch targets) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            item,
                            isHave ? "NEEDED" : "HAVE"
                          )
                        }
                        className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          isHave
                            ? "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-sky-400"
                        }`}
                        title="มีวัตถุดิบนี้อยู่ในตู้เย็นแล้ว"
                      >
                        {isHave ? "มีแล้ว ✓" : "มีแล้ว"}
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            item,
                            isPurchased ? "NEEDED" : "PURCHASED"
                          )
                        }
                        className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          isPurchased
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                        }`}
                        title="ซื้อวัตถุดิบนี้เรียบร้อย"
                      >
                        {isPurchased ? "ซื้อแล้ว ✓" : "ซื้อแล้ว"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
