export type ParsedYm = { year: number; month: number };
export type ParsedYmd = { year: number; month: number; day: number };

const YM_RE = /^(\d{4})-(\d{2})$/;
const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseYm(value: string): ParsedYm | null {
  const m = value.trim().match(YM_RE);
  if (!m) return null;
  const year = Number.parseInt(m[1] ?? "", 10);
  const month = Number.parseInt(m[2] ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function parseYmd(value: string): ParsedYmd | null {
  const m = value.trim().match(YMD_RE);
  if (!m) return null;
  const year = Number.parseInt(m[1] ?? "", 10);
  const month = Number.parseInt(m[2] ?? "", 10);
  const day = Number.parseInt(m[3] ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function composeYm(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

export function composeYmd(year: number, month: number, day: number): string {
  return `${composeYm(year, month)}-${String(day).padStart(2, "0")}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function clampDay(year: number, month: number, day: number): number {
  const max = daysInMonth(year, month);
  return Math.min(Math.max(day, 1), max);
}

export function buildYearOptions(
  anchorYear: number,
  span = 3,
): number[] {
  const years: number[] = [];
  for (let y = anchorYear - span; y <= anchorYear + span; y += 1) {
    years.push(y);
  }
  return years;
}

export function buildMonthOptions(): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

export function buildDayOptions(year: number, month: number): number[] {
  const count = daysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => i + 1);
}

export function resolveYmParts(
  defaultValue: string,
  fallbackYear: number,
): ParsedYm {
  const parsed = parseYm(defaultValue);
  if (parsed) return parsed;
  return { year: fallbackYear, month: 1 };
}

export function resolveYmdParts(
  defaultValue: string,
  fallbackYear: number,
  fallbackMonth: number,
  fallbackDay: number,
): ParsedYmd {
  const parsed = parseYmd(defaultValue);
  if (parsed) return parsed;
  return {
    year: fallbackYear,
    month: fallbackMonth,
    day: clampDay(fallbackYear, fallbackMonth, fallbackDay),
  };
}
