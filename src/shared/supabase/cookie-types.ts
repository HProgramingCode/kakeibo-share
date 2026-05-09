/** Supabase `@supabase/ssr` の `cookies.setAll` 引数形（厳密型はパッケージ非公開のため最小限） */
export type CookieToSet = Readonly<{
  name: string;
  value: string;
  options?: Record<string, unknown>;
}>;
