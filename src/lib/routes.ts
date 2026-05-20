export const ROUTES = {
  home: "/",
  groups: "/groups",
  groupsNew: "/groups/new",
  groupsJoin: "/groups/join",
  login: "/login",
  signup: "/signup",
} as const;

/** @deprecated ROUTES.groupsJoin を使う */
export const GROUP_JOIN_PATH = ROUTES.groupsJoin;

export function groupDetailPath(groupId: string): string {
  return `${ROUTES.groups}/${groupId}`;
}

export function groupChartsPath(groupId: string): string {
  return `${groupDetailPath(groupId)}/charts`;
}
