import type { AuthFormResult } from "@/features/auth/model/auth-form-result";

export default function getFirstAuthErrorMessage(
  state: AuthFormResult,
): string | null {
  if (state.ok) return null;

  const formErr = state.formErrors?.[0];
  if (formErr) return formErr;
  if (state.message) return state.message;

  const fe = state.fieldErrors;
  if (!fe) return null;

  const keys = ["displayName", "email", "password"] as const;
  for (const k of keys) {
    const msg = fe[k]?.[0];
    if (msg) return msg;
  }
  for (const arr of Object.values(fe)) {
    const msg = arr?.[0];
    if (msg) return msg;
  }
  return null;
}
