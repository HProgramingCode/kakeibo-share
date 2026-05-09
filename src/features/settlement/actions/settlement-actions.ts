"use server";

import { mapConfirmMonthlySettlementRpcMessage } from "@/shared/lib/map-confirm-monthly-settlement-message";
import { redirectGroupDetailWithError } from "@/shared/lib/redirect-group-detail";
import { createClient } from "@/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmMonthlySettlementAction(formData: FormData) {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    redirect("/groups");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const targetMonth = String(formData.get("target_month") ?? "").trim();
  if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
    redirectGroupDetailWithError(groupId, "精算する月を選択してください（YYYY-MM）。");
  }

  const { error } = await supabase.rpc("confirm_monthly_settlement", {
    p_group_id: groupId,
    p_target_month: targetMonth,
  });

  if (error) {
    redirectGroupDetailWithError(groupId, mapConfirmMonthlySettlementRpcMessage(error.message));
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}?settled=${encodeURIComponent(targetMonth)}`);
}
