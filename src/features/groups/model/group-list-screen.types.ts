export type GroupListRow = {
  group_id: string;
  role: string;
  groups: { id: string; name: string; created_at: string } | null;
};

export type GroupListPageLoadResult =
  | { kind: "error"; message: string }
  | { kind: "ok"; rows: GroupListRow[] };
