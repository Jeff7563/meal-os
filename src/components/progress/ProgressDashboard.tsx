"use client";

import React, { useState, useTransition } from "react";
import {
  Flame,
  CheckCircle2,
  Scale,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { ProgressSummary, UserProfile, WeightRecord } from "@/types/meal";
import { logWeightAction } from "@/lib/weight/actions";
import { useToast } from "@/components/ui/toast";
import { formatThaiDateShort, getBangkokTodayString } from "@/lib/date-utils";

interface ProgressDashboardProps {
  initialSummary: ProgressSummary;
  initialProfile: UserProfile;
  initialWeightLogs: WeightRecord[];
}

export function ProgressDashboard({
  initialSummary,
  initialProfile,
  initialWeightLogs,
}: ProgressDashboardProps) {
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>(initialWeightLogs);
  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const currentWeight =
    weightLogs[0]?.weightKg || initialProfile.currentWeight || 75.0;
  const startingWeight =
    weightLogs[weightLogs.length - 1]?.weightKg || currentWeight;
  const goalWeight = initialProfile.goalWeight || 68.0;
  const weightDiff = Math.round((currentWeight - startingWeight) * 10) / 10;
  const remainingToGoal = Math.round((currentWeight - goalWeight) * 10) / 10;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 30 || val > 300) {
      toast("กรุณาระบุน้ำหนักที่ถูกต้อง (กก.)", "error");
      return;
    }

    startTransition(async () => {
      const todayStr = getBangkokTodayString();
      const res = await logWeightAction(val, newNote || undefined, todayStr);
      if (res.success) {
        setWeightLogs((prev) => [
          {
            id: `w_${Date.now()}`,
            date: todayStr,
            weightKg: val,
            note: newNote,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewWeight("");
        setNewNote("");
        setIsAddingWeight(false);
        toast("บันทึกน้ำหนักเรียบร้อย", "success");
      } else {
        toast("บันทึกล้มเหลว กรุณาลองใหม่", "error");
      }
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. STREAK & ADHERENCE OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 opacity-90 text-xs font-semibold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Current Streak</span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {initialSummary.currentStreak}{" "}
              <span className="text-lg font-medium opacity-90">วันต่อเนื่อง</span>
            </div>
            <p className="text-xs opacity-80 mt-1">คุมอาหารสม่ำเสมอ ยอดเยี่ยมมาก!</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Today Adherence Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>การกินวันนี้</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {initialSummary.todayPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {initialSummary.todayCompleted} / {initialSummary.todayTotal}{" "}
            <span className="text-sm font-normal text-slate-400">มื้อ</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${initialSummary.todayPercentage}%` }}
            />
          </div>
        </div>

        {/* Weekly Adherence Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>เป้าหมายสัปดาห์นี้</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {initialSummary.weekPercentage}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {initialSummary.weekCompleted} / {initialSummary.weekTotal}{" "}
            <span className="text-sm font-normal text-slate-400">มื้อ</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${initialSummary.weekPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. 7-DAY STREAK CALENDAR */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>บันทึกความต่อเนื่องสัปดาห์นี้</span>
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {initialSummary.weekDaysStatus.map((day) => {
            const isDone = day.isAllDone;
            const hasSome = day.completed > 0 && !isDone;

            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-xl text-center border flex flex-col items-center justify-between min-h-[72px] transition-all ${
                  day.isToday
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {day.label}
                </span>

                <div className="my-1">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : hasSome ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {day.completed}/{day.total}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600 font-mono">
                      -
                    </span>
                  )}
                </div>

                <span className="text-[9px] text-slate-400">
                  {formatThaiDateShort(day.date, false)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WEIGHT TRACKING SECTION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ติดตามน้ำหนักตัว (Weight Tracking)
            </h3>
          </div>
          <button
            onClick={() => setIsAddingWeight((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>บันทึกน้ำหนัก</span>
          </button>
        </div>

        {/* Add Weight Form */}
        {isAddingWeight && (
          <form
            onSubmit={handleAddWeight}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in slide-in-from-top-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
                  น้ำหนัก (กก.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="เช่น 76.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
                  บันทึกสั้นๆ (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชั่งเช้าหลังตื่นนอน"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingWeight(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200 dark:text-slate-400"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        )}

        {/* 4 Weight Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">น้ำหนักปัจจุบัน</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {currentWeight}{" "}
              <span className="text-xs font-normal text-slate-400">กก.</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">น้ำหนักเริ่มต้น</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {startingWeight}{" "}
              <span className="text-xs font-normal text-slate-400">กก.</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">การเปลี่ยนแปลง</span>
            <span
              className={`text-lg font-extrabold ${
                weightDiff <= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600"
              }`}
            >
              {weightDiff > 0 ? `+${weightDiff}` : weightDiff}{" "}
              <span className="text-xs font-normal text-slate-400">กก.</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">เป้าหมาย (อีก {remainingToGoal} กก.)</span>
            <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
              {goalWeight}{" "}
              <span className="text-xs font-normal text-slate-400">กก.</span>
            </span>
          </div>
        </div>

        {/* Weight Log History */}
        {weightLogs.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              ประวัติการชั่งน้ำหนักล่าสุด
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {weightLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.weightKg} กก.
                    </span>
                    {log.note && (
                      <span className="text-slate-400 ml-2">({log.note})</span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono">
                    {formatThaiDateShort(log.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
