"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Check,
  X,
} from "lucide-react";
import { ProgressSummary, UserProfile, WeightRecord } from "@/types/meal";
import { logWeightAction } from "@/lib/weight/actions";
import { useToast } from "@/components/ui/toast";
import { formatThaiDateShort, getBangkokTodayString } from "@/lib/date-utils";
import { WeightChart } from "@/components/progress/WeightChart";

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
  const [newDate, setNewDate] = useState(getBangkokTodayString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const currentWeight =
    weightLogs[0]?.weightKg || initialProfile.currentWeight || 75.0;
  const startingWeight =
    weightLogs[weightLogs.length - 1]?.weightKg || currentWeight;
  const goalWeight = initialProfile.goalWeight || 68.0;
  const weightDiff = Math.round((currentWeight - startingWeight) * 10) / 10;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 30 || val > 300) {
      toast("กรุณาระบุน้ำหนักที่ถูกต้อง (กก.)", "error");
      return;
    }

    startTransition(async () => {
      const targetDate = newDate || getBangkokTodayString();
      const res = await logWeightAction(val, newNote || undefined, targetDate);
      if (res.success) {
        setWeightLogs((prev) => [
          {
            id: `w_${Date.now()}`,
            date: targetDate,
            weightKg: val,
            note: newNote,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewWeight("");
        setNewNote("");
        setIsModalOpen(false);
        toast("บันทึกน้ำหนักเรียบร้อย", "success");
      } else {
        toast("บันทึกล้มเหลว กรุณาลองใหม่", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP PROGRESS SUMMARY (Calm, Food-First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weekly Adherence Card */}
        <div className="p-5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[var(--text-muted)] block">
              สัปดาห์นี้
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              {initialSummary.weekCompleted} / {initialSummary.weekTotal}{" "}
              <span className="text-sm font-normal text-[var(--text-secondary)]">มื้อ</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5 font-medium">
              <span>ความต่อเนื่องในการกินตามแผน</span>
              <span className="text-[var(--green-dark)] font-semibold">
                {initialSummary.weekPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--background-soft)] rounded-full overflow-hidden border border-[var(--border-soft)]">
              <div
                className="h-full bg-[var(--green-primary)] rounded-full transition-all duration-300"
                style={{ width: `${initialSummary.weekPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="p-5 rounded-[20px] bg-[var(--green-extra-soft)] border border-[var(--green-soft)] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[var(--green-dark)] block">
              วินัยต่อเนื่อง
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              {initialSummary.currentStreak}{" "}
              <span className="text-sm font-normal text-[var(--text-secondary)]">วันต่อเนื่อง</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed">
            กินตามมื้อที่วางแผนอย่างสม่ำเสมอ ค่อย ๆ ทำไปทีละวัน
          </p>
        </div>
      </div>

      {/* 2. 7-DAY MEAL HISTORY ROW */}
      <div className="p-5 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3.5">
          ประวัติการกิน 7 วันล่าสุด
        </h3>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {initialSummary.weekDaysStatus.map((day) => {
            const isDone = day.isAllDone;
            const hasSome = day.completed > 0 && !isDone;

            return (
              <div
                key={day.date}
                className={`p-2 sm:p-2.5 rounded-[14px] border flex flex-col items-center justify-between min-h-[68px] transition-all ${
                  day.isToday
                    ? "border-[var(--orange-primary)]/60 bg-[var(--surface-white)] ring-1 ring-[var(--orange-primary)]/20"
                    : "border-[var(--border-soft)] bg-[var(--background-soft)]"
                }`}
              >
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  {day.label}
                </span>

                <div className="my-1">
                  {isDone ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green-soft)] text-[var(--green-dark)]">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  ) : hasSome ? (
                    <span className="text-[11px] font-bold text-[var(--orange-primary)]">
                      {day.completed}/{day.total}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      -
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-[var(--text-muted)] font-normal">
                  {formatThaiDateShort(day.date, false).split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WEIGHT TRACKING SECTION */}
      <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              น้ำหนัก
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              ติดตามแนวโน้มการเปลี่ยนแปลงของร่างกาย
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ บันทึกน้ำหนัก</span>
          </button>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[16px] bg-[var(--background-soft)] border border-[var(--border-soft)]">
            <span className="text-[11px] text-[var(--text-muted)] block">ตอนนี้</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {currentWeight}{" "}
              <span className="text-xs font-normal text-[var(--text-muted)]">กก.</span>
            </span>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[var(--background-soft)] border border-[var(--border-soft)]">
            <span className="text-[11px] text-[var(--text-muted)] block">เริ่มต้น</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {startingWeight}{" "}
              <span className="text-xs font-normal text-[var(--text-muted)]">กก.</span>
            </span>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[var(--background-soft)] border border-[var(--border-soft)]">
            <span className="text-[11px] text-[var(--text-muted)] block">เปลี่ยนแปลง</span>
            <span
              className={`text-lg font-bold ${
                weightDiff <= 0
                  ? "text-[var(--green-dark)]"
                  : "text-[var(--orange-primary)]"
              }`}
            >
              {weightDiff > 0 ? `+${weightDiff}` : weightDiff}{" "}
              <span className="text-xs font-normal text-[var(--text-muted)]">กก.</span>
            </span>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[var(--background-soft)] border border-[var(--border-soft)]">
            <span className="text-[11px] text-[var(--text-muted)] block">เป้าหมาย</span>
            <span className="text-lg font-bold text-[var(--green-dark)]">
              {goalWeight}{" "}
              <span className="text-xs font-normal text-[var(--text-muted)]">กก.</span>
            </span>
          </div>
        </div>

        {/* Minimal Weight Line Graph */}
        <div className="pt-2">
          <WeightChart logs={weightLogs} />
        </div>

        {/* Weight Log History */}
        {weightLogs.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-soft)]">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
              ประวัติการชั่งน้ำหนักล่าสุด
            </h4>
            <div className="divide-y divide-[var(--border-soft)]">
              {weightLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {log.weightKg} กก.
                    </span>
                    {log.note && (
                      <span className="text-[var(--text-muted)] ml-2">({log.note})</span>
                    )}
                  </div>
                  <span className="text-[var(--text-muted)] font-mono">
                    {formatThaiDateShort(log.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Weight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface-white)] rounded-[24px] border border-[var(--border)] p-6 max-w-md w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                บันทึกน้ำหนักตัว
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  น้ำหนัก (กก.) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  autoFocus
                  placeholder="เช่น 74.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  วันที่บันทึก
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  หมายเหตุ (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชั่งตอนเช้าหลังตื่นนอน"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--border-soft)]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-[12px] bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors shadow-xs"
                >
                  {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
