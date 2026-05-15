import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import type { ExpenseRow, MemberRow } from "./types";
import {
  computeNetBalancesByUser,
  type ExpenseForBalance,
} from "@/features/settlement/lib/dashboard-balances";
import {
  computeGreedySettlementTransfers,
  type TransferPreview,
} from "@/features/settlement/lib/settlement-transfers-preview";

export function todayJstYmd(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

export function currentMonthJstYm(): string {
  return todayJstYmd().slice(0, 7);
}

export type GroupDetailScreenViewModel = {
  nameById: Map<string, string>;
  transferPreview: TransferPreview[];
  unpaidFeedItems: ExpenseFeedItemData[];
  settledFeedItems: ExpenseFeedItemData[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  menuMembers: { user_id: string; label: string; role: "owner" | "member" }[];
};

function toFeedItems(
  rows: ExpenseRow[],
  nameById: Map<string, string>,
): ExpenseFeedItemData[] {
  return rows.map((e) => {
    const base: ExpenseFeedItemData = {
      id: e.id,
      amount: e.amount,
      expense_date: e.expense_date,
      title: e.title,
      category: e.category,
      payerLabel: nameById.get(e.payer_id) ?? e.payer_id,
      participantCount: (e.expense_participants ?? []).length,
      participantsLine: `負担: ${(e.expense_participants ?? [])
        .map((p) => nameById.get(p.user_id) ?? p.user_id)
        .join("・")}`,
    };
    if (e.status !== "unpaid") return base;
    return {
      ...base,
      payerId: e.payer_id,
      participantIds: (e.expense_participants ?? []).map((p) => p.user_id),
      editable: true,
    };
  });
}

export function buildGroupDetailViewModel(
  members: MemberRow[],
  expenses: ExpenseRow[],
): GroupDetailScreenViewModel {
  const nameById = new Map<string, string>();
  for (const m of members) {
    const name = m.profiles?.display_name?.trim() || "（未設定）";
    nameById.set(m.user_id, name);
  }

  const unpaidExpenses = expenses.filter((e) => e.status === "unpaid");
  const settledExpenses = expenses.filter((e) => e.status === "settled");
  const balancesInput: ExpenseForBalance[] = unpaidExpenses.map((e) => ({
    amount: e.amount,
    payer_id: e.payer_id,
    participant_ids: (e.expense_participants ?? []).map((p) => p.user_id),
  }));
  const netByUser = computeNetBalancesByUser(balancesInput);

  const sortedMembers = [...members].sort((a, b) =>
    (nameById.get(a.user_id) ?? "").localeCompare(
      nameById.get(b.user_id) ?? "",
      "ja",
    ),
  );

  const membersForExpenseEdit = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameById.get(m.user_id) ?? "（未設定）",
  }));

  const menuMembers = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameById.get(m.user_id) ?? "（未設定）",
    role: (m.role === "owner" ? "owner" : "member") as "owner" | "member",
  }));

  const transferPreview = computeGreedySettlementTransfers(netByUser);

  const unpaidFeedItems = toFeedItems(unpaidExpenses, nameById);
  const settledFeedItems = toFeedItems(settledExpenses, nameById);

  return {
    nameById,
    transferPreview,
    unpaidFeedItems,
    settledFeedItems,
    membersForExpenseEdit,
    menuMembers,
  };
}
