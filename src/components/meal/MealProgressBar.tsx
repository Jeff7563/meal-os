import React from "react";
import { DailySummary } from "@/components/meal/DailySummary";

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
  return (
    <DailySummary
      completed={completed}
      total={total}
      dayLabel={title}
      className={className}
    />
  );
}
