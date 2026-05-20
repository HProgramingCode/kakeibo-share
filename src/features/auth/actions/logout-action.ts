"use server";

import { signOutSession } from "@/features/auth/lib/services/logout-service";
import type { AuthFormResult } from "@/features/auth/types/auth-form-result";
import { ROUTES } from "@/lib/routes";
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
