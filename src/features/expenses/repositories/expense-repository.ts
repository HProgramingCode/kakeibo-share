import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import type { ExpenseCategory } from "@/features/expenses/form/model/expense-categories";

export type SaveExpenseInput = {
  groupId: string;
  payerId: string;
  amount: number;
  expenseDate: string;
  title: string | null;
  category: ExpenseCategory | null;
  splitMode: ExpenseSplitMode;
  participants: { userId: string; shareAmount: number | null }[];
};

export async function createExpenseWithParticipants(
  client: SupabaseClient,
  input: SaveExpenseInput & { clientRequestId: string },
) {
  return client.rpc("create_expense_with_participants", {
    p_group_id: input.groupId,
    p_payer_id: input.payerId,
    p_amount: input.amount,
    p_expense_date: input.expenseDate,
    p_title: input.title,
    p_category: input.category,
    p_client_request_id: input.clientRequestId,
    p_split_mode: input.splitMode,
    p_participants: input.participants.map((participant) => ({
      user_id: participant.userId,
      share_amount: participant.shareAmount,
    })),
  });
}

export async function updateExpenseWithParticipants(
  client: SupabaseClient,
  expenseId: string,
  input: SaveExpenseInput,
) {
  return client.rpc("update_expense_with_participants", {
    p_expense_id: expenseId,
    p_group_id: input.groupId,
    p_payer_id: input.payerId,
    p_amount: input.amount,
    p_expense_date: input.expenseDate,
    p_title: input.title,
    p_category: input.category,
    p_split_mode: input.splitMode,
    p_participants: input.participants.map((participant) => ({
      user_id: participant.userId,
      share_amount: participant.shareAmount,
    })),
  });
}

export async function deleteExpenseById(
  client: SupabaseClient,
  expenseId: string,
) {
  return client.from("expenses").delete().eq("id", expenseId);
}

export async function selectExpenseForUpdate(
  client: SupabaseClient,
  expenseId: string,
) {
  return client
    .from("expenses")
    .select("id, group_id, status")
    .eq("id", expenseId)
    .maybeSingle();
}
