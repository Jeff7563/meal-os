"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Utensils,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Settings,
  Sparkles,
  Download,
  Upload,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function DesktopSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "วันนี้ (Today)", icon: Utensils, exact: true },
    { href: "/schedule", label: "ตารางอาหาร (Schedule)", icon: Calendar },
    { href: "/ingredients", label: "วัตถุดิบ & ช้อปปิ้ง", icon: ShoppingCart },
    { href: "/progress", label: "สถิติ & น้ำหนัก", icon: TrendingUp },
    { href: "/settings", label: "ตั้งค่า (Settings)", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md h-screen sticky top-0 px-4 py-6 justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-3 py-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-none text-base">
              Meal OS
            </h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Personal Health Diet
            </p>
          </div>
        </Link>

        {/* Nav list */}
        <nav className="space-y-1.5" aria-label="เมนูหลักสำหรับคอมพิวเตอร์">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "opacity-70"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AI Meal Plan
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <Link
              href="/settings/import"
              className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import จาก ChatGPT</span>
            </Link>
            <a
              href="/api/export"
              download
              className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ตารางอาหาร JSON</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
        <span className="text-xs text-slate-400">โหมดการแสดงผล</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
