import * as authRepo from "@/features/auth/repositories/auth-repository";

export type LogoutServiceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signOutSession(): Promise<LogoutServiceResult> {
  const { error } = await authRepo.signOut();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
