import type { ExpenseSplitMode } from "@/features/expenses/lib/split-mode";

export type ParticipantShareInput = {
  userId: string;
  shareAmount: number | null;
};

export type ValidateParticipantSharesResult =
  | { ok: true; shares: Map<string, number> }
  | { ok: false; message: string };

/**
 * 分割方式・参加者・負担額の整合性を検証する（Server Action / クライアント共用）。
 */
export function validateParticipantShares(
  amount: number,
  splitMode: ExpenseSplitMode,
  participants: ParticipantShareInput[],
): ValidateParticipantSharesResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "金額は1円以上の整数で入力してください。" };
  }

  if (participants.length === 0) {
    return {
      ok: false,
      message: "負担に含めるメンバーを1人以上選んでください。",
    };
  }

  if (splitMode === "equal") {
    return { ok: true, shares: new Map() };
  }

  const shares = new Map<string, number>();
  let sum = 0;

  for (const p of participants) {
    const v = p.shareAmount;
    if (v == null || !Number.isFinite(v) || v <= 0) {
      return {
        ok: false,
        message: "金額指定では各参加者の負担額を1円以上で入力してください。",
      };
    }
    if (!Number.isInteger(v)) {
      return {
        ok: false,
        message: "負担額は整数（円）で入力してください。",
      };
    }
    shares.set(p.userId, v);
    sum += v;
  }

  if (sum !== amount) {
    return {
      ok: false,
      message: "負担額の合計が支出金額と一致していません。",
    };
  }

  return { ok: true, shares };
}

/** クライアント UI 用: 合計一致のみ判定 */
export function isExactShareSumValid(
  amount: number,
  includedShares: Record<string, number | "">,
  activeParticipantIds: string[],
): boolean {
  if (amount <= 0 || activeParticipantIds.length === 0) return false;

  let sum = 0;
  for (const uid of activeParticipantIds) {
    const raw = includedShares[uid];
    const v =
      typeof raw === "number"
        ? raw
        : raw === ""
          ? NaN
          : Number.parseInt(String(raw), 10);
    if (!Number.isFinite(v) || v <= 0 || !Number.isInteger(v)) return false;
    sum += v;
  }

  return sum === amount;
}
