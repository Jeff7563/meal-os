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
import { MealImage } from "@/components/ui/MealImage";
import { setMealStatusAction } from "@/lib/meal-log/actions";
import { useToast } from "@/components/ui/toast";

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
      toast(`บันทึกว่ากินมื้อ "${meal.name}" แล้ว ✓`, "success");
    } else if (nextStatus === "SKIPPED") {
      toast(`ข้ามมื้อ "${meal.name}" แล้ว`, "info");
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
    <div className="max-w-[760px] mx-auto pb-32 space-y-6">
      {/* Top Nav Back button */}
      <div className="flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-[14px] hover:bg-[var(--border-soft)] transition-colors"
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
          className="p-2 rounded-[14px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-soft)] transition-colors"
          aria-label="แชร์เมนูอาหาร"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Recipe Hero: Large Meal Visual */}
      <div className="rounded-[24px] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <MealImage
          type={meal.type}
          alt={meal.name}
          aspectRatio="16/9"
          className="w-full h-56 sm:h-72 object-cover rounded-none"
        />

        <div className="p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <MealTypeBadge type={meal.type} time={meal.time} />
            {meal.prepTimeMinutes != null && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--background-soft)] px-2.5 py-1 rounded-full border border-[var(--border-soft)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{meal.prepTimeMinutes} นาที</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {meal.name}
          </h1>

          {meal.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {meal.description}
            </p>
          )}
        </div>
      </div>

      {/* Nutrition Breakdown Card */}
      {hasNutrition && (
        <section className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3.5">
            ข้อมูลโภชนาการ (Nutrition)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {meal.calories != null && (
              <div className="p-3 rounded-[16px] bg-[var(--orange-extra-soft)] border border-[var(--orange-soft)]">
                <Flame className="w-4 h-4 mx-auto text-[var(--orange-primary)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)] block">แคลอรี</span>
                <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {Math.round(meal.calories)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">kcal</span>
              </div>
            )}
            {meal.protein != null && (
              <div className="p-3 rounded-[16px] bg-[var(--green-extra-soft)] border border-[var(--green-soft)]">
                <Dumbbell className="w-4 h-4 mx-auto text-[var(--green-primary)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)] block">โปรตีน</span>
                <span className="text-base sm:text-lg font-bold text-[var(--green-dark)]">
                  {meal.protein}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">กรัม</span>
              </div>
            )}
            {meal.carbs != null && (
              <div className="p-3 rounded-[16px] bg-[#F7F6EE] dark:bg-[#25241C] border border-[#EBE8D4] dark:border-[#38372A]">
                <Wheat className="w-4 h-4 mx-auto text-[#8F8745] mb-1" />
                <span className="text-xs text-[var(--text-secondary)] block">คาร์บ</span>
                <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {meal.carbs}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">กรัม</span>
              </div>
            )}
            {meal.fat != null && (
              <div className="p-3 rounded-[16px] bg-[var(--red-soft)] border border-[#EED7D2] dark:border-[#422B27]">
                <Droplet className="w-4 h-4 mx-auto text-[var(--red-text)] mb-1" />
                <span className="text-xs text-[var(--text-secondary)] block">ไขมัน</span>
                <span className="text-base sm:text-lg font-bold text-[var(--red-text)]">
                  {meal.fat}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">กรัม</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ingredients Section: simple list + divider */}
      <section className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-soft)]">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[var(--green-primary)]" />
            <span>วัตถุดิบที่ต้องใช้</span>
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {meal.ingredients.length} รายการ
          </span>
        </div>

        <ul className="divide-y divide-[var(--border-soft)]">
          {meal.ingredients.map((ing, idx) => (
            <li key={idx} className="py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {ing.name}
              </span>
              <span className="text-sm font-semibold font-mono text-[var(--green-dark)]">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions Section: numbered soft-green circle */}
      {meal.instructions && meal.instructions.length > 0 && (
        <section className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-soft)]">
            วิธีทำ (ขั้นตอน)
          </h2>
          <ol className="space-y-4">
            {meal.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3.5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--green-soft)] text-[var(--green-dark)] font-bold text-xs flex items-center justify-center mt-0.5">
                  {step.step || idx + 1}
                </span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tags Section */}
      {meal.tags && meal.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          {meal.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-normal px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] z-30 max-w-[760px] mx-auto md:bottom-4 md:rounded-[20px] md:border shadow-lg flex items-center gap-3">
        {isCompleted ? (
          <>
            <div className="flex-1 h-12 rounded-[14px] font-bold text-sm bg-[var(--green-soft)] text-[var(--green-dark)] border border-[var(--green-primary)]/40 flex items-center justify-center gap-2">
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>✓ กินแล้ว</span>
            </div>
            <button
              onClick={() => handleSetStatus("PENDING")}
              disabled={isPending}
              className="h-12 px-4 rounded-[14px] font-semibold text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] flex items-center gap-1.5 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo</span>
            </button>
          </>
        ) : isSkipped ? (
          <>
            <div className="flex-1 h-12 rounded-[14px] font-medium text-sm bg-[var(--background-soft)] text-[var(--text-muted)] border border-[var(--border-soft)] flex items-center justify-center gap-2">
              <FastForward className="w-4 h-4" />
              <span>ข้ามมื้อนี้แล้ว</span>
            </div>
            <button
              onClick={() => handleSetStatus("PENDING")}
              disabled={isPending}
              className="h-12 px-4 rounded-[14px] font-semibold text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] flex items-center gap-1.5 transition-colors"
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
              className="h-12 px-4 rounded-[14px] font-semibold text-xs border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] flex items-center gap-1.5 transition-colors"
            >
              <FastForward className="w-4 h-4" />
              <span>ข้ามมื้อ</span>
            </button>
            <button
              onClick={() => handleSetStatus("COMPLETED")}
              disabled={isPending}
              className="flex-1 h-12 rounded-[14px] font-bold text-sm bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
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
