"use client";

import { setOAuthSignupDisplayNameCookie } from "@/features/auth/actions/oauth-signup-display-name-action";
import { GoogleMark } from "@/features/auth/ui/GoogleMark";
import { createClient } from "@/shared/supabase/client";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  nextPath?: string | null;
  label?: string;
  /** 指定時、そのフォームの display_name を OAuth 前に Cookie へ保存（サインアップの Google 用） */
  displayNameFormId?: string;
  /** displayNameFormId 利用時、検証エラーでフォーカスする input の id */
  displayNameFieldId?: string;
};

function focusDisplayNameField(fieldId: string | undefined) {
  if (!fieldId) return;
  const el = document.getElementById(fieldId);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    el.focus();
  }
}

function formatOAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) {
    return "この Supabase プロジェクトで Google ログインが無効です。Dashboard → Authentication → Providers → Google を有効化し、Client ID / Secret を保存してください。.env の URL と同じプロジェクトで設定しているか確認してください。";
  }
  return message;
}

export function GoogleSignInButton({
  nextPath,
  label = "Google で続ける",
  displayNameFormId,
  displayNameFieldId,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
      if (displayNameFormId) {
        const form = document.getElementById(displayNameFormId);
        if (!(form instanceof HTMLFormElement)) {
          setError("フォームが見つかりません");
          setPending(false);
          return;
        }
        const displayName = String(new FormData(form).get("display_name") ?? "");
        const { error: cookieErr } = await setOAuthSignupDisplayNameCookie(displayName);
        if (cookieErr) {
          setError(cookieErr);
          focusDisplayNameField(displayNameFieldId);
          setPending(false);
          return;
        }
      }

      const supabase = createClient();
      const next = safeAuthRedirectPath(nextPath);
      const origin = window.location.origin;
      const nextQuery = encodeURIComponent(next);
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${nextQuery}`,
        },
      });
      if (oauthErr) {
        setError(formatOAuthError(oauthErr.message));
        setPending(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google ログインに失敗しました");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-busy={pending}
        className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-3xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-card transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/90 hover:shadow-card-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <Loader2
            className="h-[18px] w-[18px] shrink-0 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          <GoogleMark className="h-[18px] w-[18px] shrink-0" />
        )}
        {pending ? "接続中…" : label}
      </button>
      {error ? (
        <p className="text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
