import type { SupabaseClient } from "@supabase/supabase-js";

import * as repo from "@/features/groups/lib/repositories/group-list-repository";
import type {
  GroupListPageLoadResult,
  GroupListRow,
} from "@/features/groups/lib/types/group-list-screen.types";

export async function loadGroupListPageData(
  client: SupabaseClient,
  userId: string,
): Promise<GroupListPageLoadResult> {
  const { data, error } = await repo.selectGroupMembershipsWithGroups(
    client,
    userId,
  );

  if (error) {
    return { kind: "error", message: error.message };
  }

  return {
    kind: "ok",
    rows: (data ?? []) as unknown as GroupListRow[],
  };
}
