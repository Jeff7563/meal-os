import React from "react";
import { getActiveMealPlan } from "@/lib/repository";
import { WeeklySchedule } from "@/components/schedule/WeeklySchedule";
import { Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const plan = await getActiveMealPlan();

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ตารางอาหาร (Meal Schedule)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {plan?.name || "ตารางอาหารประจำสัปดาห์"}
          </p>
        </div>

        <Link
          href="/settings/import"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          + นำเข้าตารางใหม่
        </Link>
      </div>

      {/* Weekly & Daily Interactive Schedule */}
      {plan ? (
        <WeeklySchedule initialPlan={plan} />
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">ไม่พบตารางอาหารในระบบ</p>
        </div>
      )}
    </div>
  );
}
