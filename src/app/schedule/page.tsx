import React from "react";
import { getActiveMealPlan } from "@/lib/repository";
import { WeeklySchedule } from "@/components/schedule/WeeklySchedule";
import { Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let plan;
  let errorMsg: string | null = null;

  try {
    plan = await getActiveMealPlan();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--orange-soft)] text-[var(--orange-primary)] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          เกิดข้อผิดพลาดในการโหลดตารางอาหาร
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">{errorMsg}</p>
        <div className="pt-2">
          <Link
            href="/schedule"
            className="inline-flex items-center px-4 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors"
          >
            ลองใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1050px] mx-auto pb-28">
      {/* Schedule Content */}
      <WeeklySchedule initialPlan={plan || null} />
    </div>
  );
}
