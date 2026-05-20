import { describe, expect, it } from "vitest";
import {
  buildHistoryMonthOptions,
  filterBatchesByMonth,
  filterExpensesByMonth,
  filterSettledByMonth,
} from "./history-month-filter";

describe("buildHistoryMonthOptions", () => {
  it("includes current month even when no settled items or batches", () => {
    expect(buildHistoryMonthOptions([], [], [], "2026-05")).toEqual(["2026-05"]);
  });

  it("merges months from settled, unpaid, and batches and sorts descending", () => {
    const options = buildHistoryMonthOptions(
      [{ expense_date: "2026-03-10" }],
      [{ expense_date: "2026-05-02" }],
      [{ target_month: "2026-04" }],
      "2026-06",
    );
    expect(options).toEqual(["2026-06", "2026-05", "2026-04", "2026-03"]);
  });

  it("includes month that only has unpaid expenses", () => {
    const options = buildHistoryMonthOptions(
      [],
      [{ expense_date: "2026-07-15" }],
      [],
      "2026-05",
    );
    expect(options).toContain("2026-07");
  });
});

describe("filterExpensesByMonth", () => {
  it("filters by expense_date year-month", () => {
    const items = [
      { expense_date: "2026-05-02", id: "a" },
      { expense_date: "2026-04-21", id: "b" },
    ];
    expect(filterExpensesByMonth(items, "2026-05")).toEqual([
      { expense_date: "2026-05-02", id: "a" },
    ]);
  });
});

describe("filterSettledByMonth alias", () => {
  it("matches filterExpensesByMonth", () => {
    const items = [{ expense_date: "2026-05-02", id: "a" }];
    expect(filterSettledByMonth(items, "2026-05")).toEqual(
      filterExpensesByMonth(items, "2026-05"),
    );
  });
});

describe("filterBatchesByMonth", () => {
  it("filters by target_month", () => {
    const batches = [
      { target_month: "2026-05", id: "1" },
      { target_month: "2026-04", id: "2" },
    ];
    expect(filterBatchesByMonth(batches, "2026-05")).toEqual([
      { target_month: "2026-05", id: "1" },
    ]);
  });
});
