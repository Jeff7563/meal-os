"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Utensils,
  Share2,
  FastForward,
  Undo2,
} from "lucide-react";
import { MealItem, MealStatus } from "@/types/meal";
import { MealTypeBadge } from "@/components/meal/MealTypeBadge";
import { setMealStatusAction } from "@/lib/meal-log/actions";
import { useToast } from "@/components/ui/toast";
import confetti from "canvas-confetti";

interface MealDetailViewProps {
  meal: MealItem;
  dateStr: string;
}

export function MealDetailView({ meal, dateStr }: MealDetailViewProps) {
  const [status, setStatus] = useState<MealStatus>(meal.status || "PENDING");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isCompleted = status === "COMPLETED";
  const isSkipped = status === "SKIPPED";

  const handleSetStatus = (nextStatus: MealStatus) => {
    const prevStatus = status;
    setStatus(nextStatus);

    if (nextStatus === "COMPLETED") {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        });
      } catch {}
      toast(`บันทึกว่ากินมื้อ "${meal.name}" เรียบร้อยแล้ว ✓`, "success");
    } else if (nextStatus === "SKIPPED") {
      toast(`ข้ามมื้อ "${meal.name}" เรียบร้อย`, "info");
    } else {
      toast(`ยกเลิกสถานะมื้อ "${meal.name}"`, "info");
    }

    startTransition(async () => {
      const res = await setMealStatusAction(meal.id, dateStr, nextStatus);
      if (!res.success) {
        setStatus(prevStatus);
        toast(res.error || "เกิดข้อผิดพลาดในการบันทึกสถานะ", "error");
      }
    });
  };

  const hasNutrition =
    meal.calories != null || meal.protein != null || meal.carbs != null || meal.fat != null;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* Top Nav Back button */}
      <div className="flex items-center justify-between py-3 mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </Link>
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              toast("คัดลอกลิงก์เมนูแล้ว", "info");
            }
          }}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="แชร์เมนูอาหาร"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Placeholder / Banner */}
      <div className="relative w-full h-44 md:h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 flex flex-col justify-end p-6 text-white shadow-md mb-6">
        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white/90">
          Personal Meal Plan
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <MealTypeBadge type={meal.type} time={meal.time} className="shadow-sm" />
            {meal.prepTimeMinutes != null && (
              <span className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {meal.prepTimeMinutes} นาที
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            {meal.name}
          </h1>
          {meal.description && (
            <p className="text-xs md:text-sm text-white/80 mt-1 line-clamp-2">
              {meal.description}
            </p>
          )}
        </div>
      </div>

      {/* Nutrition Breakdown Card (Strictly hide fields if null) */}
      {hasNutrition && (
        <section className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            ข้อมูลโภชนาการ (Nutrition)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {meal.calories != null && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/50">
                <Flame className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 block">แคลอรี</span>
                <span className="text-sm md:text-base font-bold text-amber-700 dark:text-amber-300">
                  {Math.round(meal.calories)}
                </span>
                <span className="text-[10px] text-slate-400 block">kcal</span>
              </div>
            )}
            {meal.protein != null && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50">
                <Dumbbell className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 block">โปรตีน</span>
                <span className="text-sm md:text-base font-bold text-emerald-700 dark:text-emerald-300">
                  {meal.protein}
                </span>
                <span className="text-[10px] text-slate-400 block">กรัม</span>
              </div>
            )}
            {meal.carbs != null && (
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-900/50">
                <Wheat className="w-4 h-4 mx-auto text-sky-500 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 block">คาร์บ</span>
                <span className="text-sm md:text-base font-bold text-sky-700 dark:text-sky-300">
                  {meal.carbs}
                </span>
                <span className="text-[10px] text-slate-400 block">กรัม</span>
              </div>
            )}
            {meal.fat != null && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/50">
                <Droplet className="w-4 h-4 mx-auto text-rose-500 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 block">ไขมัน</span>
                <span className="text-sm md:text-base font-bold text-rose-700 dark:text-rose-300">
                  {meal.fat}
                </span>
                <span className="text-[10px] text-slate-400 block">กรัม</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ingredients Section */}
      <section className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>วัตถุดิบที่ต้องใช้</span>
          </h2>
          <span className="text-xs text-slate-400">
            {meal.ingredients.length} รายการ
          </span>
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {meal.ingredients.map((ing, idx) => (
            <li key={idx} className="py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {ing.name}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions Section */}
      {meal.instructions && meal.instructions.length > 0 && (
        <section className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            วิธีทำ (ขั้นตอน)
          </h2>
          <ol className="space-y-3">
            {meal.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center mt-0.5">
                  {step.step || idx + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tags Section */}
      {meal.tags && meal.tags.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {meal.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Fixed Bottom Action Controls: กินแล้ว / ข้ามมื้อ / Undo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 max-w-2xl mx-auto md:bottom-4 md:rounded-2xl md:border shadow-xl flex items-center gap-3">
        {isCompleted ? (
          <>
            <div className="flex-1 h-12 rounded-xl font-bold text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2">
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>✓ กินแล้ว</span>
            </div>
            <button
              onClick={() => handleSetStatus("PENDING")}
              disabled={isPending}
              className="h-12 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>
          </>
        ) : isSkipped ? (
          <>
            <div className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
              <FastForward className="w-4 h-4" />
              <span>ข้ามมื้อนี้แล้ว</span>
            </div>
            <button
              onClick={() => handleSetStatus("PENDING")}
              disabled={isPending}
              className="h-12 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleSetStatus("SKIPPED")}
              disabled={isPending}
              className="h-12 px-4 rounded-xl font-semibold text-xs border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <FastForward className="w-4 h-4" />
              <span>ข้ามมื้อ</span>
            </button>
            <button
              onClick={() => handleSetStatus("COMPLETED")}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>✓ กินแล้ว</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
