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
    <header className="flex items-center justify-between py-4 mb-2">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            สวัสดี 👋 {userName}
          </h1>
        </div>
        <p className="text-xs md:text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
          {thaiDate}
        </p>
      </div>

      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </header>
  );
}
