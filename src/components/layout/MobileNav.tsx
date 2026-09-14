"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, Calendar, ShoppingCart, TrendingUp, Settings } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "วันนี้", icon: Utensils, exact: true },
    { href: "/schedule", label: "ตาราง", icon: Calendar },
    { href: "/ingredients", label: "วัตถุดิบ", icon: ShoppingCart },
    { href: "/progress", label: "สถิติ", icon: TrendingUp },
    { href: "/settings", label: "ตั้งค่า", icon: Settings },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe"
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
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-normal"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? "bg-emerald-50 dark:bg-emerald-950/60 scale-110" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
