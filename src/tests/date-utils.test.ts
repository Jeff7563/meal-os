import { describe, it, expect } from "vitest";
import {
  toCalendarDate,
  formatThaiDate,
  formatThaiDateShort,
  getDayLabelFromDate,
  addDaysToDateString,
  getWeekDates,
} from "@/lib/date-utils";

describe("Bangkok Timezone & Thai Date Utilities", () => {
  it("should format Bangkok date correctly even when UTC date is previous day", () => {
    // 00:30 AM in Bangkok (+07:00) on Sept 14 is 17:30 PM on Sept 13 in UTC
    const earlyMorningBangkok = new Date("2026-09-13T17:30:00Z");

    const bangkokDate = toCalendarDate(earlyMorningBangkok);
    // In UTC, this is Sept 13. In Asia/Bangkok, it MUST be Sept 14.
    expect(bangkokDate).toBe("2026-09-14");
  });

  it("should format Bangkok date correctly at 23:59 late night", () => {
    // 23:59 PM in Bangkok (+07:00) on Sept 14 is 16:59 PM on Sept 14 in UTC
    const lateNightBangkok = new Date("2026-09-14T16:59:00Z");

    const bangkokDate = toCalendarDate(lateNightBangkok);
    expect(bangkokDate).toBe("2026-09-14");
  });

  it("should preserve YYYY-MM-DD input string without alteration", () => {
    expect(toCalendarDate("2026-09-14")).toBe("2026-09-14");
    expect(toCalendarDate("2026-12-31")).toBe("2026-12-31");
  });

  it("should format Thai long date correctly", () => {
    // 2026-09-14 is Monday
    const formatted = formatThaiDate("2026-09-14");
    expect(formatted).toBe("วันจันทร์ที่ 14 กันยายน");

    const formattedWithYear = formatThaiDate("2026-09-14", true);
    expect(formattedWithYear).toBe("วันจันทร์ที่ 14 กันยายน 2569");
  });

  it("should format Thai short date correctly", () => {
    const formattedShort = formatThaiDateShort("2026-09-14");
    expect(formattedShort).toBe("จันทร์ 14 ก.ย.");
  });

  it("should get correct Thai day of week label", () => {
    expect(getDayLabelFromDate("2026-09-14")).toBe("จันทร์");
    expect(getDayLabelFromDate("2026-09-15")).toBe("อังคาร");
    expect(getDayLabelFromDate("2026-09-16")).toBe("พุธ");
    expect(getDayLabelFromDate("2026-09-20")).toBe("อาทิตย์");
  });

  it("should add days safely without UTC drift", () => {
    expect(addDaysToDateString("2026-09-14", 1)).toBe("2026-09-15");
    expect(addDaysToDateString("2026-09-14", 7)).toBe("2026-09-21");
    expect(addDaysToDateString("2026-09-14", -1)).toBe("2026-09-13");
  });

  it("should generate the full Monday-Sunday week dates regardless of which weekday is passed", () => {
    // 2026-09-17 is Thursday
    const week = getWeekDates("2026-09-17");
    expect(week.length).toBe(7);
    expect(week[0].date).toBe("2026-09-14"); // Monday
    expect(week[0].label).toBe("จันทร์");
    expect(week[6].date).toBe("2026-09-20"); // Sunday
    expect(week[6].label).toBe("อาทิตย์");
  });
});
