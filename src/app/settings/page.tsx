import React from "react";
import { getUserProfile } from "@/lib/repository";
import { SettingsManager } from "@/components/settings/SettingsManager";
import { Settings, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let profile;
  let errorMsg: string | null = null;

  try {
    profile = await getUserProfile();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          เกิดข้อผิดพลาดในการโหลดการตั้งค่า
        </h1>
        <p className="text-xs text-slate-500">{errorMsg || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ตั้งค่า (Settings)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            จัดการข้อมูลส่วนตัว เวลาอาหาร ธีม และการนำเข้า/ส่งออกข้อมูล
          </p>
        </div>
      </div>

      {/* Settings Manager Form */}
      <SettingsManager initialProfile={profile} />
    </div>
  );
}
