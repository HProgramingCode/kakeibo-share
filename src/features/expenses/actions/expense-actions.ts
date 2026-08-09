"use server";

import { requireAuthForAction } from "@/features/auth/server/require-auth-for-action";
import {
  parseParticipantIds,
  parseSplitModeFromForm,
  validateExpenseParticipantSharesFromForm,
} from "@/features/expenses/form/model/parse-expense-shares-form";
import * as expenseRepo from "@/features/expenses/repositories/expense-repository";
import { selectGroupMemberUserIds } from "@/features/groups/repositories/group-detail-repository";
import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseCategory,
} from "@/features/expenses/form/model/expense-categories";
import { redirectGroupDetailWithError } from "@/shared/navigation/redirect-group-detail";
import { groupDetailPath, ROUTES } from "@/shared/navigation/routes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExpenseAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect(ROUTES.groups);
  }

  const clientRequestId = String(
    formData.get("client_request_id") ?? "",
  ).trim();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      clientRequestId,
    )
  ) {
    redirectGroupDetailWithError(
      groupId,
      "支出登録の送信情報が不正です。もう一度お試しください。",
    );
  }

  const { supabase } = await requireAuthForAction();

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = Number.parseInt(amountRaw, 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    redirectGroupDetailWithError(
      groupId,
      "金額は1円以上の整数で入力してください。",
    );
  }

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  if (!expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    redirectGroupDetailWithError(groupId, "支出日を正しく選択してください。");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category =
    categoryRaw &&
    EXPENSE_CATEGORY_OPTIONS.includes(categoryRaw as ExpenseCategory)
      ? (categoryRaw as ExpenseCategory)
      : null;

  const payerId = String(formData.get("payer_id") ?? "").trim();
  if (!payerId) {
    redirectGroupDetailWithError(groupId, "立替者を選択してください。");
  }

  const splitMode = parseSplitModeFromForm(formData);
  if (!splitMode) {
    redirectGroupDetailWithError(groupId, "分割方式が不正です。");
  }

  const participantIds = parseParticipantIds(formData);

  if (participantIds.length === 0) {
    redirectGroupDetailWithError(
      groupId,
      "負担に含めるメンバーを1人以上選んでください。",
    );
  }

  const shareValidation = validateExpenseParticipantSharesFromForm(
    amount,
    splitMode,
    participantIds,
    formData,
  );
  if (!shareValidation.ok) {
    redirectGroupDetailWithError(groupId, shareValidation.message);
  }

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
    redirectGroupDetailWithError(
      groupId,
      "立替者がこのグループのメンバーではありません。",
    );
  }

  for (const pid of participantIds) {
    if (!memberSet.has(pid)) {
      redirectGroupDetailWithError(
        groupId,
        "負担メンバーにグループ外のユーザーが含まれています。",
      );
    }
  }

  const participants = participantIds.map((userId) => ({
    userId,
    shareAmount:
      splitMode === "exact" ? (shareValidation.shares.get(userId) ?? null) : null,
  }));

  const { error: insErr } = await expenseRepo.createExpenseWithParticipants(
    supabase,
    {
      groupId,
      payerId,
      amount,
      expenseDate,
      title,
      category,
      clientRequestId,
      splitMode,
      participants,
    },
  );

  if (insErr) {
    if (insErr?.code === "23505") {
      revalidatePath(groupDetailPath(groupId), "page");
      return;
    }
    redirectGroupDetailWithError(
      groupId,
      insErr?.message ?? "支出の保存に失敗しました。",
    );
  }

  revalidatePath(groupDetailPath(groupId), "page");
  redirect(`${groupDetailPath(groupId)}?created=1`);
}

export async function updateExpenseAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const expenseId = String(formData.get("expense_id") ?? "").trim();
  if (!groupId || !expenseId) {
    redirect(ROUTES.groups);
  }

  const { supabase } = await requireAuthForAction();

  const { data: existing, error: exErr } =
    await expenseRepo.selectExpenseForUpdate(supabase, expenseId);

  if (exErr || !existing || existing.group_id !== groupId) {
    redirectGroupDetailWithError(groupId, "支出が見つかりません。");
  }
  if (existing.status !== "unpaid") {
    redirectGroupDetailWithError(groupId, "精算済みの支出は編集できません。");
  }

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = Number.parseInt(amountRaw, 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    redirectGroupDetailWithError(
      groupId,
      "金額は1円以上の整数で入力してください。",
    );
  }

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  if (!expenseDate || !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
    redirectGroupDetailWithError(groupId, "支出日を正しく選択してください。");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category =
    categoryRaw &&
    EXPENSE_CATEGORY_OPTIONS.includes(categoryRaw as ExpenseCategory)
      ? (categoryRaw as ExpenseCategory)
      : null;

  const payerId = String(formData.get("payer_id") ?? "").trim();
  if (!payerId) {
    redirectGroupDetailWithError(groupId, "立替者を選択してください。");
  }

  const splitMode = parseSplitModeFromForm(formData);
  if (!splitMode) {
    redirectGroupDetailWithError(groupId, "分割方式が不正です。");
  }

  const participantIds = parseParticipantIds(formData);

  if (participantIds.length === 0) {
    redirectGroupDetailWithError(
      groupId,
      "負担に含めるメンバーを1人以上選んでください。",
    );
  }

  const shareValidation = validateExpenseParticipantSharesFromForm(
    amount,
    splitMode,
    participantIds,
    formData,
  );
  if (!shareValidation.ok) {
    redirectGroupDetailWithError(groupId, shareValidation.message);
  }

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
    redirectGroupDetailWithError(
      groupId,
      "立替者がこのグループのメンバーではありません。",
    );
  }

  for (const pid of participantIds) {
    if (!memberSet.has(pid)) {
      redirectGroupDetailWithError(
        groupId,
        "負担メンバーにグループ外のユーザーが含まれています。",
      );
    }
  }

  const participants = participantIds.map((userId) => ({
    userId,
    shareAmount:
      splitMode === "exact" ? (shareValidation.shares.get(userId) ?? null) : null,
  }));

  const { error: updErr } = await expenseRepo.updateExpenseWithParticipants(
    supabase,
    expenseId,
    {
      groupId,
      payerId,
      amount,
      expenseDate,
      title,
      category,
      splitMode,
      participants,
    },
  );

  if (updErr) {
    redirectGroupDetailWithError(
      groupId,
      updErr.message ?? "支出の更新に失敗しました。",
    );
  }

  revalidatePath(groupDetailPath(groupId), "page");
}

export async function deleteExpenseAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const expenseId = String(formData.get("expense_id") ?? "").trim();
  if (!groupId || !expenseId) {
    redirect(ROUTES.groups);
  }

  const { supabase } = await requireAuthForAction();

  const { data: existing, error: exErr } =
    await expenseRepo.selectExpenseForUpdate(supabase, expenseId);

  if (exErr || !existing || existing.group_id !== groupId) {
    redirectGroupDetailWithError(groupId, "支出が見つかりません。");
  }
  if (existing.status !== "unpaid") {
    redirectGroupDetailWithError(groupId, "精算済みの支出は削除できません。");
  }

  const { error: delErr } = await expenseRepo.deleteExpenseById(
    supabase,
    expenseId,
  );

  if (delErr) {
    redirectGroupDetailWithError(
      groupId,
      delErr.message ?? "支出の削除に失敗しました。",
    );
  }

  revalidatePath(groupDetailPath(groupId), "page");
  redirect(groupDetailPath(groupId));
}
