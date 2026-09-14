import { Sunrise, Sun, Moon, Apple } from "lucide-react";
import { MealType } from "@/types/meal";

interface MealTypeBadgeProps {
  type: MealType;
  time?: string;
  className?: string;
}

export function MealTypeBadge({ type, time, className = "" }: MealTypeBadgeProps) {
  const config = {
    BREAKFAST: {
      label: "เช้า",
      icon: Sunrise,
      bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50",
    },
    LUNCH: {
      label: "กลางวัน",
      icon: Sun,
      bg: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50",
    },
    DINNER: {
      label: "เย็น",
      icon: Moon,
      bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50",
    },
    SNACK: {
      label: "ของว่าง",
      icon: Apple,
      bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
    },
  }[type] || {
    label: type,
    icon: Sun,
    bg: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {time && (
        <>
          <span className="opacity-40">•</span>
          <span className="font-mono text-[11px] font-normal">{time}</span>
        </>
      )}
    </div>
  );
}
