import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import type { ExpenseRow, MemberRow } from "./types";
import type { ExpenseForBalance } from "@/features/settlement/balance/model/dashboard-balances";
import {
  computePairwiseSettlementTransfers,
  type TransferPreview,
} from "@/features/settlement/balance/model/settlement-transfers-preview";

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

function parseSplitMode(raw: string): ExpenseSplitMode {
  return raw === "exact" ? "exact" : "equal";
}

function toFeedItems(
  rows: ExpenseRow[],
  nameByUserId: Record<string, string>,
): ExpenseFeedItemData[] {
  return rows.map((e) => {
    const participants = e.expense_participants ?? [];
    const splitMode = parseSplitMode(e.split_mode ?? "equal");
    const participantShares: Record<string, number> = {};
    for (const p of participants) {
      if (p.share_amount != null) {
        participantShares[p.user_id] = p.share_amount;
      }
    }

    const base: ExpenseFeedItemData = {
      id: e.id,
      amount: e.amount,
      expense_date: e.expense_date,
      title: e.title,
      category: e.category,
      payerLabel: nameByUserId[e.payer_id] ?? e.payer_id,
      participantCount: participants.length,
      participantLabels: Object.fromEntries(
        participants.map((participant) => [
          participant.user_id,
          nameByUserId[participant.user_id] ?? participant.user_id,
        ]),
      ),
      settlementBatchId: e.settlement_batch_id,
      payerId: e.payer_id,
      participantIds: participants.map((p) => p.user_id),
      splitMode,
      participantShares:
        splitMode === "exact" ? participantShares : undefined,
      participantsLine: `負担: ${participants
        .map((p) => nameByUserId[p.user_id] ?? p.user_id)
        .join("・")}`,
    };
    if (e.status !== "unpaid") return { ...base, viewable: true };
    return {
      ...base,
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
  const balancesInput: ExpenseForBalance[] = unpaidExpenses.map((e) => {
    const participants = e.expense_participants ?? [];
    const share_amounts: Record<string, number> = {};
    for (const p of participants) {
      if (p.share_amount != null) {
        share_amounts[p.user_id] = p.share_amount;
      }
    }
    return {
      amount: e.amount,
      payer_id: e.payer_id,
      participant_ids: participants.map((p) => p.user_id),
      split_mode: parseSplitMode(e.split_mode ?? "equal"),
      share_amounts:
        parseSplitMode(e.split_mode ?? "equal") === "exact"
          ? share_amounts
          : undefined,
    };
  });
  const transferPreview = computePairwiseSettlementTransfers(balancesInput);
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
