import * as authRepo from "@/features/auth/repositories/auth-repository";
import { loginSchema } from "@/features/auth/model/login-schema";
import { safeAuthRedirectPath } from "@/shared/navigation/auth-redirect";

export type LoginServiceResult =
  | { kind: "success"; next: string }
  | {
      kind: "validation";
      fieldErrors: Record<string, string[] | undefined>;
    }
  | { kind: "auth"; formErrors: [string] };

export async function loginWithEmailPassword(
  input: { email: string; password: string },
  nextRaw: string,
): Promise<LoginServiceResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      kind: "validation",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const next = safeAuthRedirectPath(nextRaw || undefined);
  const { error } = await authRepo.signInWithPassword(parsed.data);

  if (error) {
    return { kind: "auth", formErrors: [error.message] };
  }

  return { kind: "success", next };
}
