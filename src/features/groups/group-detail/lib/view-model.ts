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

export type GroupDetailCoreViewModel = {
  nameByUserId: Record<string, string>;
  membersForExpenseEdit: { user_id: string; label: string }[];
  menuMembers: { user_id: string; label: string; role: "owner" | "member" }[];
};

export type GroupDetailDashboardViewModel = {
  transferPreview: TransferPreview[];
  unpaidFeedItems: ExpenseFeedItemData[];
};

export type GroupDetailHistoryViewModel = {
  settledFeedItems: ExpenseFeedItemData[];
  unpaidFeedItems: ExpenseFeedItemData[];
};

export type GroupDetailScreenViewModel = GroupDetailCoreViewModel &
  GroupDetailDashboardViewModel &
  GroupDetailHistoryViewModel;

function buildNameByUserId(members: MemberRow[]): Record<string, string> {
  const nameByUserId: Record<string, string> = {};
  for (const m of members) {
    const name = m.profiles?.display_name?.trim() || "（未設定）";
    nameByUserId[m.user_id] = name;
  }
  return nameByUserId;
}

function toFeedItems(
  rows: ExpenseRow[],
  nameByUserId: Record<string, string>,
): ExpenseFeedItemData[] {
  return rows.map((e) => {
    const base: ExpenseFeedItemData = {
      id: e.id,
      amount: e.amount,
      expense_date: e.expense_date,
      title: e.title,
      category: e.category,
      payerLabel: nameByUserId[e.payer_id] ?? e.payer_id,
      participantCount: (e.expense_participants ?? []).length,
      participantsLine: `負担: ${(e.expense_participants ?? [])
        .map((p) => nameByUserId[p.user_id] ?? p.user_id)
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

export function buildGroupDetailCoreViewModel(
  members: MemberRow[],
): GroupDetailCoreViewModel {
  const nameByUserId = buildNameByUserId(members);

  const sortedMembers = [...members].sort((a, b) =>
    (nameByUserId[a.user_id] ?? "").localeCompare(
      nameByUserId[b.user_id] ?? "",
      "ja",
    ),
  );

  const membersForExpenseEdit = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameByUserId[m.user_id] ?? "（未設定）",
  }));

  const menuMembers = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameByUserId[m.user_id] ?? "（未設定）",
    role: (m.role === "owner" ? "owner" : "member") as "owner" | "member",
  }));

  return {
    nameByUserId,
    membersForExpenseEdit,
    menuMembers,
  };
}

export function buildGroupDetailDashboardViewModel(
  members: MemberRow[],
  unpaidExpenses: ExpenseRow[],
): GroupDetailDashboardViewModel {
  const nameByUserId = buildNameByUserId(members);
  const balancesInput: ExpenseForBalance[] = unpaidExpenses.map((e) => ({
    amount: e.amount,
    payer_id: e.payer_id,
    participant_ids: (e.expense_participants ?? []).map((p) => p.user_id),
  }));
  const netByUser = computeNetBalancesByUser(balancesInput);
  const transferPreview = computeGreedySettlementTransfers(netByUser);
  const unpaidFeedItems = toFeedItems(unpaidExpenses, nameByUserId);

  return {
    transferPreview,
    unpaidFeedItems,
  };
}

export function buildGroupDetailHistoryViewModel(
  members: MemberRow[],
  expenses: ExpenseRow[],
): GroupDetailHistoryViewModel {
  const nameByUserId = buildNameByUserId(members);
  const unpaidExpenses = expenses.filter((e) => e.status === "unpaid");
  const settledExpenses = expenses.filter((e) => e.status === "settled");

  return {
    unpaidFeedItems: toFeedItems(unpaidExpenses, nameByUserId),
    settledFeedItems: toFeedItems(settledExpenses, nameByUserId),
  };
}

/** @deprecated buildGroupDetailCore/Dashboard/HistoryViewModel を使用 */
export function buildGroupDetailViewModel(
  members: MemberRow[],
  expenses: ExpenseRow[],
): GroupDetailScreenViewModel {
  const core = buildGroupDetailCoreViewModel(members);
  const unpaidExpenses = expenses.filter((e) => e.status === "unpaid");
  const dashboard = buildGroupDetailDashboardViewModel(members, unpaidExpenses);
  const history = buildGroupDetailHistoryViewModel(members, expenses);

  return {
    ...core,
    ...dashboard,
    ...history,
  };
}
