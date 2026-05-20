import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertGroup(
  client: SupabaseClient,
  input: { name: string; createdBy: string },
) {
  return client.from("groups").insert({
    name: input.name,
    created_by: input.createdBy,
  });
}

export type InsertGroupInviteRow = {
  group_id: string;
  token_hash: string;
  expires_at: string;
  created_by: string;
};

export async function insertGroupInvite(
  client: SupabaseClient,
  row: InsertGroupInviteRow,
) {
  return client.from("group_invites").insert(row);
}

export async function acceptGroupInvite(
  client: SupabaseClient,
  token: string,
) {
  return client.rpc("accept_group_invite", {
    p_invite_token: token,
  });
}

export async function deleteGroupById(
  client: SupabaseClient,
  groupId: string,
) {
  return client.from("groups").delete().eq("id", groupId);
}
