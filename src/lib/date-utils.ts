// Utilities for Asia/Bangkok Timezone and Thai Date formatting

export const BANGKOK_TZ = "Asia/Bangkok";

export const THAI_DAYS = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

export const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/**
 * Returns current date string in Asia/Bangkok timezone: YYYY-MM-DD
 */
export function getBangkokTodayString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Converts a Date object or timestamp to YYYY-MM-DD in Asia/Bangkok
 */
export function toBangkokDateString(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return getBangkokTodayString();
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Parses YYYY-MM-DD into a localized Thai date format
 * Example: "2026-09-14" -> "วันจันทร์ที่ 14 กันยายน"
 */
export function formatThaiDateLong(dateStr: string, includeYear = false): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr || "";
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  // Use noon to avoid any midnight timezone shifting
  const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const dayOfWeekIndex = dateObj.getUTCDay();

  const dayName = THAI_DAYS[dayOfWeekIndex];
  const monthName = THAI_MONTHS_FULL[month];
  const buddhistYear = year + 543;

  if (includeYear) {
    return `วัน${dayName}ที่ ${day} ${monthName} ${buddhistYear}`;
  }
  return `วัน${dayName}ที่ ${day} ${monthName}`;
}

/**
 * Format short: "14 ก.ย." or "จันทร์ 14 ก.ย."
 */
export function formatThaiDateShort(dateStr: string, includeDayName = true): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const dayOfWeekIndex = dateObj.getUTCDay();
  const dayName = THAI_DAYS[dayOfWeekIndex];
  const monthName = THAI_MONTHS_SHORT[month];

  if (includeDayName) {
    return `${dayName} ${day} ${monthName}`;
  }
  return `${day} ${monthName}`;
}

/**
 * Get weekday label for a YYYY-MM-DD string: "จันทร์", "อังคาร", etc.
 */
export function getDayLabelFromDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return THAI_DAYS[dateObj.getUTCDay()];
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string safely
 */
export function addDaysToDateString(dateStr: string, daysToAdd: number): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const dateObj = new Date(Date.UTC(year, month, day + daysToAdd, 12, 0, 0));
  const resYear = dateObj.getUTCFullYear();
  const resMonth = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const resDay = String(dateObj.getUTCDate()).padStart(2, "0");

  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Returns array of 7 dates for the week containing the given date (starts on Monday)
 */
export function getWeekDates(baseDateStr: string): { date: string; label: string; dayIndex: number }[] {
  const [yearStr, monthStr, dayStr] = baseDateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0));
  // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const dayOfWeek = dateObj.getUTCDay();
  // We want Monday as index 0 in week
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const mondayDate = new Date(Date.UTC(year, month, day + diffToMonday, 12, 0, 0));

  const week: { date: string; label: string; dayIndex: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(Date.UTC(mondayDate.getUTCFullYear(), mondayDate.getUTCMonth(), mondayDate.getUTCDate() + i, 12, 0, 0));
    const curYear = current.getUTCFullYear();
    const curMonth = String(current.getUTCMonth() + 1).padStart(2, "0");
    const curDay = String(current.getUTCDate()).padStart(2, "0");
    const curDateStr = `${curYear}-${curMonth}-${curDay}`;

    week.push({
      date: curDateStr,
      label: THAI_DAYS[current.getUTCDay()],
      dayIndex: i + 1,
    });
  }

  return week;
}
