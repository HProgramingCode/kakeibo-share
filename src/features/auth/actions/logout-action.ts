"use server";

import { signOutSession } from "@/features/auth/server/logout-service";
import type { AuthFormResult } from "@/features/auth/model/auth-form-result";
import { ROUTES } from "@/shared/navigation/routes";
import { redirect } from "next/navigation";

export async function logoutAction(
  _prevState: AuthFormResult,
  _formData?: FormData,
): Promise<AuthFormResult> {
  void _prevState;
  void _formData;

  const result = await signOutSession();

  if (!result.ok) {
    return { ok: false, formErrors: [result.error] };
  }

  redirect(ROUTES.login);
}
