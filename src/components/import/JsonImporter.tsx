"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  FileCode,
  Trash2,
} from "lucide-react";
import {
  validateMealPlanJsonAction,
  executeImportAction,
  ValidationResult,
} from "@/lib/import/actions";
import { useToast } from "@/components/ui/toast";
import { getInitialSeedPlan } from "@/lib/seed-data";

export function JsonImporter() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "create">("replace");
  const [isValidating, startValidating] = useTransition();
  const [isImporting, startImporting] = useTransition();
  const { toast } = useToast();

  const handleValidate = () => {
    if (!jsonText.trim()) {
      toast("กรุณาวางโค้ด JSON ก่อนตรวจสอบ", "error");
      return;
    }

    startValidating(async () => {
      const res = await validateMealPlanJsonAction(jsonText);
      setValidationResult(res);
      if (res.valid) {
        toast("✓ JSON ถูกต้องตามโครงสร้าง", "success");
      } else {
        toast("โครงสร้าง JSON ไม่ถูกต้อง กรุณาตรวจสอบข้อผิดพลาด", "error");
      }
    });
  };

  const handleImport = () => {
    if (!validationResult || !validationResult.valid || !validationResult.data) {
      toast("กรุณากดตรวจสอบ (Validate) ให้ผ่านก่อนนำเข้า", "error");
      return;
    }

    startImporting(async () => {
      const res = await executeImportAction(validationResult.data!, importMode);
      if (res.success) {
        toast(res.message, "success");
        router.push("/");
        router.refresh();
      } else {
        toast(res.message, "error");
      }
    });
  };

  const handleLoadExample = () => {
    const example = getInitialSeedPlan();
    setJsonText(JSON.stringify(example, null, 2));
    setValidationResult(null);
    toast("โหลดตัวอย่าง JSON เรียบร้อย", "info");
  };

  const handleClear = () => {
    setJsonText("");
    setValidationResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            นำเข้าตารางอาหารด้วย JSON (AI Meal Plan Importer)
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          นำ JSON ที่ได้จาก ChatGPT หรือ AI มาวางเพื่ออัปเดตตารางอาหารใหม่ ระบบจะตรวจสอบความถูกต้องของข้อมูลและบันทึกอัตโนมัติ
        </p>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>โหลดตัวอย่าง JSON สัปดาห์นี้</span>
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างข้อความ</span>
          </button>
        </div>
      </div>

      {/* JSON Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          วาง JSON ของคุณที่นี่ (Paste Meal Plan JSON):
        </label>
        <textarea
          rows={12}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (validationResult) setValidationResult(null);
          }}
          placeholder={`{\n  "version": "1.0",\n  "plan": {\n    "name": "ลดน้ำหนัก - สัปดาห์ 1",\n    "startDate": "2026-09-14",\n    "days": [ ... ]\n  }\n}`}
          className="w-full p-4 rounded-2xl font-mono text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          disabled={isValidating || !jsonText.trim()}
          className="h-11 px-6 rounded-xl font-bold text-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isValidating ? "กำลังตรวจสอบ..." : "ตรวจข้อมูล (Validate)"}
        </button>

        {validationResult?.valid && (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="h-11 px-6 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? "กำลังนำเข้า..." : "ยืนยันนำเข้า (Import)"}</span>
          </button>
        )}
      </div>

      {/* VALIDATION RESULT: SUCCESS */}
      {validationResult && validationResult.valid && validationResult.stats && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>✓ JSON Valid - โครงสร้างถูกต้อง พร้อมนำเข้า</span>
          </div>

          {/* Stats Preview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] text-slate-400 block">ชื่อแผน</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                {validationResult.stats.planName}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] text-slate-400 block">วันที่เริ่มต้น</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {validationResult.stats.startDate}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] text-slate-400 block">จำนวนวัน</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {validationResult.stats.daysCount} วัน
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] text-slate-400 block">จำนวนมื้อรวม</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {validationResult.stats.mealsCount} มื้อ
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              โหมดการนำเข้า (Import Mode):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                  importMode === "replace"
                    ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">
                    Replace Existing (แทนที่ตารางปัจจุบัน)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ตั้งค่าให้แผนใหม่นี้เป็นแผนปัจจุบันที่ใช้งานทันที
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                  importMode === "create"
                    ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "create"}
                  onChange={() => setImportMode("create")}
                  className="mt-1 text-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">
                    Create New Plan (สร้างแผนใหม่)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    เพิ่มเป็นแผนอาหารใหม่ในระบบ
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* VALIDATION RESULT: ERRORS */}
      {validationResult && !validationResult.valid && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>พบข้อผิดพลาดใน JSON ({validationResult.errors.length} รายการ):</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-rose-700 dark:text-rose-300">
            {validationResult.errors.map((err, idx) => (
              <li key={idx} className="leading-relaxed">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
