"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
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
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          นำเข้าตารางอาหารด้วย JSON
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          วางข้อมูล JSON ตารางอาหารของคุณด้านล่าง
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          (รองรับ JSON ที่สร้างจาก ChatGPT และ AI ต่าง ๆ)
        </p>

        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadExample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold bg-[var(--green-soft)] text-[var(--green-dark)] hover:bg-[var(--green-primary)] hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>โหลดตัวอย่าง JSON สัปดาห์นี้</span>
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-soft)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้าง</span>
          </button>
        </div>
      </div>

      {/* JSON Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-secondary)] block">
          ข้อมูล JSON:
        </label>
        <textarea
          rows={12}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (validationResult) setValidationResult(null);
          }}
          placeholder={`{\n  "version": "1.0",\n  "plan": {\n    "name": "ลดน้ำหนัก - สัปดาห์ 1",\n    "startDate": "2026-09-14",\n    "days": [ ... ]\n  }\n}`}
          className="w-full p-4 rounded-[18px] font-mono text-xs bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--green-primary)] text-[var(--text-primary)] leading-relaxed shadow-xs"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          disabled={isValidating || !jsonText.trim()}
          className="h-11 px-6 rounded-[14px] font-semibold text-xs sm:text-sm bg-[var(--surface-white)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border-soft)] transition-all disabled:opacity-50"
        >
          {isValidating ? "กำลังตรวจสอบ..." : "ตรวจข้อมูล (Validate)"}
        </button>

        {validationResult?.valid && (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="h-11 px-6 rounded-[14px] font-semibold text-xs sm:text-sm bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] shadow-xs transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? "กำลังนำเข้า..." : "ยืนยันนำเข้า (Import)"}</span>
          </button>
        )}
      </div>

      {/* VALIDATION RESULT: SUCCESS */}
      {validationResult && validationResult.valid && validationResult.stats && (
        <div className="p-5 sm:p-6 rounded-[20px] bg-[var(--green-extra-soft)] border border-[var(--green-soft)] space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 text-[var(--green-dark)] font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-[var(--green-primary)] shrink-0" />
            <span>✓ JSON Valid — พร้อมนำเข้า</span>
          </div>

          {/* Stats Preview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-[14px] bg-[var(--surface-white)] border border-[var(--border-soft)]">
              <span className="text-[10px] text-[var(--text-muted)] block">ชื่อแผน</span>
              <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1" title={validationResult.stats.planName}>
                {validationResult.stats.planName}
              </span>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--surface-white)] border border-[var(--border-soft)]">
              <span className="text-[10px] text-[var(--text-muted)] block">ช่วงวันที่ (เริ่ม - สิ้นสุด)</span>
              <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                {validationResult.stats.startDate} ~ {validationResult.stats.endDate}
              </span>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--surface-white)] border border-[var(--border-soft)]">
              <span className="text-[10px] text-[var(--text-muted)] block">จำนวนวัน</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {validationResult.stats.daysCount} วัน
              </span>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--surface-white)] border border-[var(--border-soft)]">
              <span className="text-[10px] text-[var(--text-muted)] block">จำนวนมื้อทั้งหมด</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {validationResult.stats.mealsCount} มื้อ
              </span>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--surface-white)] border border-[var(--border-soft)]">
              <span className="text-[10px] text-[var(--text-muted)] block">จำนวนวัตถุดิบทั้งหมด</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {validationResult.stats.ingredientsCount} รายการ
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] block mb-2">
              โหมดการนำเข้า:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-[14px] border flex items-start gap-2.5 cursor-pointer transition-colors ${
                  importMode === "replace"
                    ? "border-[var(--green-primary)] bg-[var(--surface-white)] shadow-xs"
                    : "border-[var(--border)] bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="mt-1 text-[var(--green-primary)]"
                />
                <div>
                  <span className="text-xs font-bold block text-[var(--text-primary)]">
                    แทนที่แผนปัจจุบัน
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    ตั้งค่าให้แผนใหม่นี้เป็นแผนปัจจุบันที่ใช้งานทันที
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-[14px] border flex items-start gap-2.5 cursor-pointer transition-colors ${
                  importMode === "create"
                    ? "border-[var(--green-primary)] bg-[var(--surface-white)] shadow-xs"
                    : "border-[var(--border)] bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "create"}
                  onChange={() => setImportMode("create")}
                  className="mt-1 text-[var(--green-primary)]"
                />
                <div>
                  <span className="text-xs font-bold block text-[var(--text-primary)]">
                    นำเข้าเป็นแผนใหม่
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    บันทึกเก็บเป็นแผนอาหารใหม่ในระบบ
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* VALIDATION RESULT: ERRORS */}
      {validationResult && !validationResult.valid && (
        <div className="p-5 rounded-[20px] bg-[var(--red-soft)] border border-[#EAC4BE] dark:border-[#4A2420] space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 text-[var(--red-text)] font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-[var(--red-text)] shrink-0" />
            <span>พบข้อผิดพลาดใน JSON ({validationResult.errors.length} รายการ):</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-[var(--red-text)]">
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
