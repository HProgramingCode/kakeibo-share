"use server";

import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseCategory,
} from "@/shared/lib/expense-categories";
import { redirectGroupDetailWithError } from "@/shared/lib/redirect-group-detail";
import { createClient } from "@/shared/supabase/server";
import { selectGroupMemberUserIds } from "@/features/groups/lib/repositories/group-detail-repository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExpenseAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect("/groups");
  }

  const clientRequestId = String(formData.get("client_request_id") ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientRequestId)) {
    redirectGroupDetailWithError(groupId, "支出登録の送信情報が不正です。もう一度お試しください。");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = Number.parseInt(amountRaw, 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    redirectGroupDetailWithError(groupId, "金額は1円以上の整数で入力してください。");
  }

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  if (!expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    redirectGroupDetailWithError(groupId, "支出日を正しく選択してください。");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category =
    categoryRaw && EXPENSE_CATEGORY_OPTIONS.includes(categoryRaw as ExpenseCategory)
      ? categoryRaw
      : null;

  const payerId = String(formData.get("payer_id") ?? "").trim();
  if (!payerId) {
    redirectGroupDetailWithError(groupId, "支払者を選択してください。");
  }

  const checkboxParticipantIds = formData
    .getAll("participant")
    .map((v) => String(v).trim())
    .filter(Boolean);

  /** 支払者はチェックボックスに無くても恒久的に負担対象に含める */
  const participantIds = [...new Set([payerId, ...checkboxParticipantIds])];

  const { data: membersRaw, error: memErr } = await selectGroupMemberUserIds(
    supabase,
    groupId,
  );

  const members = membersRaw ?? [];

  if (memErr || members.length === 0) {
    redirectGroupDetailWithError(groupId, "メンバー一覧の取得に失敗しました。");
  }

  const memberSet = new Set(members.map((m) => m.user_id));
  if (!memberSet.has(payerId)) {
    redirectGroupDetailWithError(groupId, "支払者がこのグループのメンバーではありません。");
  }

  for (const pid of participantIds) {
    if (!memberSet.has(pid)) {
      redirectGroupDetailWithError(groupId, "負担メンバーにグループ外のユーザーが含まれています。");
    }
  }

  const { data: inserted, error: insErr } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      payer_id: payerId,
      amount,
      expense_date: expenseDate,
      title,
      category,
      client_request_id: clientRequestId,
      status: "unpaid",
    })
    .select("id")
    .single();

  const newExpenseId = inserted?.id;
  if (insErr || newExpenseId == null) {
    if (insErr?.code === "23505") {
      revalidatePath(`/groups/${groupId}`, "page");
      return;
    }
    redirectGroupDetailWithError(groupId, insErr?.message ?? "支出の保存に失敗しました。");
  }

  const parts = participantIds.map((user_id) => ({
    expense_id: newExpenseId,
    user_id,
  }));

  const { error: partErr } = await supabase.from("expense_participants").insert(parts);

  if (partErr) {
    await supabase.from("expenses").delete().eq("id", newExpenseId);
    redirectGroupDetailWithError(groupId, partErr.message ?? "負担メンバーの保存に失敗しました。");
  }

  revalidatePath(`/groups/${groupId}`, "page");
}

export async function updateExpenseAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const expenseId = String(formData.get("expense_id") ?? "").trim();
  if (!groupId || !expenseId) {
    redirect("/groups");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing, error: exErr } = await supabase
    .from("expenses")
    .select("id, group_id, status")
    .eq("id", expenseId)
    .maybeSingle();

  if (exErr || !existing || existing.group_id !== groupId) {
    redirectGroupDetailWithError(groupId, "支出が見つかりません。");
  }
  if (existing.status !== "unpaid") {
    redirectGroupDetailWithError(groupId, "精算済みの支出は編集できません。");
  }

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = Number.parseInt(amountRaw, 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    redirectGroupDetailWithError(groupId, "金額は1円以上の整数で入力してください。");
  }

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  if (!expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    redirectGroupDetailWithError(groupId, "支出日を正しく選択してください。");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category =
    categoryRaw && EXPENSE_CATEGORY_OPTIONS.includes(categoryRaw as ExpenseCategory)
      ? categoryRaw
      : null;

  const payerId = String(formData.get("payer_id") ?? "").trim();
  if (!payerId) {
    redirectGroupDetailWithError(groupId, "支払者を選択してください。");
  }

  const checkboxParticipantIds = formData
    .getAll("participant")
    .map((v) => String(v).trim())
    .filter(Boolean);

  /** 支払者はチェックボックスに無くても恒久的に負担対象に含める */
  const participantIds = [...new Set([payerId, ...checkboxParticipantIds])];

  const { data: membersRaw, error: memErr } = await selectGroupMemberUserIds(
    supabase,
    groupId,
  );

  const members = membersRaw ?? [];

  if (memErr || members.length === 0) {
    redirectGroupDetailWithError(groupId, "メンバー一覧の取得に失敗しました。");
  }

  const memberSet = new Set(members.map((m) => m.user_id));
  if (!memberSet.has(payerId)) {
    redirectGroupDetailWithError(groupId, "支払者がこのグループのメンバーではありません。");
  }

  for (const pid of participantIds) {
    if (!memberSet.has(pid)) {
      redirectGroupDetailWithError(groupId, "負担メンバーにグループ外のユーザーが含まれています。");
    }
  }

  const { error: updErr } = await supabase
    .from("expenses")
    .update({
      payer_id: payerId,
      amount,
      expense_date: expenseDate,
      title,
      category,
    })
    .eq("id", expenseId);

  if (updErr) {
    redirectGroupDetailWithError(groupId, updErr.message ?? "支出の更新に失敗しました。");
  }

  const { error: delErr } = await supabase
    .from("expense_participants")
    .delete()
    .eq("expense_id", expenseId);

  if (delErr) {
    redirectGroupDetailWithError(groupId, delErr.message ?? "負担メンバーの更新に失敗しました。");
  }

  const parts = participantIds.map((user_id) => ({
    expense_id: expenseId,
    user_id,
  }));

  const { error: partErr } = await supabase.from("expense_participants").insert(parts);

  if (partErr) {
    redirectGroupDetailWithError(groupId, partErr.message ?? "負担メンバーの保存に失敗しました。");
  }

  revalidatePath(`/groups/${groupId}`, "page");
}
