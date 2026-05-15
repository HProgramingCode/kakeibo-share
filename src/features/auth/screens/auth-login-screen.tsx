import Link from "next/link";
import { loginAction } from "@/features/auth/actions/login-actions";
import { AuthInputWithLeadingIcon } from "@/features/auth/ui/AuthInputWithLeadingIcon";
import { AuthSubmitButton } from "@/features/auth/ui/AuthSubmitButton";
import {
  AuthOAuthDivider,
  AuthPageShell,
} from "@/features/auth/ui/AuthPageShell";
import { GoogleSignInButton } from "@/features/auth/ui/GoogleSignInButton";
import { PasswordInputWithToggle } from "@/features/auth/ui/PasswordInputWithToggle";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { Mail } from "lucide-react";

type Props = {
  searchParams?: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const next = safeAuthRedirectPath(params?.next);

  const signupHref =
    next === "/groups" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;

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

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form
        className={`flex flex-col gap-6 ${error ? "mt-6" : "mt-8"}`}
        action={loginAction}
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
