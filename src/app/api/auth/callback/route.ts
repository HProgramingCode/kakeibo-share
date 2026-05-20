import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  OAUTH_SIGNUP_DISPLAY_NAME_COOKIE,
  OAUTH_SIGNUP_DISPLAY_NAME_MAX,
} from "@/features/auth/lib/oauth-display-name-cookie";
import { appendNextQuery } from "@/features/auth/lib/build-auth-next-query";
import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import * as profileRepo from "@/features/auth/lib/repositories/profile-repository";
import { safeAuthRedirectPath } from "@/lib/auth-redirect";
import { ROUTES } from "@/lib/routes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(ROUTES.login, url.origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: ReadonlyArray<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(
              name,
              value,
              options as Parameters<typeof cookieStore.set>[2],
            ),
          );
        },
      },
    },
  );

  const { data: sessionData, error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginErrorPath = appendNextQuery(
      `${ROUTES.login}?error=${encodeURIComponent(error.message)}`,
      next,
    );
    return NextResponse.redirect(new URL(loginErrorPath, url.origin));
  }

  const userId = sessionData.session?.user?.id;
  const pendingName = cookieStore
    .get(OAUTH_SIGNUP_DISPLAY_NAME_COOKIE)
    ?.value?.trim();
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.delete(OAUTH_SIGNUP_DISPLAY_NAME_COOKIE);

  if (
    userId &&
    pendingName &&
    pendingName.length <= OAUTH_SIGNUP_DISPLAY_NAME_MAX
  ) {
    const { error: profileErr } = await profileRepo.updateProfileDisplayName(
      supabase,
      userId,
      pendingName,
    );
    if (!profileErr) {
      await authRepo.updateUserMetadata(supabase, { full_name: pendingName });
    }
  }

  return res;
}
