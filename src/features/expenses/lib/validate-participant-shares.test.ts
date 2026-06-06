import { describe, expect, it } from "vitest";
import {
  isExactShareSumValid,
  validateParticipantShares,
} from "@/features/expenses/lib/validate-participant-shares";

describe("validateParticipantShares edge cases", () => {
  it("0円以下の負担額を拒否する", () => {
    const result = validateParticipantShares(100, "exact", [
      { userId: "a", shareAmount: 0 },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("isExactShareSumValid edge cases", () => {
  it("空文字は不一致", () => {
    expect(isExactShareSumValid(100, { a: "" }, ["a"])).toBe(false);
  });
});
