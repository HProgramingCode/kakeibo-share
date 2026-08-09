"use client";

import Link from "next/link";
import { loginAction } from "@/features/auth/actions/login-action";
import { AuthInputWithLeadingIcon } from "@/features/auth/common/AuthInputWithLeadingIcon";
import { AuthSubmitButton } from "@/features/auth/common/AuthSubmitButton";
import {
  AuthOAuthDivider,
  AuthPageShell,
} from "@/features/auth/common/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/login/GoogleSignInButton";
import { PasswordInputWithToggle } from "@/features/auth/login/PasswordInputWithToggle";
import { authPathWithNext } from "@/features/auth/model/build-auth-next-query";
import getFirstAuthErrorMessage from "@/features/auth/model/auth-error-message";
import type { AuthFormResult } from "@/features/auth/model/auth-form-result";
import { safeAuthRedirectPath } from "@/shared/navigation/auth-redirect";
import { ROUTES } from "@/shared/navigation/routes";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

const initialState: AuthFormResult = {
  ok: true,
  message: "",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeAuthRedirectPath(searchParams.get("next"));
  const signupHref = authPathWithNext(ROUTES.signup, next);

  const [state, formAction] = useActionState(loginAction, initialState);
  const actionError = getFirstAuthErrorMessage(state);
  const urlError = searchParams.get("error");
  const displayError =
    actionError ?? (urlError ? decodeURIComponent(urlError) : null);
  const signedUp = searchParams.get("signedup") === "1";
  const signupSuccessMessage = signedUp
    ? "アカウントを作成しました。メール確認が有効な場合は、メール内リンク後にログインしてください。"
    : null;

  return (
    <AuthPageShell>
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600/90">
          みんなの精算
        </p>
        <h1 className="text-[1.65rem] font-black leading-tight tracking-tight text-slate-950">
          ログイン
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          家族向けの立替・精算です。
        </p>
      </header>

      {displayError ? (
        <p className="mt-6 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {displayError}
        </p>
      ) : null}

      {signupSuccessMessage ? (
        <p className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
          {signupSuccessMessage}
        </p>
      ) : null}

      <form
        className={`flex flex-col gap-6 ${displayError || signupSuccessMessage ? "mt-6" : "mt-8"}`}
        action={formAction}
      >
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">メール</span>
          <AuthInputWithLeadingIcon
            icon={Mail}
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">パスワード</span>
          <PasswordInputWithToggle
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>
        <AuthSubmitButton label="ログイン" pendingLabel="ログイン中…" />
      </form>

      <AuthOAuthDivider />

      <div className="mt-6">
        <GoogleSignInButton nextPath={next} />
      </div>

      <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
        はじめての方は{" "}
        <Link
          href={signupHref}
          className="font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          アカウント作成
        </Link>
      </p>
    </AuthPageShell>
  );
}
