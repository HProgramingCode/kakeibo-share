import * as authRepo from "@/features/auth/repositories/auth-repository";
import { ROUTES } from "@/shared/navigation/routes";
import { createClient } from "@/server/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type RequireAuthForActionReturnError = {
  mode: "returnError";
  message?: string;
};

export type AuthActionContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

export type AuthActionError = { ok: false; error: string };

export type AuthActionResult = ({ ok: true } & AuthActionContext) | AuthActionError;

export async function requireAuthForAction(
  options: RequireAuthForActionReturnError,
): Promise<AuthActionResult>;
export async function requireAuthForAction(): Promise<AuthActionContext>;
export async function requireAuthForAction(
  options?: RequireAuthForActionReturnError,
): Promise<AuthActionContext | AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  if (!user) {
    if (options?.mode === "returnError") {
      return {
        ok: false,
        error: options.message ?? "ログインが必要です",
      };
    }
    redirect(ROUTES.login);
  }

  if (options?.mode === "returnError") {
    return { ok: true, supabase, user };
  }

  return { supabase, user };
}

export function isAuthActionError(
  result: AuthActionResult,
): result is AuthActionError {
  return !result.ok;
}
