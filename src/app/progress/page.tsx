import React from "react";
import {
  getProgressSummary,
  getUserProfile,
  getWeightLogs,
} from "@/lib/repository";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { Info } from "lucide-react";
import Link from "next/link";

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
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--orange-soft)] text-[var(--orange-primary)] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          เกิดข้อผิดพลาดในการโหลดข้อมูลความคืบหน้า
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">{errorMsg || "ไม่สามารถดึงข้อมูลได้"}</p>
        <div className="pt-2">
          <Link
            href="/progress"
            className="inline-flex items-center px-4 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors"
          >
            ลองใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[860px] mx-auto pb-28">
      {/* Page Header */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          ความคืบหน้า
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
          ค่อย ๆ ดีขึ้นในแบบของเรา
        </p>
      </div>

      {/* Progress Content */}
      <ProgressDashboard
        initialSummary={summary}
        initialProfile={profile}
        initialWeightLogs={weightLogs}
      />
    </div>
  );
}
