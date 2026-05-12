import type { SupabaseClient } from "@supabase/supabase-js";

import * as repo from "@/features/groups/lib/repositories/group-detail-repository";

export async function guardGroupMembership(
  client: SupabaseClient,
  groupId: string,
  userId: string,
): Promise<{ ok: true; role: string } | { ok: false }> {
  const { data: membership, error } = await repo.selectMembershipRole(
    client,
    groupId,
    userId,
  );
  if (error || !membership?.role) {
    return { ok: false };
  }
  return { ok: true, role: membership.role };
}
