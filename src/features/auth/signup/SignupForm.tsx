"use client";

import Link from "next/link";
import { signupAction } from "@/features/auth/actions/signup-action";
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
import { Mail, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

const initialState: AuthFormResult = {
  ok: true,
  message: "",
};

export function SignupForm() {
  const searchParams = useSearchParams();
  const next = safeAuthRedirectPath(searchParams.get("next"));
  const loginHref = authPathWithNext(ROUTES.login, next);

  const [state, formAction] = useActionState(signupAction, initialState);
  const errorMessage = getFirstAuthErrorMessage(state);
  const hasAlert = Boolean(errorMessage);

  return (
    <AuthPageShell>
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600/90">
          みんなの精算
        </p>
        <h1 className="text-[1.65rem] font-black leading-tight tracking-tight text-slate-950">
          アカウント作成
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          メール確認が有効な場合は、メール内リンク後にログインしてください。
        </p>
      </header>

      {!state.ok && errorMessage ? (
        <p className="mt-6 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <form
        id="signup-form"
        className={`flex flex-col gap-6 ${hasAlert ? "mt-6" : "mt-8"}`}
        action={formAction}
      >
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">表示名</span>
          <AuthInputWithLeadingIcon
            id="signup-display-name"
            icon={UserRound}
            type="text"
            name="display_name"
            autoComplete="nickname"
            required
            maxLength={40}
            placeholder="グループ内で表示される名前"
          />
        </label>
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
          <span className="font-semibold text-slate-700">
            パスワード（8文字以上）
          </span>
          <PasswordInputWithToggle
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        <AuthSubmitButton label="作成する" pendingLabel="作成中…" />
      </form>

      <AuthOAuthDivider />

      <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
        Google で登録する場合も、上の表示名がグループ内の名前として使われます。
      </p>

      <div className="mt-6">
        <GoogleSignInButton
          nextPath={next}
          label="Google で登録"
          displayNameFormId="signup-form"
          displayNameFieldId="signup-display-name"
        />
      </div>

      <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
        すでにアカウントがある場合は{" "}
        <Link
          href={loginHref}
          className="font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          ログイン
        </Link>
      </p>
    </AuthPageShell>
  );
}
