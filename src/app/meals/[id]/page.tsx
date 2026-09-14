import React from "react";
import { notFound } from "next/navigation";
import { getMealDetail } from "@/lib/repository";
import { MealDetailView } from "@/components/meal/MealDetailView";
import { getBangkokTodayString } from "@/lib/date-utils";

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

  const meal = await getMealDetail(id, dateStr);

  if (!meal) {
    notFound();
  }

  return <MealDetailView meal={meal} dateStr={dateStr} />;
}
