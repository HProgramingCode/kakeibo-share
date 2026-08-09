import { describe, expect, it } from "vitest";
import {
  buildDayOptions,
  clampDay,
  composeYm,
  composeYmd,
  daysInMonth,
  parseYm,
  parseYmd,
  resolveYmParts,
  resolveYmdParts,
} from "./expense-date-pick";

describe("parseYm / composeYm", () => {
  it("parses and composes YYYY-MM", () => {
    expect(parseYm("2026-05")).toEqual({ year: 2026, month: 5 });
    expect(composeYm(2026, 5)).toBe("2026-05");
  });

  it("rejects invalid month", () => {
    expect(parseYm("2026-13")).toBeNull();
    expect(parseYm("bad")).toBeNull();
  });
});

describe("parseYmd / composeYmd", () => {
  it("parses and composes YYYY-MM-DD", () => {
    expect(parseYmd("2026-05-22")).toEqual({ year: 2026, month: 5, day: 22 });
    expect(composeYmd(2026, 5, 22)).toBe("2026-05-22");
  });

  it("rejects invalid day for month", () => {
    expect(parseYmd("2026-02-30")).toBeNull();
    expect(parseYmd("2026-04-31")).toBeNull();
  });
});

describe("daysInMonth / clampDay", () => {
  it("returns days per calendar month", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 5)).toBe(31);
  });

  it("clamps day to valid range", () => {
    expect(clampDay(2026, 2, 31)).toBe(28);
    expect(clampDay(2026, 5, 0)).toBe(1);
  });
});

describe("buildDayOptions", () => {
  it("matches daysInMonth length", () => {
    expect(buildDayOptions(2026, 2)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28,
    ]);
  });
});

describe("resolveYmParts / resolveYmdParts", () => {
  it("falls back when default is invalid", () => {
    expect(resolveYmParts("invalid", 2026)).toEqual({ year: 2026, month: 1 });
    expect(resolveYmdParts("invalid", 2026, 5, 10)).toEqual({
      year: 2026,
      month: 5,
      day: 10,
    });
  });
});
