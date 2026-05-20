export type GroupSpendChartsPageProps = {
  params: Promise<{ id: string }>;
};

export type GroupSpendChartsMemberRow = {
  user_id: string;
  profiles: { id: string; display_name: string | null } | null;
};

export type GroupSpendChartsExpenseRow = {
  amount: number;
  expense_date: string;
  payer_id: string;
  expense_participants: { user_id: string }[] | null;
};

export type GroupSpendChartsPageLoadResult =
  | { kind: "not_found" }
  | { kind: "members_error"; message?: string }
  | { kind: "expenses_error"; message: string }
  | {
      kind: "ok";
      groupLabel: string;
      members: GroupSpendChartsMemberRow[];
      expenses: GroupSpendChartsExpenseRow[];
    };
