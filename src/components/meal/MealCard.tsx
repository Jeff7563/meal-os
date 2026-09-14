"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, Flame, Dumbbell, FastForward, Undo2 } from "lucide-react";
import { MealItem, MealStatus } from "@/types/meal";
import { MealTypeBadge } from "@/components/meal/MealTypeBadge";
import { setMealStatusAction } from "@/lib/meal-log/actions";
import { useToast } from "@/components/ui/toast";
import confetti from "canvas-confetti";

interface MealCardProps {
  meal: MealItem;
  dateStr: string;
  onStatusChange?: (newStatus: MealStatus) => void;
}

export function MealCard({ meal, dateStr, onStatusChange }: MealCardProps) {
  const [status, setStatus] = useState<MealStatus>(meal.status || "PENDING");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isCompleted = status === "COMPLETED";
  const isSkipped = status === "SKIPPED";

  const handleSetStatus = (nextStatus: MealStatus, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const prevStatus = status;
    // 1. Optimistic UI update
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    if (nextStatus === "COMPLETED") {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        });
      } catch {}
      toast(`กินมื้อ "${meal.name}" เรียบร้อยแล้ว ✓`, "success");
    } else if (nextStatus === "SKIPPED") {
      toast(`ข้ามมื้อ "${meal.name}" เรียบร้อย`, "info");
    } else {
      toast(`ยกเลิกสถานะมื้อ "${meal.name}"`, "info");
    }

    // 2. Server save with strict rollback on failure
    startTransition(async () => {
      const res = await setMealStatusAction(meal.id, dateStr, nextStatus);
      if (!res.success) {
        // Rollback UI
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast(res.error || "เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล", "error");
      }
    });
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
        isCompleted
          ? "border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-90"
          : isSkipped
          ? "border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 opacity-70"
          : "border-slate-200/80 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <MealTypeBadge type={meal.type} time={meal.time} />
          {meal.prepTimeMinutes && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              {meal.prepTimeMinutes} นาที
            </span>
          )}
        </div>

        {/* Completion Checkbox Button (44px min touch target) */}
        <button
          onClick={(e) => handleSetStatus(isCompleted ? "PENDING" : "COMPLETED", e)}
          disabled={isPending}
          aria-label={isCompleted ? "ยกเลิกสถานะกินแล้ว" : "ทำเครื่องหมายว่ากินแล้ว"}
          className={`shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-all duration-200 ${
            isCompleted
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 scale-105 hover:bg-emerald-700"
              : isSkipped
              ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
              : "border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent hover:text-emerald-500/40 bg-slate-50 dark:bg-slate-800/50"
          }`}
        >
          {isCompleted ? (
            <Check className="w-5 h-5 stroke-[3]" />
          ) : isSkipped ? (
            <FastForward className="w-4 h-4" />
          ) : (
            <Check className="w-5 h-5 opacity-0" />
          )}
        </button>
      </div>

      {/* Main Content clickable to Detail */}
      <Link
        href={`/meals/${meal.id}?date=${dateStr}`}
        className="block mt-3 focus:outline-none group/link"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={`text-base md:text-lg font-bold transition-colors ${
              isCompleted
                ? "text-slate-700 dark:text-slate-300 line-through decoration-emerald-500/60"
                : isSkipped
                ? "text-slate-400 line-through"
                : "text-slate-900 dark:text-white group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400"
            }`}
          >
            {meal.name}
          </h3>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
        </div>

        {meal.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {meal.description}
          </p>
        )}

        {/* Nutrition Badges (Hide if null) */}
        {(meal.calories || meal.protein) && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            {meal.calories != null && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                <Flame className="w-3 h-3 text-amber-500" />
                {Math.round(meal.calories)} kcal
              </span>
            )}
            {meal.protein != null && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <Dumbbell className="w-3 h-3 text-emerald-500" />
                โปรตีน {Math.round(meal.protein)}g
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Bottom Action Controls: กินแล้ว / ข้ามมื้อ / Undo */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span className="text-[11px] font-medium text-slate-400">
          {isCompleted
            ? "✓ กินแล้ว"
            : isSkipped
            ? "ข้ามมื้อนี้"
            : "ยังไม่ได้กิน"}
        </span>

        <div className="flex items-center gap-1.5">
          {isCompleted || isSkipped ? (
            <button
              onClick={(e) => handleSetStatus("PENDING", e)}
              disabled={isPending}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          ) : (
            <>
              <button
                onClick={(e) => handleSetStatus("SKIPPED", e)}
                disabled={isPending}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                ข้ามมื้อ
              </button>
              <button
                onClick={(e) => handleSetStatus("COMPLETED", e)}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>กินแล้ว</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
