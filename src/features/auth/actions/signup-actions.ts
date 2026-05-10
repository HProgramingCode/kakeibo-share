"use server";

import { OAUTH_SIGNUP_DISPLAY_NAME_MAX } from "@/features/auth/lib/oauth-display-name-cookie";
import { createClient } from "@/shared/supabase/server";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const displayNameRaw = String(formData.get("display_name") ?? "");
  const displayName = displayNameRaw.trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeAuthRedirectPath(String(formData.get("next") ?? "").trim() || undefined);
  const nextQS = next === "/groups" ? "" : `&next=${encodeURIComponent(next)}`;

  if (!displayName || !email || !password) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("表示名・メール・パスワードをすべて入力してください") +
        nextQS,
    );
  }

  if (displayName.length > OAUTH_SIGNUP_DISPLAY_NAME_MAX) {
    redirect(
      "/signup?error=" +
        encodeURIComponent(
          `表示名は${OAUTH_SIGNUP_DISPLAY_NAME_MAX}文字以内にしてください`,
        ) +
        nextQS,
    );
  }

  if (password.length < 8) {
    redirect(
      "/signup?error=" + encodeURIComponent("パスワードは8文字以上にしてください") + nextQS,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName } },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message) + nextQS);
  }

  if (!data.session) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "確認メールを送信しました（有効な場合）。リンク後にログインしてください。",
        ) +
        nextQS,
    );
  }

  redirect(next);
}
