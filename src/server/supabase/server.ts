import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { CookieToSet } from "@/server/supabase/cookie-types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2],
              ),
            );
          } catch {
            // Server Component の読み取り専用コンテキストでは無視（公式パターン）
          }
        },
      },
    },
  );
}
