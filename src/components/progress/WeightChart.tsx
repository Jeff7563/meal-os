import React from "react";
import { WeightRecord } from "@/types/meal";
import { formatThaiDateShort } from "@/lib/date-utils";

interface WeightChartProps {
  logs: WeightRecord[];
  className?: string;
}

export function WeightChart({ logs, className = "" }: WeightChartProps) {
  if (!logs || logs.length < 2) {
    return (
      <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
        บันทึกน้ำหนักอย่างน้อย 2 ครั้งเพื่อเริ่มแสดงกราฟความเปลี่ยนแปลง
      </div>
    );
  }

  // Sort chronological
  const sorted = [...logs].reverse();
  const weights = sorted.map((d) => d.weightKg);
  const minW = Math.floor(Math.min(...weights) - 0.5);
  const maxW = Math.ceil(Math.max(...weights) + 0.5);
  const range = maxW - minW || 1;

  const width = 500;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;

  const getX = (index: number) => {
    return paddingX + (index / (sorted.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const ratio = (val - minW) / range;
    return height - paddingY - ratio * (height - paddingY * 2);
  };

  const points = sorted.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.weightKg),
    val: item.weightKg,
    date: item.date,
  }));

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-48 select-none"
      >
        {/* Horizontal grid lines (Soft) */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          const labelVal = (minW + pct * range).toFixed(1);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-[var(--text-muted)] font-mono"
              >
                {labelVal}
              </text>
            </g>
          );
        })}

        {/* Thin minimal line (no neon, no gradient fill) */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--green-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="var(--surface-white)"
              stroke="var(--green-primary)"
              strokeWidth="2"
            />
            {/* Show label on first and last, and peak */}
            {(idx === 0 || idx === points.length - 1) && (
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                className="text-[10px] font-bold fill-[var(--text-primary)] font-mono"
              >
                {pt.val}
              </text>
            )}
            {/* X-axis date labels */}
            {(idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) && (
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[9px] fill-[var(--text-muted)]"
              >
                {formatThaiDateShort(pt.date, false)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
