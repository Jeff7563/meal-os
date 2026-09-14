import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMealDetail } from "@/lib/repository";
import { MealDetailView } from "@/components/meal/MealDetailView";
import { getBangkokTodayString } from "@/lib/date-utils";
import { ArrowLeft, AlertCircle } from "lucide-react";

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
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          เกิดข้อผิดพลาดในการโหลดข้อมูลเมนูอาหาร
        </h1>
        <p className="text-xs text-slate-500">{msg}</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
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
