import { redirect } from "next/navigation";

export function redirectGroupDetailWithError(groupId: string, message: string): never {
  redirect(`/groups/${groupId}?error=${encodeURIComponent(message)}`);
}
