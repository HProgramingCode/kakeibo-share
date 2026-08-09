"use server";

import { loginWithEmailPassword } from "@/features/auth/server/login-service";
import type { AuthFormResult } from "@/features/auth/model/auth-form-result";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: AuthFormResult,
  formData: FormData,
): Promise<AuthFormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "").trim();

  const result = await loginWithEmailPassword({ email, password }, nextRaw);

  if (result.kind === "validation") {
    return { ok: false, fieldErrors: result.fieldErrors };
  }

  if (result.kind === "auth") {
    return { ok: false, formErrors: result.formErrors };
  }

  redirect(result.next);
}
