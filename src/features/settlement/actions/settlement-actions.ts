"use server";

import { requireAuthForAction } from "@/features/auth/server/require-auth-for-action";
import * as settlementRepo from "@/features/settlement/repositories/settlement-repository";
import { mapConfirmMonthlySettlementRpcMessage } from "@/features/settlement/balance/model/map-confirm-settlement-message";
import { redirectGroupDetailWithError } from "@/shared/navigation/redirect-group-detail";
import { groupDetailPath, ROUTES } from "@/shared/navigation/routes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmGroupSettlementAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect(ROUTES.groups);
  }

  const { supabase } = await requireAuthForAction();

  const { error } = await settlementRepo.confirmGroupSettlement(supabase, groupId);

  if (error) {
    redirectGroupDetailWithError(
      groupId,
      mapConfirmMonthlySettlementRpcMessage(error.message),
    );
  }

  revalidatePath(groupDetailPath(groupId), "page");
  redirect(
    `${groupDetailPath(groupId)}?settled=1`,
  );
}
