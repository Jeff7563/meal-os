import React from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { DailySummary } from "@/components/meal/DailySummary";
import { MealCard } from "@/components/meal/MealCard";
import { getMealsForDate, getUserProfile } from "@/lib/repository";
import { getBangkokTodayString } from "@/lib/date-utils";
import { Plus, Info, RefreshCw } from "lucide-react";

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

  // Friendly Warm Error State
  if (dbError) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--orange-soft)] text-[var(--orange-primary)] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          มีบางอย่างผิดพลาด
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          ตอนนี้ยังโหลดข้อมูลไม่ได้ ลองใหม่อีกครั้งในอีกสักครู่
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองใหม่อีกครั้ง</span>
          </Link>
        </div>
      </div>
    );
  }

  const { dayLabel, meals, planName, isDbLive } = data!;
  const completedCount = meals.filter((m) => m.status === "COMPLETED").length;
  const totalCount = meals.length;

  return (
    <div className="space-y-6 pb-28 max-w-[920px] mx-auto">
      {/* Dev Mode Banner (soft and unobtrusive) */}
      {!isDbLive && (
        <div className="px-4 py-2.5 rounded-[16px] bg-[var(--orange-extra-soft)] border border-[var(--orange-soft)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <Info className="w-4 h-4 shrink-0 text-[var(--orange-primary)]" />
          <span>
            <strong>โหมดทดลองใช้งาน:</strong> แสดงข้อมูลตัวอย่างสำหรับการทดสอบ UI (เชื่อมต่อฐานข้อมูลเพื่อบันทึกข้อมูลถาวร)
          </span>
        </div>
      )}

      {/* 1. Greeting & Hero Anchor "วันนี้กินอะไร" */}
      <TopHeader userName={user?.name} customDate={todayStr} />

      {/* 2. Small Daily Summary (Soft card with slim progress bar) */}
      {totalCount > 0 && (
        <DailySummary
          completed={completedCount}
          total={totalCount}
          dayLabel={dayLabel}
        />
      )}

      {/* 3. Today's Meals Section */}
      <section className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            มื้ออาหารของวันนี้ ({totalCount} มื้อ)
          </h2>
          {planName && (
            <span className="text-[11px] font-normal text-[var(--text-secondary)] bg-[var(--background-soft)] px-2.5 py-1 rounded-full border border-[var(--border-soft)] line-clamp-1 max-w-[220px]">
              {planName}
            </span>
          )}
        </div>

        {/* Meal Cards */}
        {totalCount > 0 ? (
          <div className="space-y-3.5">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} dateStr={todayStr} />
            ))}
          </div>
        ) : (
          /* Warm Empty State */
          <div className="p-10 text-center rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--green-extra-soft)] text-[var(--green-primary)] mx-auto flex items-center justify-center">
              <Plus className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              วันนี้ยังไม่มีตารางอาหาร
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
              เพิ่มตารางอาหารเพื่อเริ่มวางแผนมื้อของวันนี้และดูแลสุขภาพอย่างต่อเนื่อง
            </p>
            <div className="pt-2">
              <Link
                href="/settings/import"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มตารางอาหาร</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
