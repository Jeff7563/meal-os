"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CalendarDays,
  ShoppingBasket,
  ChartNoAxesColumnIncreasing,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function DesktopSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "วันนี้", icon: House, exact: true },
    { href: "/schedule", label: "ตารางอาหาร", icon: CalendarDays },
    { href: "/ingredients", label: "วัตถุดิบ", icon: ShoppingBasket },
    { href: "/progress", label: "ความคืบหน้า", icon: ChartNoAxesColumnIncreasing },
    { href: "/settings", label: "ตั้งค่า", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[230px] border-r border-[var(--border)] bg-[var(--background-soft)] h-screen sticky top-0 px-4 py-6 justify-between shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1.5 group">
          <div className="w-9 h-9 rounded-2xl bg-[var(--green-primary)] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
            {/* Minimal Leaf / Bowl Icon */}
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7c4.5 0 8 3 8 7a7 7 0 0 1-8 7Z" />
              <path d="M11 13c1.5 0 3-1.5 3-3" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-[var(--text-primary)] text-base tracking-tight leading-tight">
              Meal OS
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal mt-0.5">
              กินดีในแบบของเรา
            </p>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1" aria-label="เมนูหลักสำหรับคอมพิวเตอร์">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--green-soft)] text-[var(--green-dark)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--border-soft)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 stroke-[1.8] ${
                    isActive ? "text-[var(--green-dark)]" : "text-[var(--text-muted)]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Warm Minimal Theme Toggle */}
      <div className="pt-4 border-t border-[var(--border-soft)] flex items-center justify-between px-2">
        <span className="text-xs text-[var(--text-muted)] font-normal">โหมดหน้าจอ</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
