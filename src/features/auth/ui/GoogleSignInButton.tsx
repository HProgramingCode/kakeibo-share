"use client";

import { createClient } from "@/shared/supabase/client";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { useState } from "react";

type Props = {
  nextPath?: string | null;
  label?: string;
};

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
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setPending(true);
    try {
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
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-60"
      >
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
