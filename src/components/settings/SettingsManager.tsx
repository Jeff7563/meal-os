"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Upload,
  Download,
  RotateCcw,
  Check,
  Save,
  ArrowRight,
} from "lucide-react";
import { UserProfile } from "@/types/meal";
import { saveProfileSettingsAction, resetToDefaultPlanAction } from "@/lib/settings/actions";
import { useToast } from "@/components/ui/toast";

interface SettingsManagerProps {
  initialProfile: UserProfile;
}

export function SettingsManager({ initialProfile }: SettingsManagerProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isSaving, startSaving] = useTransition();
  const [isResetting, startResetting] = useTransition();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const res = await saveProfileSettingsAction({
        name: profile.name,
        height: profile.height ? Number(profile.height) : undefined,
        currentWeight: profile.currentWeight ? Number(profile.currentWeight) : undefined,
        goalWeight: profile.goalWeight ? Number(profile.goalWeight) : undefined,
        breakfastTime: profile.breakfastTime,
        lunchTime: profile.lunchTime,
        dinnerTime: profile.dinnerTime,
      });
      if (res.success) {
        toast("บันทึกการตั้งค่าเรียบร้อยแล้ว ✓", "success");
      } else {
        toast("บันทึกล้มเหลว กรุณาลองใหม่", "error");
      }
    });
  };

  const handleReset = () => {
    if (
      !confirm(
        "คำเตือน: คุณต้องการรีเซ็ตตารางอาหารกลับเป็นค่าเริ่มต้น 7 วันใช่หรือไม่? ประวัติเดิมจะถูกล้าง"
      )
    ) {
      return;
    }

    startResetting(async () => {
      const res = await resetToDefaultPlanAction();
      if (res.success) {
        toast("รีเซ็ตตารางอาหารเริ่มต้นเรียบร้อยแล้ว", "success");
        router.push("/");
        router.refresh();
      } else {
        toast("รีเซ็ตล้มเหลว", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION: โปรไฟล์ */}
      <form
        onSubmit={handleSaveProfile}
        className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-soft)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            โปรไฟล์
          </h2>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full h-10 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
              ส่วนสูง (ซม.)
            </label>
            <input
              type="number"
              value={profile.height || ""}
              onChange={(e) =>
                setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })
              }
              className="w-full h-10 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
              น้ำหนักปัจจุบัน (กก.)
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.currentWeight || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  currentWeight: parseFloat(e.target.value) || undefined,
                })
              }
              className="w-full h-10 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
              น้ำหนักเป้าหมาย (กก.)
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.goalWeight || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  goalWeight: parseFloat(e.target.value) || undefined,
                })
              }
              className="w-full h-10 px-3.5 rounded-[14px] text-sm bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
            />
          </div>
        </div>

        {/* 2. SECTION: ตารางเวลา (Meal Times) */}
        <div className="pt-4 border-t border-[var(--border-soft)]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            ตารางเวลาอาหาร
          </h3>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">เช้า</label>
              <input
                type="text"
                value={profile.breakfastTime}
                onChange={(e) =>
                  setProfile({ ...profile, breakfastTime: e.target.value })
                }
                className="w-full h-10 px-2 text-center font-mono rounded-[12px] text-xs bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">กลางวัน</label>
              <input
                type="text"
                value={profile.lunchTime}
                onChange={(e) => setProfile({ ...profile, lunchTime: e.target.value })}
                className="w-full h-10 px-2 text-center font-mono rounded-[12px] text-xs bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-secondary)] block mb-1">เย็น</label>
              <input
                type="text"
                value={profile.dinnerTime}
                onChange={(e) => setProfile({ ...profile, dinnerTime: e.target.value })}
                className="w-full h-10 px-2 text-center font-mono rounded-[12px] text-xs bg-[var(--background-soft)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)]"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 3. SECTION: หน้าตา (Appearance) */}
      <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          หน้าตา (ธีม)
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setTheme("system")}
            className={`p-3 rounded-[14px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              theme === "system"
                ? "border-[var(--green-primary)] bg-[var(--green-soft)] text-[var(--green-dark)] font-semibold shadow-xs"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-soft)]"
            }`}
          >
            <span>ระบบ</span>
            {theme === "system" && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-[14px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              theme === "light"
                ? "border-[var(--green-primary)] bg-[var(--green-soft)] text-[var(--green-dark)] font-semibold shadow-xs"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-soft)]"
            }`}
          >
            <span>สว่าง</span>
            {theme === "light" && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-[14px] border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              theme === "dark"
                ? "border-[var(--green-primary)] bg-[var(--green-soft)] text-[var(--green-dark)] font-semibold shadow-xs"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--background-soft)]"
            }`}
          >
            <span>มืด</span>
            {theme === "dark" && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. SECTION: ข้อมูลและตารางอาหาร (Data Management) */}
      <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          ข้อมูลและตารางอาหาร
        </h2>

        <div className="space-y-2 pt-1">
          <Link
            href="/settings/import"
            className="flex items-center justify-between p-3.5 rounded-[14px] border border-[var(--border)] bg-[var(--background-soft)] hover:border-[var(--green-primary)] transition-all text-xs font-medium text-[var(--text-primary)] group"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[var(--green-primary)]" />
              <span>นำเข้าตารางอาหาร</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--green-primary)] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <a
            href="/api/export"
            download
            className="flex items-center justify-between p-3.5 rounded-[14px] border border-[var(--border)] bg-[var(--background-soft)] hover:border-[var(--green-primary)] transition-all text-xs font-medium text-[var(--text-primary)] group"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-[var(--orange-primary)]" />
              <span>ส่งออกตารางอาหาร</span>
            </div>
            <span className="text-[var(--text-muted)] text-[11px]">ดาวน์โหลด JSON ↓</span>
          </a>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex items-center justify-between p-3.5 rounded-[14px] border border-[#F2D0CA] dark:border-[#4B2824] bg-[#FFF8F7] dark:bg-[#251918] hover:bg-[#FEEAE6] dark:hover:bg-[#33201E] transition-all text-xs font-medium text-[var(--red-text)]"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตตารางอาหารกลับเป็นค่าเริ่มต้น 7 วัน</span>
            </div>
            <span>{isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ต"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
