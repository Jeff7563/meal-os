import React from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { MealProgressBar } from "@/components/meal/MealProgressBar";
import { MealCard } from "@/components/meal/MealCard";
import { getMealsForDate, getUserProfile } from "@/lib/repository";
import { getBangkokTodayString } from "@/lib/date-utils";
import { Upload, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const todayStr = getBangkokTodayString();
  const [{ dayLabel, meals, planName }, user] = await Promise.all([
    getMealsForDate(todayStr),
    getUserProfile(),
  ]);

  const completedCount = meals.filter((m) => m.status === "COMPLETED").length;
  const totalCount = meals.length;

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* 1. Greeting & Date */}
      <TopHeader userName={user.name} customDate={todayStr} />

      {/* 2. Today's Progress Bar (ตอบคำถามภายใน 3 วินาที) */}
      {totalCount > 0 && (
        <MealProgressBar
          completed={completedCount}
          total={totalCount}
          title={`ความคืบหน้าวันนี้ (${dayLabel})`}
        />
      )}

      {/* 3. Today's Meals Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            มื้ออาหารของวันนี้ (Today&apos;s Meals)
          </h2>
          {planName && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 line-clamp-1 max-w-[180px]">
              {planName}
            </span>
          )}
        </div>

        {/* Meal Cards */}
        {totalCount > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} dateStr={todayStr} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              ยังไม่มีตารางอาหารสำหรับวันนี้
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              คุณสามารถนำเข้าตารางอาหารใหม่ผ่าน JSON จาก ChatGPT หรือใช้ตารางอาหารตัวอย่างเพื่อเริ่มต้น
            </p>
            <div className="pt-2">
              <Link
                href="/settings/import"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
              >
                <Upload className="w-4 h-4" />
                <span>Import Meal Plan</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
