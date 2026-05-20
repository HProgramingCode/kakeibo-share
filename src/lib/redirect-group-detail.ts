import { groupDetailPath } from "@/lib/routes";
import { redirect } from "next/navigation";

export function redirectGroupDetailWithError(
  groupId: string,
  message: string,
): never {
  redirect(`${groupDetailPath(groupId)}?error=${encodeURIComponent(message)}`);
}
