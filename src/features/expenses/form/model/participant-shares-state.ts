import type { ExpenseMember } from "@/features/expenses/form/model/expense-member";
import { computeParticipantShares } from "@/features/settlement/balance/model/dashboard-balances";

export function resolveIncluded(
  members: ExpenseMember[],
  payerId: string,
  initialParticipantIds?: string[],
): Record<string, boolean> {
  const included: Record<string, boolean> = {};
  for (const m of members) {
    included[m.user_id] = initialParticipantIds
      ? initialParticipantIds.includes(m.user_id)
      : m.user_id === payerId;
  }
  return included;
}

export function buildShareAmountsFromEqual(
  amount: number,
  payerId: string,
  participantIds: string[],
): Record<string, number> {
  const shares = computeParticipantShares(amount, payerId, participantIds);
  const out: Record<string, number> = {};
  for (const uid of participantIds) {
    out[uid] = shares.get(uid) ?? 0;
  }
  return out;
}
