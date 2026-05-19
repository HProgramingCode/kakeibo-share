"use server";

import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import * as settlementRepo from "@/features/settlement/lib/repositories/settlement-repository";
import { mapConfirmMonthlySettlementRpcMessage } from "@/lib/map-confirm-monthly-settlement-message";
import { redirectGroupDetailWithError } from "@/lib/redirect-group-detail";
import { groupDetailPath, ROUTES } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmMonthlySettlementAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect(ROUTES.groups);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  if (!user) {
    redirect(ROUTES.login);
  }

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

  revalidatePath(groupDetailPath(groupId));
  redirect(
    `${groupDetailPath(groupId)}?settled=${encodeURIComponent(targetMonth)}`,
  );
}
