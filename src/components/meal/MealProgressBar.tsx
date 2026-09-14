interface MealProgressBarProps {
  completed: number;
  total: number;
  title?: string;
  className?: string;
}

export function MealProgressBar({
  completed,
  total,
  title = "วันนี้",
  className = "",
}: MealProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isComplete = total > 0 && completed >= total;

  return (
    <div
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {completed} / {total}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">มื้อ</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
            ({percentage}%)
          </span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-emerald-600 to-emerald-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isComplete && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
          🎉 ยอดเยี่ยมมาก! กินครบตามเป้าหมายของวันนี้แล้ว
        </p>
      )}
    </div>
  );
}
