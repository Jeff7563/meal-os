import { describe, it, expect } from "vitest";

describe("Meal Progress Calculation Tests", () => {
  function calculateAdherence(completed: number, total: number) {
    if (total <= 0) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  }

  function calculateStreak(days: { completed: number; total: number; isToday: boolean }[]) {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i];
      if (d.completed > 0) {
        streak++;
      } else if (!d.isToday) {
        break;
      }
    }
    return streak;
  }

  it("should accurately compute today's percentage (2/3 -> 67%)", () => {
    expect(calculateAdherence(2, 3)).toBe(67);
    expect(calculateAdherence(3, 3)).toBe(100);
    expect(calculateAdherence(0, 3)).toBe(0);
  });

  it("should accurately compute weekly adherence (18/21 -> 86%)", () => {
    expect(calculateAdherence(18, 21)).toBe(86);
    expect(calculateAdherence(21, 21)).toBe(100);
  });

  it("should accurately compute streak consecutive days", () => {
    const weekHistory = [
      { completed: 3, total: 3, isToday: false }, // Mon
      { completed: 3, total: 3, isToday: false }, // Tue
      { completed: 3, total: 3, isToday: false }, // Wed
      { completed: 2, total: 3, isToday: true },  // Thu (Today)
      { completed: 0, total: 3, isToday: false }, // Fri
      { completed: 0, total: 3, isToday: false }, // Sat
      { completed: 0, total: 3, isToday: false }, // Sun
    ];

    // From Mon to Thu = 4 days
    const streak = calculateStreak(weekHistory.slice(0, 4));
    expect(streak).toBe(4);
  });
});
