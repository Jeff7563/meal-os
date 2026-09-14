import React from "react";

interface DailySummaryProps {
  completed: number;
  total: number;
  dayLabel?: string;
  className?: string;
}

export function DailySummary({
  completed,
  total,
  dayLabel,
  className = "",
}: DailySummaryProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isAllDone = total > 0 && completed >= total;

  return (
    <div
      className={`p-5 rounded-[20px] bg-[var(--green-extra-soft)] border border-[var(--border-soft)] transition-all ${className}`}
      role="region"
      aria-label="สรุปความคืบหน้าอาหารประจำวัน"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[var(--green-dark)] block mb-1">
            ความคืบหน้าวันนี้ {dayLabel ? `(${dayLabel})` : ""}
          </span>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            เตรียมไว้ {total} มื้อสำหรับวันนี้
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            กินแล้ว {completed} จาก {total} มื้อ
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xl font-bold text-[var(--green-dark)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Slim progress bar */}
      <div className="w-full h-2 bg-[var(--surface-white)] rounded-full overflow-hidden mt-3.5 border border-[var(--border-soft)]">
        <div
          className="h-full bg-[var(--green-primary)] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAllDone && total > 0 ? (
        <p className="text-xs text-[var(--green-dark)] font-medium mt-2.5">
          ✓ ครบตามเป้าหมายของวันนี้แล้ว ดูแลตัวเองได้ยอดเยี่ยมมาก
        </p>
      ) : completed > 0 ? (
        <p className="text-xs text-[var(--green-dark)] font-normal mt-2.5">
          ดีมาก เริ่มต้นได้ดีแล้ว ค่อย ๆ ทานอย่างมีสติ
        </p>
      ) : null}
    </div>
  );
}
