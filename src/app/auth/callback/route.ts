import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  OAUTH_SIGNUP_DISPLAY_NAME_COOKIE,
  OAUTH_SIGNUP_DISPLAY_NAME_MAX,
} from "@/features/auth/lib/oauth-display-name-cookie";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
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
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
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
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ display_name: pendingName })
      .eq("id", userId);
    if (!profileErr) {
      await supabase.auth.updateUser({ data: { full_name: pendingName } });
    }
  }

  return res;
}
