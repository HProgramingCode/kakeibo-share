"use server";

import { authPathWithNext } from "@/features/auth/model/build-auth-next-query";
import { signUpWithEmailPassword } from "@/features/auth/server/signup-service";
import type { AuthFormResult } from "@/features/auth/model/auth-form-result";
import { safeAuthRedirectPath } from "@/shared/navigation/auth-redirect";
import { ROUTES } from "@/shared/navigation/routes";
import { redirect } from "next/navigation";

export async function signupAction(
  _prevState: AuthFormResult,
  formData: FormData,
): Promise<AuthFormResult> {
  const input = {
    displayName: String(formData.get("display_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  const result = await signUpWithEmailPassword(input);

  if (result.kind === "validation") {
    return { ok: false, fieldErrors: result.fieldErrors };
  }

  if (result.kind === "auth") {
    return { ok: false, formErrors: result.formErrors };
  }

  const nextRaw = String(formData.get("next") ?? "").trim();
  const next = safeAuthRedirectPath(nextRaw || undefined);

  const loginPath = authPathWithNext(ROUTES.login, next);
  const separator = loginPath.includes("?") ? "&" : "?";
  redirect(`${loginPath}${separator}signedup=1`);
}
