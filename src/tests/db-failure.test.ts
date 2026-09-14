import { describe, it, expect, vi, beforeEach } from "vitest";
import * as repo from "@/lib/repository";
import { toggleMealCompleteAction, setMealStatusAction } from "@/lib/meal-log/actions";
import { updateShoppingStatusAction } from "@/lib/shopping/actions";
import { logWeightAction } from "@/lib/weight/actions";
import { executeImportAction } from "@/lib/import/actions";
import { getInitialSeedPlan } from "@/lib/seed-data";

describe("Database Failure & Resilient Mutation Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should reject setMealStatus and NOT pretend success when database is disconnected in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      vi.spyOn(repo, "isDatabaseConnected").mockResolvedValue(false);
      await expect(repo.setMealStatus("meal-1", "2026-09-14", "COMPLETED")).rejects.toThrow();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("toggleMealCompleteAction should return success: false when repository mutation fails", async () => {
    vi.spyOn(repo, "toggleMealStatus").mockRejectedValue(
      new Error("Database connection lost")
    );

    const result = await toggleMealCompleteAction("meal-1", "2026-09-14");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Database connection lost");
  });

  it("setMealStatusAction should return success: false with error details on DB failure", async () => {
    vi.spyOn(repo, "setMealStatus").mockRejectedValue(
      new Error("PostgreSQL unreachable")
    );

    const result = await setMealStatusAction("meal-1", "2026-09-14", "COMPLETED");
    expect(result.success).toBe(false);
    expect(result.error).toContain("PostgreSQL unreachable");
  });

  it("updateShoppingStatusAction should return success: false when DB update fails", async () => {
    vi.spyOn(repo, "updateShoppingItemStatus").mockRejectedValue(
      new Error("Database timeout")
    );

    const result = await updateShoppingStatusAction("อกไก่", "g", "PURCHASED");
    expect(result.success).toBe(false);
  });

  it("logWeightAction should return success: false on database error", async () => {
    vi.spyOn(repo, "addWeightLog").mockRejectedValue(
      new Error("Database connection error")
    );

    const result = await logWeightAction(75.5, "test weight", "2026-09-14");
    expect(result.success).toBe(false);
  });

  it("executeImportAction should abort and return success: false on DB error", async () => {
    vi.spyOn(repo, "importMealPlan").mockRejectedValue(
      new Error("Transaction rolled back: Connection terminated")
    );

    const planData = getInitialSeedPlan("2026-09-14");
    const result = await executeImportAction(planData, "replace");

    expect(result.success).toBe(false);
    expect(result.message).toContain("เกิดข้อผิดพลาดระหว่างนำเข้า");
  });
});
