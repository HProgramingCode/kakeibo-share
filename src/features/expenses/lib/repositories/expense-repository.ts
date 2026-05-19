import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExpenseCategory } from "@/lib/expense-categories";

export type InsertExpenseRow = {
  group_id: string;
  payer_id: string;
  amount: number;
  expense_date: string;
  title: string | null;
  category: ExpenseCategory | null;
  client_request_id: string;
  status: "unpaid";
};

export async function insertExpense(
  client: SupabaseClient,
  row: InsertExpenseRow,
) {
  return client.from("expenses").insert(row).select("id").single();
}

export type ExpenseParticipantRow = {
  expense_id: string;
  user_id: string;
};

export async function insertExpenseParticipants(
  client: SupabaseClient,
  rows: ExpenseParticipantRow[],
) {
  return client.from("expense_participants").insert(rows);
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

export type UpdateExpenseRow = {
  payer_id: string;
  amount: number;
  expense_date: string;
  title: string | null;
  category: ExpenseCategory | null;
};

export async function updateExpense(
  client: SupabaseClient,
  expenseId: string,
  row: UpdateExpenseRow,
) {
  return client.from("expenses").update(row).eq("id", expenseId);
}

export async function deleteExpenseParticipants(
  client: SupabaseClient,
  expenseId: string,
) {
  return client
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);
}
