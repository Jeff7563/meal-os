"use client";

import React, { useState, useTransition } from "react";
import {
  RotateCcw,
  Sparkles,
  Search,
  Check,
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
    if (!confirm("ต้องการรีเซ็ตสถานะรายการวัตถุดิบทั้งหมดใช่หรือไม่?")) return;
    startTransition(async () => {
      await resetShoppingListAction();
      toast("รีเซ็ตรายการวัตถุดิบสำเร็จ", "info");
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

  // Ordered Category list
  const categoryOrder = ["protein", "vegetable", "carb", "seasoning", "other"];
  const categoryLabels: Record<string, string> = {
    protein: "โปรตีน",
    vegetable: "ผัก",
    carb: "คาร์บ",
    seasoning: "เครื่องปรุง",
    other: "อื่น ๆ",
  };

  const neededCount = items.filter((i) => i.status === "NEEDED").length;
  const haveCount = items.filter((i) => i.status === "HAVE").length;
  const purchasedCount = items.filter((i) => i.status === "PURCHASED").length;

  return (
    <div className="space-y-6">
      {/* Top Summary Card (Clean Warm Minimal) */}
      <div className="p-5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
          <div>
            <span className="text-xs text-[var(--text-muted)] block">ต้องซื้อ</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--orange-primary)]">
              {neededCount}{" "}
              <span className="text-xs font-normal text-[var(--text-secondary)]">รายการ</span>
            </span>
          </div>
          <div className="h-8 w-px bg-[var(--border-soft)] hidden sm:block" />
          <div>
            <span className="text-xs text-[var(--text-muted)] block">มีแล้ว</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--green-dark)]">
              {haveCount}{" "}
              <span className="text-xs font-normal text-[var(--text-secondary)]">รายการ</span>
            </span>
          </div>
          {purchasedCount > 0 && (
            <>
              <div className="h-8 w-px bg-[var(--border-soft)] hidden sm:block" />
              <div>
                <span className="text-xs text-[var(--text-muted)] block">ซื้อแล้ว</span>
                <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {purchasedCount}{" "}
                  <span className="text-xs font-normal text-[var(--text-secondary)]">รายการ</span>
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleReset}
          disabled={isPending}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-soft)] border border-[var(--border)] transition-colors"
          title="รีเซ็ตสถานะทั้งหมด"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ต</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Search Bar: Soft surface, no heavy border */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาวัตถุดิบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-[16px] text-sm bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)] placeholder-[var(--text-muted)] transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`shrink-0 px-3.5 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-[var(--green-primary)] text-white font-semibold shadow-xs"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-soft)]"
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("NEEDED")}
            className={`shrink-0 px-3.5 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
              activeTab === "NEEDED"
                ? "bg-[var(--orange-primary)] text-white font-semibold shadow-xs"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-soft)]"
            }`}
          >
            ต้องซื้อ ({neededCount})
          </button>
          <button
            onClick={() => setActiveTab("HAVE")}
            className={`shrink-0 px-3.5 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
              activeTab === "HAVE"
                ? "bg-[var(--green-dark)] text-white font-semibold shadow-xs"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-soft)]"
            }`}
          >
            มีอยู่แล้ว ({haveCount})
          </button>
          <button
            onClick={() => setActiveTab("PURCHASED")}
            className={`shrink-0 px-3.5 py-1.5 rounded-[12px] text-xs font-medium transition-all ${
              activeTab === "PURCHASED"
                ? "bg-[var(--green-primary)] text-white font-semibold shadow-xs"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--background-soft)]"
            }`}
          >
            ซื้อแล้ว ({purchasedCount})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 px-4 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <Sparkles className="w-8 h-8 text-[var(--orange-primary)] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            ยังไม่มีวัตถุดิบที่ต้องซื้อ 🎉
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
            วัตถุดิบทั้งหมดมีอยู่แล้วหรือได้เตรียมไว้เรียบร้อย
          </p>
        </div>
      )}

      {/* Categorized Lists */}
      {categoryOrder.map((catKey) => {
        const catItems = categories[catKey];
        if (!catItems || catItems.length === 0) return null;
        const catTitle = categoryLabels[catKey] || "อื่น ๆ";

        return (
          <div
            key={catKey}
            className="rounded-[20px] bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 shadow-xs"
          >
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-soft)]">
              {catTitle}
            </h3>

            <div className="divide-y divide-[var(--border-soft)]">
              {catItems.map((item, idx) => {
                const isPurchased = item.status === "PURCHASED";
                const isHave = item.status === "HAVE";

                return (
                  <div
                    key={`${item.ingredientName}-${item.unit}-${idx}`}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`text-sm font-medium ${
                            isPurchased
                              ? "line-through text-[var(--text-muted)]"
                              : "text-[var(--text-primary)]"
                          }`}
                        >
                          {item.ingredientName}
                        </span>
                        <span className="text-xs font-semibold font-mono text-[var(--green-dark)]">
                          {item.amount} {item.unit}
                        </span>
                      </div>
                      {item.sources && item.sources.length > 1 && (
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          (ใช้ใน {item.sources.length} มื้อตลอดสัปดาห์)
                        </p>
                      )}
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            item,
                            isHave ? "NEEDED" : "HAVE"
                          )
                        }
                        className={`min-h-[36px] px-2.5 rounded-[10px] text-xs font-medium border transition-colors flex items-center gap-1 ${
                          isHave
                            ? "bg-[var(--green-soft)] text-[var(--green-dark)] border-[var(--green-primary)]/40 font-semibold"
                            : "bg-[var(--surface-white)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--green-primary)]"
                        }`}
                        title="มีวัตถุดิบนี้อยู่ในตู้เย็นแล้ว"
                      >
                        {isHave && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{isHave ? "มีแล้ว ✓" : "มีแล้ว"}</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            item,
                            isPurchased ? "NEEDED" : "PURCHASED"
                          )
                        }
                        className={`min-h-[36px] px-2.5 rounded-[10px] text-xs font-medium border transition-colors flex items-center gap-1 ${
                          isPurchased
                            ? "bg-[var(--green-primary)] text-white border-[var(--green-primary)] font-semibold shadow-xs"
                            : "bg-[var(--surface-white)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--green-primary)]"
                        }`}
                        title="ซื้อวัตถุดิบนี้เรียบร้อย"
                      >
                        {isPurchased && <Check className="w-3 h-3 stroke-[2.5]" />}
                        <span>{isPurchased ? "ซื้อแล้ว ✓" : "ซื้อแล้ว"}</span>
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
