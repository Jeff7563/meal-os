import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMealDetail } from "@/lib/repository";
import { MealDetailView } from "@/components/meal/MealDetailView";
import { getBangkokTodayString } from "@/lib/date-utils";
import { ArrowLeft, Info } from "lucide-react";

interface MealDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

export const dynamic = "force-dynamic";

export default async function MealDetailPage({
  params,
  searchParams,
}: MealDetailPageProps) {
  const { id } = await params;
  const { date } = await searchParams;
  const dateStr = date || getBangkokTodayString();

  let meal;
  try {
    meal = await getMealDetail(id, dateStr);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--orange-soft)] text-[var(--orange-primary)] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          เกิดข้อผิดพลาดในการโหลดข้อมูลเมนูอาหาร
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">{msg}</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-semibold bg-[var(--green-primary)] text-white hover:bg-[var(--green-dark)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!meal) {
    notFound();
  }

  return <MealDetailView meal={meal} dateStr={dateStr} />;
}
