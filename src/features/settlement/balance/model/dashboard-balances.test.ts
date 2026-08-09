import { describe, expect, it } from "vitest";
import {
  computeExpenseShares,
  computeNetBalancesByUser,
  computeParticipantShares,
  type ExpenseForBalance,
} from "@/features/settlement/balance/model/dashboard-balances";
import {
  isExactShareSumValid,
  validateParticipantShares,
} from "@/features/expenses/form/model/validate-participant-shares";
import { computePairwiseSettlementTransfers } from "@/features/settlement/balance/model/settlement-transfers-preview";

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

describe("computePairwiseSettlementTransfers", () => {
  it("同じ二人の逆方向の負担だけを相殺する", () => {
    const transfers = computePairwiseSettlementTransfers([
      { amount: 1_000, payer_id: "user-c", participant_ids: ["user-b"] },
      { amount: 400, payer_id: "user-b", participant_ids: ["user-c"] },
    ]);

    expect(transfers).toEqual([
      { from_user_id: "user-b", to_user_id: "user-c", amount: 600 },
    ]);
  });

  it("三者間の連鎖を別の相手への送金に振り替えない", () => {
    const transfers = computePairwiseSettlementTransfers([
      { amount: 1_000, payer_id: "user-c", participant_ids: ["user-b"] },
      { amount: 1_000, payer_id: "user-a", participant_ids: ["user-c"] },
    ]);

    expect(transfers).toEqual([
      { from_user_id: "user-b", to_user_id: "user-c", amount: 1_000 },
      { from_user_id: "user-c", to_user_id: "user-a", amount: 1_000 },
    ]);
  });

  it("金額指定と、立替者を含まない均等割に対応する", () => {
    const transfers = computePairwiseSettlementTransfers([
      {
        amount: 1_000,
        payer_id: "payer-a",
        participant_ids: ["payer-a", "user-b"],
        split_mode: "exact",
        share_amounts: { "payer-a": 300, "user-b": 700 },
      },
      {
        amount: 101,
        payer_id: "payer-a",
        participant_ids: ["user-c", "user-d"],
      },
    ]);

    expect(transfers).toEqual([
      { from_user_id: "user-b", to_user_id: "payer-a", amount: 700 },
      { from_user_id: "user-c", to_user_id: "payer-a", amount: 50 },
      { from_user_id: "user-d", to_user_id: "payer-a", amount: 50 },
    ]);
  });
});
