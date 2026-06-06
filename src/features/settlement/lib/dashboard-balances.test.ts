import { describe, expect, it } from "vitest";
import {
  computeExpenseShares,
  computeNetBalancesByUser,
  computeParticipantShares,
  type ExpenseForBalance,
} from "@/features/settlement/lib/dashboard-balances";
import {
  isExactShareSumValid,
  validateParticipantShares,
} from "@/features/expenses/lib/validate-participant-shares";

describe("computeParticipantShares", () => {
  it("立替者が負担に含まれるときは均等割＋端数を立替者に寄せる", () => {
    const payer = "payer-a";
    const other = "user-b";
    const shares = computeParticipantShares(101, payer, [payer, other]);

    expect(shares.get(payer)).toBe(51);
    expect(shares.get(other)).toBe(50);
  });

  it("立替者が負担に含まれないときは参加者に均等割し端数のみ立替者", () => {
    const payer = "payer-a";
    const b = "user-b";
    const c = "user-c";
    const shares = computeParticipantShares(101, payer, [b, c]);

    expect(shares.get(payer)).toBe(1);
    expect(shares.get(b)).toBe(50);
    expect(shares.get(c)).toBe(50);
  });
});

describe("computeExpenseShares", () => {
  it("金額指定モードでは share_amount をそのまま使う", () => {
    const shares = computeExpenseShares({
      amount: 3000,
      payerId: "payer-a",
      participantIds: ["payer-a", "user-b"],
      splitMode: "exact",
      shareAmounts: { "payer-a": 1200, "user-b": 1800 },
    });

    expect(shares.get("payer-a")).toBe(1200);
    expect(shares.get("user-b")).toBe(1800);
  });
});

describe("computeNetBalancesByUser", () => {
  it("立替のみの支出でもネット合計がゼロになる", () => {
    const expenses: ExpenseForBalance[] = [
      {
        amount: 101,
        payer_id: "payer-a",
        participant_ids: ["user-b", "user-c"],
      },
    ];

    const net = computeNetBalancesByUser(expenses);
    const sum = [...net.values()].reduce((a, b) => a + b, 0);

    expect(sum).toBe(0);
    expect(net.get("payer-a")).toBe(100);
    expect(net.get("user-b")).toBe(-50);
    expect(net.get("user-c")).toBe(-50);
  });

  it("金額指定の支出でもネット合計がゼロになる", () => {
    const expenses: ExpenseForBalance[] = [
      {
        amount: 3000,
        payer_id: "payer-a",
        participant_ids: ["payer-a", "user-b"],
        split_mode: "exact",
        share_amounts: { "payer-a": 1000, "user-b": 2000 },
      },
    ];

    const net = computeNetBalancesByUser(expenses);
    const sum = [...net.values()].reduce((a, b) => a + b, 0);

    expect(sum).toBe(0);
    expect(net.get("payer-a")).toBe(2000);
    expect(net.get("user-b")).toBe(-2000);
  });
});

describe("validateParticipantShares", () => {
  it("均等割は参加者がいれば OK", () => {
    const result = validateParticipantShares(1000, "equal", [
      { userId: "a", shareAmount: null },
    ]);
    expect(result.ok).toBe(true);
  });

  it("金額指定は合計一致が必須", () => {
    const ok = validateParticipantShares(1000, "exact", [
      { userId: "a", shareAmount: 400 },
      { userId: "b", shareAmount: 600 },
    ]);
    expect(ok.ok).toBe(true);

    const ng = validateParticipantShares(1000, "exact", [
      { userId: "a", shareAmount: 400 },
      { userId: "b", shareAmount: 500 },
    ]);
    expect(ng.ok).toBe(false);
  });
});

describe("isExactShareSumValid", () => {
  it("合計一致のみ true", () => {
    expect(
      isExactShareSumValid(1000, { a: 400, b: 600 }, ["a", "b"]),
    ).toBe(true);
    expect(
      isExactShareSumValid(1000, { a: 400, b: 500 }, ["a", "b"]),
    ).toBe(false);
  });
});
