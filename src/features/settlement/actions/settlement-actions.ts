"use server";

import { requireAuthForAction } from "@/features/auth/lib/require-auth-for-action";
import * as settlementRepo from "@/features/settlement/lib/repositories/settlement-repository";
import { mapConfirmMonthlySettlementRpcMessage } from "@/lib/map-confirm-monthly-settlement-message";
import { redirectGroupDetailWithError } from "@/lib/redirect-group-detail";
import { groupDetailPath, ROUTES } from "@/lib/routes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmMonthlySettlementAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect(ROUTES.groups);
  }

  const { supabase } = await requireAuthForAction();

  const targetMonth = String(formData.get("target_month") ?? "").trim();
  if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
    redirectGroupDetailWithError(
      groupId,
      "精算する月を選択してください（YYYY-MM）。",
    );
  }

  const { error } = await settlementRepo.confirmMonthlySettlement(supabase, {
    groupId,
    targetMonth,
  });

  if (error) {
    redirectGroupDetailWithError(
      groupId,
      mapConfirmMonthlySettlementRpcMessage(error.message),
    );
  }

  revalidatePath(groupDetailPath(groupId), "page");
  redirect(
    `${groupDetailPath(groupId)}?settled=${encodeURIComponent(targetMonth)}`,
  );
}
