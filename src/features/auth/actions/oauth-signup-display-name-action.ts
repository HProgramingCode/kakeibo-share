"use server";

import { cookies } from "next/headers";
import {
  OAUTH_SIGNUP_DISPLAY_NAME_COOKIE,
  OAUTH_SIGNUP_DISPLAY_NAME_MAX,
} from "@/features/auth/lib/oauth-display-name-cookie";

export async function setOAuthSignupDisplayNameCookie(
  displayName: string,
): Promise<{ error: string | null }> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { error: "表示名を入力してください" };
  }
  if (trimmed.length > OAUTH_SIGNUP_DISPLAY_NAME_MAX) {
    return {
      error: `表示名は${OAUTH_SIGNUP_DISPLAY_NAME_MAX}文字以内にしてください`,
    };
  }

  const jar = await cookies();
  jar.set(OAUTH_SIGNUP_DISPLAY_NAME_COOKIE, trimmed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return { error: null };
}
