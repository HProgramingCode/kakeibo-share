import { describe, expect, it } from "vitest";
import {
  computeNetBalancesByUser,
  computeParticipantShares,
  type ExpenseForBalance,
} from "@/features/settlement/lib/dashboard-balances";

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
});
