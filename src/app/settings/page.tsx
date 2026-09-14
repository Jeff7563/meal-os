import React from "react";
import { getUserProfile } from "@/lib/repository";
import { SettingsManager } from "@/components/settings/SettingsManager";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getUserProfile();

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
