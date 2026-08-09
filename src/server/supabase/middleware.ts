import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { authPathWithNext } from "@/features/auth/model/build-auth-next-query";
import { safeAuthRedirectPath } from "@/shared/navigation/auth-redirect";
import { ROUTES } from "@/shared/navigation/routes";
import type { CookieToSet } from "@/server/supabase/cookie-types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const nextParam = request.nextUrl.searchParams.get("next");
  const nextDest = safeAuthRedirectPath(nextParam);

  if (!user && path.startsWith(ROUTES.groups)) {
    const returnPath = `${path}${request.nextUrl.search}`;
    const safeNext = safeAuthRedirectPath(returnPath);
    const loginPath = authPathWithNext(ROUTES.login, safeNext);
    return NextResponse.redirect(new URL(loginPath, request.nextUrl.origin));
  }

  if (user && path === ROUTES.login) {
    const url = request.nextUrl.clone();
    const dest = new URL(nextDest, request.nextUrl.origin);
    url.pathname = dest.pathname;
    url.search = dest.search;
    return NextResponse.redirect(url);
  }

  if (user && path === ROUTES.signup) {
    const url = request.nextUrl.clone();
    const dest = new URL(nextDest, request.nextUrl.origin);
    url.pathname = dest.pathname;
    url.search = dest.search;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
