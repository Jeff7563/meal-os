"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, Flame, Dumbbell } from "lucide-react";
import { MealItem, MealStatus } from "@/types/meal";
import { MealTypeBadge } from "@/components/meal/MealTypeBadge";
import { toggleMealCompleteAction } from "@/lib/meal-log/actions";
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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextStatus: MealStatus = isCompleted ? "PENDING" : "COMPLETED";
    // Optimistic UI update
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    if (nextStatus === "COMPLETED") {
      // Confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        });
      } catch {
        // ignore if canvas-confetti is not supported in env
      }
      toast(`กินมื้อ "${meal.name}" เรียบร้อยแล้ว ✓`, "success");
    } else {
      toast(`ยกเลิกสถานะกินแล้วของมื้อ "${meal.name}"`, "info");
    }

    startTransition(async () => {
      const res = await toggleMealCompleteAction(meal.id, dateStr);
      if (!res.success) {
        // Rollback optimistic state
        setStatus(status);
        onStatusChange?.(status);
        toast("เกิดข้อผิดพลาดในการบันทึกสถานะ", "error");
      }
    });
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
        isCompleted
          ? "border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-85"
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
          onClick={handleToggle}
          disabled={isPending}
          aria-label={isCompleted ? "ทำเครื่องหมายว่ายังไม่ได้กิน" : "ทำเครื่องหมายว่ากินแล้ว"}
          className={`shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-all duration-200 ${
            isCompleted
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 scale-105 hover:bg-emerald-700"
              : "border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent hover:text-emerald-500/40 bg-slate-50 dark:bg-slate-800/50"
          }`}
        >
          <Check className={`w-5 h-5 stroke-[3] ${isCompleted ? "opacity-100" : "opacity-0"}`} />
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

        {/* Nutrition Badges */}
        {(meal.calories || meal.protein) && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            {meal.calories && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                <Flame className="w-3 h-3 text-amber-500" />
                {Math.round(meal.calories)} kcal
              </span>
            )}
            {meal.protein && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <Dumbbell className="w-3 h-3 text-emerald-500" />
                โปรตีน {Math.round(meal.protein)}g
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Bottom Quick Action: "กินแล้ว ✓" */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span className="text-[11px] font-medium text-slate-400">
          {isCompleted ? "บันทึกเรียบร้อย" : "ยังไม่ได้กิน"}
        </span>
        <button
          onClick={handleToggle}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            isCompleted
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-emerald-600 hover:text-white"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isCompleted ? "กินแล้ว ✓" : "กินแล้ว"}</span>
        </button>
      </div>
    </div>
  );
}
