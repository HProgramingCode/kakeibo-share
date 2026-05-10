"use server";

import { createClient } from "@/shared/supabase/server";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "").trim();
  const next = safeAuthRedirectPath(nextRaw || undefined);
  const nextQS = next === "/groups" ? "" : `&next=${encodeURIComponent(next)}`;

  if (!email || !password) {
    redirect(
      "/login?error=" +
        encodeURIComponent("メールとパスワードを入力してください") +
        nextQS,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message) + nextQS);
  }

  redirect(next);
}
