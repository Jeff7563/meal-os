import { formatThaiDateLong, getBangkokTodayString } from "@/lib/date-utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface TopHeaderProps {
  userName?: string;
  customDate?: string;
}

export function TopHeader({ userName = "คุณเจฟฟี่", customDate }: TopHeaderProps) {
  const dateStr = customDate || getBangkokTodayString();
  const thaiDate = formatThaiDateLong(dateStr);

  return (
    <header className="space-y-3 pt-1 pb-2 select-none">
      {/* Top Greeting bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <span>สวัสดี 👋</span>
            {userName && <span>{userName}</span>}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-normal mt-0.5">
            ดูแลตัวเองดี ๆ ในวันนี้นะ
          </p>
        </div>

        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Title: วันนี้กินอะไร (Visual Anchor) */}
      <div className="pt-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            วันนี้กินอะไร
          </h2>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--orange-primary)]" />
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
          {thaiDate}
        </p>
      </div>
    </header>
  );
}
