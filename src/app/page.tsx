import React from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { MealProgressBar } from "@/components/meal/MealProgressBar";
import { MealCard } from "@/components/meal/MealCard";
import { getMealsForDate, getUserProfile } from "@/lib/repository";
import { getBangkokTodayString } from "@/lib/date-utils";
import { Upload, Sparkles, AlertTriangle, Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const todayStr = getBangkokTodayString();

  let data;
  let user;
  let dbError: string | null = null;

  try {
    const [mealsData, userProfile] = await Promise.all([
      getMealsForDate(todayStr),
      getUserProfile(),
    ]);
    data = mealsData;
    user = userProfile;
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
  }

  // Production Database Error State
  if (dbError) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <Database className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          ไม่สามารถเชื่อมต่อฐานข้อมูลได้
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {dbError}
        </p>
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono text-left max-w-md mx-auto border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          คำแนะนำ: ตรวจสอบการตั้งค่า DATABASE_URL ในไฟล์ .env หรือ Vercel Environment Variables
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            ลองใหม่อีกครั้ง (Retry)
          </Link>
        </div>
      </div>
    );
  }

  const { dayLabel, meals, planName, isDbLive } = data!;
  const completedCount = meals.filter((m) => m.status === "COMPLETED").length;
  const totalCount = meals.length;

  return (
    <div className="space-y-5 pb-24 max-w-xl mx-auto">
      {/* Dev Mode Banner (only when DB is not configured locally) */}
      {!isDbLive && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>โหมดทดลอง (Demo Mode):</strong> ยังไม่ได้เชื่อมต่อ PostgreSQL ข้อมูลมื้ออาหารแสดงเพื่อการทดสอบ UI (เชื่อมต่อ DB เพื่อบันทึกจริง)
          </span>
        </div>
      )}

      {/* 1. Greeting & Bangkok Date */}
      <TopHeader userName={user?.name} customDate={todayStr} />

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
            มื้ออาหารของวันนี้ ({totalCount} มื้อ)
          </h2>
          {planName && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 line-clamp-1 max-w-[200px]">
              {planName}
            </span>
          )}
        </div>

        {/* Meal Cards with Optimistic completion and rollback */}
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
              คุณสามารถนำเข้าตารางอาหารใหม่ผ่าน JSON จาก ChatGPT หรือเริ่มใช้งานด้วยตารางเริ่มต้น
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
