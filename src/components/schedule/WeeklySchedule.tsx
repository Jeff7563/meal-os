"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarX2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { MealPlanItem } from "@/types/meal";
import { MealTypeBadge } from "@/components/meal/MealTypeBadge";
import {
  addDaysToDateString,
  formatThaiDateShort,
  getBangkokTodayString,
  getWeekDates,
} from "@/lib/date-utils";

interface WeeklyScheduleProps {
  initialPlan: MealPlanItem | null;
}

export function WeeklySchedule({ initialPlan }: WeeklyScheduleProps) {
  const todayStr = getBangkokTodayString();
  const [currentDateStr, setCurrentDateStr] = useState(todayStr);
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");

  const handlePrevWeek = () => {
    setCurrentDateStr((prev) => addDaysToDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDateStr((prev) => addDaysToDateString(prev, 7));
  };

  const handleToday = () => {
    setCurrentDateStr(todayStr);
  };

  // Compute 7 calendar dates for the active week
  const weekDates = getWeekDates(currentDateStr);
  const weekStartDate = weekDates[0].date;
  const weekEndDate = weekDates[6].date;

  // Match days that exist in the plan
  const weekDaysWithData = weekDates.map((wDay) => {
    const matchedDay = initialPlan?.days.find((d) => d.date === wDay.date);
    return {
      date: wDay.date,
      label: wDay.label,
      dayIndex: wDay.dayIndex,
      planDay: matchedDay || null,
    };
  });

  const hasAnyMealsInWeek = weekDaysWithData.some(
    (w) => w.planDay && w.planDay.meals.length > 0
  );

  const selectedDay =
    weekDaysWithData.find((w) => w.date === currentDateStr)?.planDay ||
    weekDaysWithData.find((w) => w.planDay !== null)?.planDay ||
    null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            ตารางอาหาร
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
            สัปดาห์นี้ {formatThaiDateShort(weekStartDate, false)} – {formatThaiDateShort(weekEndDate)}
          </p>
        </div>

        {/* Top Controls: Nav & View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-[var(--background-soft)] border border-[var(--border)] rounded-[14px]">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                viewMode === "weekly"
                  ? "bg-[var(--surface-white)] text-[var(--green-dark)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              รายสัปดาห์
            </button>
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                viewMode === "daily"
                  ? "bg-[var(--surface-white)] text-[var(--green-dark)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              รายวัน
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-[14px]">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-[10px] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] transition-colors"
              title="สัปดาห์ก่อนหน้า"
              aria-label="สัปดาห์ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border-soft)] rounded-[10px] transition-colors"
            >
              สัปดาห์นี้
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-[10px] hover:bg-[var(--border-soft)] text-[var(--text-secondary)] transition-colors"
              title="สัปดาห์ถัดไป"
              aria-label="สัปดาห์ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!hasAnyMealsInWeek ? (
        <div className="p-12 text-center rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
          <CalendarX2 className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            สัปดาห์นี้ยังไม่มีแผนอาหาร
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
            ไม่พบรายการอาหารสำหรับช่วงสัปดาห์ที่เลือก สามารถนำเข้าตารางอาหารใหม่หรือกลับไปดูสัปดาห์ปัจจุบัน
          </p>
          <div className="pt-2 flex items-center justify-center gap-2.5">
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors"
            >
              กลับสู่สัปดาห์นี้
            </button>
            <Link
              href="/settings/import"
              className="px-4 py-2 rounded-[14px] text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)] transition-colors"
            >
              นำเข้าตารางใหม่
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: WEEKLY 2-COLUMN LAYOUT (Warm & Readable, No Cramped 7-col) */}
          {viewMode === "weekly" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weekDaysWithData.map((item) => {
                const isToday = item.date === todayStr;
                const day = item.planDay;
                const hasMeals = day && day.meals.length > 0;

                return (
                  <div
                    key={item.date}
                    className={`rounded-[20px] border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                      isToday
                        ? "bg-[var(--surface-white)] border-[var(--orange-primary)]/60 shadow-xs ring-1 ring-[var(--orange-primary)]/30"
                        : "bg-[var(--surface)] border-[var(--border)]"
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)] mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">
                            วัน{item.label}
                          </h3>
                          {isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--orange-soft)] text-[#8A551E] dark:text-[#E7AD55]">
                              วันนี้
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-normal text-[var(--text-muted)]">
                          {formatThaiDateShort(item.date, false)}
                        </span>
                      </div>

                      {/* Meal Rows */}
                      {hasMeals ? (
                        <div className="space-y-2">
                          {day.meals.map((meal) => {
                            const isDone = meal.status === "COMPLETED";

                            return (
                              <Link
                                key={meal.id}
                                href={`/meals/${meal.id}?date=${day.date}`}
                                className={`flex items-center justify-between p-3 rounded-[14px] border transition-colors group ${
                                  isDone
                                    ? "bg-[var(--green-extra-soft)] border-[var(--green-soft)]"
                                    : "bg-[var(--background-soft)] border-[var(--border-soft)] hover:border-[var(--green-primary)]/50"
                                }`}
                              >
                                <div className="space-y-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                      {meal.type === "BREAKFAST"
                                        ? "เช้า"
                                        : meal.type === "LUNCH"
                                        ? "กลางวัน"
                                        : meal.type === "DINNER"
                                        ? "เย็น"
                                        : "ของว่าง"}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                      {meal.time}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-xs sm:text-sm font-medium line-clamp-1 transition-colors ${
                                      isDone
                                        ? "text-[var(--text-muted)] line-through"
                                        : "text-[var(--text-primary)] group-hover:text-[var(--green-primary)]"
                                    }`}
                                  >
                                    {meal.name}
                                  </p>
                                </div>

                                <div className="shrink-0 flex items-center gap-1">
                                  {isDone && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--green-dark)] bg-[var(--green-soft)] px-2 py-0.5 rounded-md">
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic py-4 text-center">
                          ไม่มีรายการอาหาร
                        </p>
                      )}
                    </div>

                    {day && (
                      <div className="mt-4 pt-2.5 border-t border-[var(--border-soft)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>{day.meals.length} มื้อ</span>
                        <button
                          onClick={() => {
                            setCurrentDateStr(day.date);
                            setViewMode("daily");
                          }}
                          className="text-[var(--green-primary)] hover:text-[var(--green-dark)] font-medium flex items-center gap-1"
                        >
                          ดูรายวัน <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: DAILY VIEW */}
          {viewMode === "daily" && selectedDay && (
            <div className="max-w-[650px] mx-auto space-y-4">
              {/* Day selection pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {weekDaysWithData.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setCurrentDateStr(d.date)}
                    className={`shrink-0 px-3.5 py-2 rounded-[14px] text-xs font-semibold transition-all ${
                      selectedDay.date === d.date
                        ? "bg-[var(--green-primary)] text-white shadow-xs"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-soft)]"
                    }`}
                  >
                    วัน{d.label}
                  </button>
                ))}
              </div>

              {/* Day Card */}
              <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    วัน{selectedDay.label}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {formatThaiDateShort(selectedDay.date)}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {selectedDay.meals.map((meal) => (
                    <Link
                      key={meal.id}
                      href={`/meals/${meal.id}?date=${selectedDay.date}`}
                      className="flex items-center justify-between p-3.5 rounded-[14px] border border-[var(--border)] bg-[var(--background-soft)] hover:border-[var(--green-primary)] transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MealTypeBadge type={meal.type} time={meal.time} />
                          {meal.prepTimeMinutes != null && (
                            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meal.prepTimeMinutes} นาที
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--green-primary)] transition-colors">
                          {meal.name}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--green-primary)] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
