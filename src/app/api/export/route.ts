import { NextResponse } from "next/server";
import { exportMealPlan } from "@/lib/repository";

export async function GET() {
  try {
    const data = await exportMealPlan();
    const fileName = `meal-plan-${data.plan.startDate || "export"}.json`;

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to export meal plan", details: message },
      { status: 500 }
    );
  }
}
