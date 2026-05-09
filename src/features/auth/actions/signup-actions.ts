"use server";

import { createClient } from "@/shared/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/signup?error=" + encodeURIComponent("メールとパスワードを入力してください"));
  }

  if (password.length < 8) {
    redirect("/signup?error=" + encodeURIComponent("パスワードは8文字以上にしてください"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (!data.session) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "確認メールを送信しました（有効な場合）。リンク後にログインしてください。",
        ),
    );
  }

  redirect("/groups");
}
