"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[var(--border-soft)] animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-soft)] transition-colors"
      aria-label={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
      title={isDark ? "ธีมสว่าง" : "ธีมมืด"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[var(--orange-primary)] stroke-[2]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
      )}
    </button>
  );
}
