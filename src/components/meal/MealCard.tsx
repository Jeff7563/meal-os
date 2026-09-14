"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Undo2, MoreHorizontal, FastForward, Clock } from "lucide-react";
import { MealItem, MealStatus } from "@/types/meal";
import { MealTypeBadge } from "@/components/meal/MealTypeBadge";
import { MealImage } from "@/components/ui/MealImage";
import { NutritionLine } from "@/components/meal/NutritionLine";
import { setMealStatusAction } from "@/lib/meal-log/actions";
import { useToast } from "@/components/ui/toast";

interface MealCardProps {
  meal: MealItem;
  dateStr: string;
  onStatusChange?: (newStatus: MealStatus) => void;
}

export function MealCard({ meal, dateStr, onStatusChange }: MealCardProps) {
  const [status, setStatus] = useState<MealStatus>(meal.status || "PENDING");
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  const isCompleted = status === "COMPLETED";
  const isSkipped = status === "SKIPPED";

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSetStatus = (nextStatus: MealStatus, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMenu(false);

    const prevStatus = status;
    // Optimistic UI update
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    if (nextStatus === "COMPLETED") {
      toast(`บันทึกว่ากินมื้อ "${meal.name}" แล้ว ✓`, "success");
    } else if (nextStatus === "SKIPPED") {
      toast(`ข้ามมื้อ "${meal.name}" แล้ว`, "info");
    } else {
      toast(`ยกเลิกสถานะมื้อ "${meal.name}"`, "info");
    }

    // Server save with rollback
    startTransition(async () => {
      const res = await setMealStatusAction(meal.id, dateStr, nextStatus);
      if (!res.success) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast(res.error || "เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล", "error");
      }
    });
  };

  return (
    <article
      className={`relative rounded-[20px] border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? "bg-[var(--green-extra-soft)] border-[var(--green-primary)]/40 shadow-xs"
          : isSkipped
          ? "bg-[var(--background-soft)] border-[var(--border-soft)] opacity-80"
          : "bg-[var(--surface)] border-[var(--border)] shadow-[0_2px_8px_rgba(40,34,25,0.03)] hover:shadow-[0_4px_16px_rgba(40,34,25,0.05)]"
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start gap-4 sm:gap-5">
        {/* Left / Top: Meal Image Placeholder (1:1 or 4:3) */}
        <div className="w-full md:w-44 md:shrink-0">
          <Link
            href={`/meals/${meal.id}?date=${dateStr}`}
            className="block group/img focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-[16px]"
            tabIndex={-1}
            aria-hidden="true"
          >
            <MealImage
              type={meal.type}
              alt={meal.name}
              aspectRatio="4/3"
              className="w-full md:h-32 transition-transform duration-200 group-hover/img:scale-[1.02]"
            />
          </Link>
        </div>

        {/* Right / Center: Meal Information */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {/* Top Bar: Meal Type + Time + More Action */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <MealTypeBadge type={meal.type} time={meal.time} />
                {meal.prepTimeMinutes != null && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-normal">
                    <Clock className="w-3 h-3" />
                    {meal.prepTimeMinutes} นาที
                  </span>
                )}
              </div>

              {/* More menu for Skip action */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-soft)] transition-colors"
                  aria-label="ตัวเลือกเพิ่มเติม"
                  title="ตัวเลือกเพิ่มเติม"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--surface-white)] rounded-xl border border-[var(--border)] shadow-md py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={(e) =>
                        handleSetStatus(isSkipped ? "PENDING" : "SKIPPED", e)
                      }
                      disabled={isPending}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--background-soft)] flex items-center gap-2"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{isSkipped ? "ยกเลิกการข้าม" : "ข้ามมื้อนี้"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Meal Title & Link */}
            <Link
              href={`/meals/${meal.id}?date=${dateStr}`}
              className="block group/link focus:outline-none"
            >
              <h3
                className={`text-[17px] sm:text-lg font-semibold tracking-tight transition-colors ${
                  isCompleted
                    ? "text-[var(--green-dark)]"
                    : isSkipped
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-primary)] group-hover/link:text-[var(--green-primary)]"
                }`}
              >
                {meal.name}
              </h3>

              {meal.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                  {meal.description}
                </p>
              )}
            </Link>

            {/* Nutrition Inline */}
            {(meal.calories != null || meal.protein != null) && (
              <div className="mt-2.5">
                <NutritionLine
                  calories={meal.calories}
                  protein={meal.protein}
                  showAll={false}
                />
              </div>
            )}
          </div>

          {/* Bottom Actions: รายละเอียด (Secondary) & กินแล้ว (Primary) */}
          <div className="mt-4 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between gap-2 flex-wrap">
            {/* Status indicator on the left */}
            <div className="flex items-center gap-2">
              <Link
                href={`/meals/${meal.id}?date=${dateStr}`}
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-[12px] text-xs font-medium border border-[var(--border)] bg-[var(--surface-white)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] hover:text-[var(--text-primary)] transition-colors"
              >
                รายละเอียด
              </Link>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--green-dark)] bg-[var(--green-soft)] px-3 py-1.5 rounded-[12px]">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>✓ กินแล้ว</span>
                  </span>
                  <button
                    onClick={(e) => handleSetStatus("PENDING", e)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-[12px] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                </>
              ) : isSkipped ? (
                <>
                  <span className="text-xs text-[var(--text-muted)] font-medium px-2 py-1">
                    ข้ามมื้อนี้
                  </span>
                  <button
                    onClick={(e) => handleSetStatus("PENDING", e)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-[12px] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => handleSetStatus("COMPLETED", e)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-all shadow-xs active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>กินแล้ว</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
