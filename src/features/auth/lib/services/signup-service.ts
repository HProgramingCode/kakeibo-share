import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import { signupSchema } from "@/features/auth/validations/signup-schema";

export type SignupServiceResult =
  | { kind: "success" }
  | {
      kind: "validation";
      fieldErrors: Record<string, string[] | undefined>;
    }
  | { kind: "auth"; formErrors: [string] };

export async function signUpWithEmailPassword(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<SignupServiceResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      kind: "validation",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await authRepo.signUpWithEmail(parsed.data);

  if (error) {
    return { kind: "auth", formErrors: [error.message] };
  }

  return { kind: "success" };
}
