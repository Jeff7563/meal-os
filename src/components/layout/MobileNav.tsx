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

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "วันนี้", icon: House, exact: true },
    { href: "/schedule", label: "ตาราง", icon: CalendarDays },
    { href: "/ingredients", label: "วัตถุดิบ", icon: ShoppingBasket },
    { href: "/progress", label: "ความคืบหน้า", icon: ChartNoAxesColumnIncreasing },
    { href: "/settings", label: "ตั้งค่า", icon: Settings },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(40,34,25,0.03)]"
      aria-label="เมนูหลักบนมือถือ"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-1.5 rounded-lg transition-colors ${
                isActive
                  ? "text-[var(--green-primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] font-normal"
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
