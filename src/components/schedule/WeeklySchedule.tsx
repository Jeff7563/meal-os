"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  ArrowRight,
  CalendarX2,
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
  initialPlan: MealPlanItem;
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

  // Filter days that actually exist in the database for this specific week
  const weekDaysWithData = weekDates.map((wDay) => {
    const matchedDay = initialPlan.days.find((d) => d.date === wDay.date);
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
    <div className="space-y-6 pb-24">
      {/* Top Controls: View Mode & Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "weekly"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            รายสัปดาห์ (Weekly)
          </button>
          <button
            onClick={() => setViewMode("daily")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "daily"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            รายวัน (Daily)
          </button>
        </div>

        {/* Date / Week navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="สัปดาห์ก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            สัปดาห์ปัจจุบัน
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="สัปดาห์ถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Date Range Subheader */}
      <div className="text-xs font-medium text-slate-500 px-1">
        ช่วงสัปดาห์: {formatThaiDateShort(weekStartDate, false)} - {formatThaiDateShort(weekEndDate)}
      </div>

      {/* EMPTY STATE IF NO DATA IN THIS WEEK */}
      {!hasAnyMealsInWeek ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <CalendarX2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            ไม่มีตารางอาหารสำหรับสัปดาห์นี้
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ไม่พบแผนอาหารที่ตรงกับช่วงวันที่เลือก คุณสามารถนำเข้าตารางใหม่ผ่าน JSON หรือกลับไปดูสัปดาห์ปัจจุบัน
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              กลับสู่สัปดาห์ปัจจุบัน
            </button>
            <Link
              href="/settings/import"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              นำเข้าตารางใหม่
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: WEEKLY VIEW (7 Days Grid) */}
          {viewMode === "weekly" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weekDaysWithData.map((item) => {
                const isToday = item.date === todayStr;
                const day = item.planDay;

                return (
                  <div
                    key={item.date}
                    className={`rounded-2xl border p-4 transition-all bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                      isToday
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
                        : "border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            วัน{item.label}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              วันนี้
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                          {formatThaiDateShort(item.date, false)}
                        </span>
                      </div>

                      {/* Day's Meals */}
                      {day && day.meals.length > 0 ? (
                        <div className="space-y-2.5">
                          {day.meals.map((meal) => {
                            const isDone = meal.status === "COMPLETED";

                            return (
                              <Link
                                key={meal.id}
                                href={`/meals/${meal.id}?date=${day.date}`}
                                className={`block p-2.5 rounded-xl border transition-all text-xs ${
                                  isDone
                                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-400"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                                    {meal.type === "BREAKFAST"
                                      ? "เช้า"
                                      : meal.type === "LUNCH"
                                      ? "กลางวัน"
                                      : meal.type === "DINNER"
                                      ? "เย็น"
                                      : "ของว่าง"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {meal.time}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`font-medium line-clamp-1 ${
                                      isDone
                                        ? "text-slate-600 dark:text-slate-400 line-through"
                                        : "text-slate-800 dark:text-slate-200"
                                    }`}
                                  >
                                    {meal.name}
                                  </span>
                                  {isDone && (
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4 text-center">
                          ไม่มีตารางอาหาร
                        </p>
                      )}
                    </div>

                    {day && (
                      <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{day.meals.length} มื้อ</span>
                        <button
                          onClick={() => {
                            setCurrentDateStr(day.date);
                            setViewMode("daily");
                          }}
                          className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
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
            <div className="max-w-xl mx-auto space-y-4">
              {/* Day pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {weekDaysWithData.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setCurrentDateStr(d.date)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedDay.date === d.date
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    วัน{d.label}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  วัน{selectedDay.label}
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  {formatThaiDateShort(selectedDay.date)}
                </p>

                <div className="space-y-3">
                  {selectedDay.meals.map((meal) => (
                    <Link
                      key={meal.id}
                      href={`/meals/${meal.id}?date=${selectedDay.date}`}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MealTypeBadge type={meal.type} time={meal.time} />
                          {meal.prepTimeMinutes != null && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meal.prepTimeMinutes}m
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {meal.name}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
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
