export type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; settled?: string }>;
};

export type MemberRow = {
  user_id: string;
  role: string;
  profiles: { id: string; display_name: string | null } | null;
};

export type ExpenseRow = {
  id: string;
  amount: number;
  expense_date: string;
  title: string | null;
  category: string | null;
  payer_id: string;
  status: string;
  expense_participants: { user_id: string }[] | null;
};

export type BatchRow = {
  id: string;
  target_month: string;
  created_at: string;
  settlement_transfers:
    | { from_user_id: string; to_user_id: string; amount: number }[]
    | null;
};

export type GroupDetailCoreLoadResult =
  | { kind: "not_found" }
  | { kind: "members_error"; message?: string }
  | {
      kind: "ok";
      membershipRole: string;
      members: MemberRow[];
      groupLabel: string;
      initialDisplayName: string;
    };

export type GroupDetailDashboardLoadResult =
  | Exclude<GroupDetailCoreLoadResult, { kind: "ok" }>
  | { kind: "expenses_error"; message: string }
  | {
      kind: "ok";
      membershipRole: string;
      members: MemberRow[];
      groupLabel: string;
      initialDisplayName: string;
      unpaidExpenses: ExpenseRow[];
    };

export type GroupDetailHistoryLoadResult =
  | { kind: "not_found" }
  | { kind: "expenses_error"; message: string }
  | { kind: "batches_error"; message: string }
  | {
      kind: "ok";
      expenses: ExpenseRow[];
      batches: BatchRow[];
    };

/** @deprecated loadGroupDetailDashboardData / loadGroupDetailHistoryData を使用 */
export type GroupDetailPageLoadResult =
  | { kind: "not_found" }
  | { kind: "members_error"; message?: string }
  | { kind: "expenses_error"; message: string }
  | { kind: "batches_error"; message: string }
  | {
      kind: "ok";
      membershipRole: string;
      members: MemberRow[];
      groupLabel: string;
      initialDisplayName: string;
      expenses: ExpenseRow[];
      batches: BatchRow[];
    };
