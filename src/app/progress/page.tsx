import React from "react";
import {
  getProgressSummary,
  getUserProfile,
  getWeightLogs,
} from "@/lib/repository";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { TrendingUp, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  let summary;
  let profile;
  let weightLogs;
  let errorMsg: string | null = null;

  try {
    const [s, p, w] = await Promise.all([
      getProgressSummary(),
      getUserProfile(),
      getWeightLogs(),
    ]);
    summary = s;
    profile = p;
    weightLogs = w;
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
  }

  if (errorMsg || !summary || !profile || !weightLogs) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          เกิดข้อผิดพลาดในการโหลดข้อมูลความคืบหน้า
        </h1>
        <p className="text-xs text-slate-500">{errorMsg || "ไม่สามารถดึงข้อมูลได้"}</p>
      </div>
    );
  }

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
