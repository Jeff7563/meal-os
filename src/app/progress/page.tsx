import React from "react";
import {
  getProgressSummary,
  getUserProfile,
  getWeightLogs,
} from "@/lib/repository";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [summary, profile, weightLogs] = await Promise.all([
    getProgressSummary(),
    getUserProfile(),
    getWeightLogs(),
  ]);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ความคืบหน้า & น้ำหนัก (Progress)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ติดตามวินัยการกิน (Meal Adherence), วันต่อเนื่อง (Streak) และน้ำหนักตัว
          </p>
        </div>
      </div>

      {/* Progress Dashboard */}
      <ProgressDashboard
        initialSummary={summary}
        initialProfile={profile}
        initialWeightLogs={weightLogs}
      />
    </div>
  );
}
