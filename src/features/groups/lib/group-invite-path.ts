import { ROUTES } from "@/lib/routes";

export function groupJoinPathWithToken(token: string): string {
  return `${ROUTES.groupsJoin}?token=${encodeURIComponent(token)}`;
}

export function groupJoinPathWithTokenAndError(
  token: string,
  error: string,
): string {
  return `${ROUTES.groupsJoin}?token=${encodeURIComponent(token)}&error=${encodeURIComponent(error)}`;
}

export function groupJoinPathWithError(error: string): string {
  return `${ROUTES.groupsJoin}?error=${encodeURIComponent(error)}`;
}
