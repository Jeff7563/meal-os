import React from "react";

interface NutritionLineProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  showAll?: boolean;
  className?: string;
}

export function NutritionLine({
  calories,
  protein,
  carbs,
  fat,
  showAll = false,
  className = "",
}: NutritionLineProps) {
  const parts: string[] = [];

  if (calories != null) {
    parts.push(`${Math.round(calories)} kcal`);
  }
  if (protein != null) {
    parts.push(`โปรตีน ${Math.round(protein)} g`);
  }
  if (showAll) {
    if (carbs != null) {
      parts.push(`คาร์บ ${Math.round(carbs)} g`);
    }
    if (fat != null) {
      parts.push(`ไขมัน ${Math.round(fat)} g`);
    }
  }

  if (parts.length === 0) return null;

  return (
    <p
      className={`text-xs text-[var(--text-secondary)] font-normal flex items-center flex-wrap gap-1.5 ${className}`}
    >
      {parts.map((item, idx) => (
        <React.Fragment key={idx}>
          <span>{item}</span>
          {idx < parts.length - 1 && (
            <span className="text-[var(--text-muted)] opacity-60 font-bold">•</span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}
