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
      style: "bg-[#FFF6E9] text-[#9A6B25] border-[#F2E0C4] dark:bg-[#2F2414] dark:text-[#E8BD7F] dark:border-[#4A3920]",
    },
    LUNCH: {
      label: "กลางวัน",
      icon: Sun,
      style: "bg-[#F1F7EE] text-[#4A6E46] border-[#DCEAD6] dark:bg-[#1E2B1C] dark:text-[#A7CBA3] dark:border-[#33462F]",
    },
    DINNER: {
      label: "เย็น",
      icon: Moon,
      style: "bg-[#F5F2EC] text-[#6E6454] border-[#E5DFD4] dark:bg-[#282521] dark:text-[#C5BCAF] dark:border-[#3F3A33]",
    },
    SNACK: {
      label: "ของว่าง",
      icon: Apple,
      style: "bg-[#F0F6F1] text-[#4D714E] border-[#D8E6D9] dark:bg-[#1D291E] dark:text-[#A4C4A5] dark:border-[#314332]",
    },
  }[type] || {
    label: type,
    icon: Sun,
    style: "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]",
  };

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 stroke-[2] shrink-0" />
      <span>{config.label}</span>
      {time && (
        <>
          <span className="opacity-30">•</span>
          <span className="font-mono text-[11px] opacity-90">{time}</span>
        </>
      )}
    </div>
  );
}
