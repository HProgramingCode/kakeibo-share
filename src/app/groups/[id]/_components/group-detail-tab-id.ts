export type GroupDetailTabId = "dashboard" | "register" | "history";

export function tabFromHash(hash: string): GroupDetailTabId {
  if (hash === "monthly-settle") return "dashboard";
  if (hash === "expense-form") return "register";
  if (hash === "settled-expenses") return "history";
  if (hash === "history-unpaid-expenses") return "history";
  if (hash === "recent-expenses") return "dashboard";
  return "dashboard";
}
