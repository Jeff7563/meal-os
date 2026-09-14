"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User,
  Clock,
  Palette,
  Database,
  Upload,
  Download,
  RotateCcw,
  Check,
  Save,
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
        toast("บันทึกการตั้งค่าโปรไฟล์เรียบร้อย ✓", "success");
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
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      {/* 1. Profile Settings */}
      <form
        onSubmit={handleSaveProfile}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              ข้อมูลส่วนตัว (Profile)
            </h2>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full h-10 px-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              ส่วนสูง (ซม.)
            </label>
            <input
              type="number"
              value={profile.height || ""}
              onChange={(e) =>
                setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })
              }
              className="w-full h-10 px-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
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
              className="w-full h-10 px-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              เป้าหมายน้ำหนัก (กก.)
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
              className="w-full h-10 px-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Meal Time Preferences */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              เวลาอาหารที่แนะนำ
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">มื้อเช้า</label>
              <input
                type="text"
                value={profile.breakfastTime}
                onChange={(e) =>
                  setProfile({ ...profile, breakfastTime: e.target.value })
                }
                className="w-full h-9 px-2 text-center font-mono rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">มื้อกลางวัน</label>
              <input
                type="text"
                value={profile.lunchTime}
                onChange={(e) => setProfile({ ...profile, lunchTime: e.target.value })}
                className="w-full h-9 px-2 text-center font-mono rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">มื้อเย็น</label>
              <input
                type="text"
                value={profile.dinnerTime}
                onChange={(e) => setProfile({ ...profile, dinnerTime: e.target.value })}
                className="w-full h-9 px-2 text-center font-mono rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. Theme / Display */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            การแสดงผล (Display)
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span>Light (สว่าง)</span>
            {theme === "light" && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span>Dark (มืด)</span>
            {theme === "dark" && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              theme === "system"
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span>System</span>
            {theme === "system" && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. Data Management (Import, Export, Reset) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            จัดการข้อมูลตารางอาหาร (Data Management)
          </h2>
        </div>

        <div className="space-y-2 pt-1">
          <Link
            href="/settings/import"
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Import Meal Plan (นำเข้าตารางอาหาร JSON จาก AI)</span>
            </div>
            <span className="text-slate-400">เปิดหน้าต่าง →</span>
          </Link>

          <a
            href="/api/export"
            download
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Export Meal Plan (ดาวน์โหลด JSON เก็บไว้)</span>
            </div>
            <span className="text-slate-400">ดาวน์โหลด ↓</span>
          </a>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-xs font-semibold text-rose-600 dark:text-rose-400"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>รีเซ็ตตารางอาหารกลับเป็นค่าเริ่มต้น 7 วัน (Reset Seed)</span>
            </div>
            <span>{isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ต"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
