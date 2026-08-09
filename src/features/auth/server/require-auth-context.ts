import * as authRepo from "@/features/auth/repositories/auth-repository";
import { ROUTES } from "@/shared/navigation/routes";
import { createClient } from "@/server/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

export type OptionalAuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
};

/** 同一 RSC リクエスト内で getUser を 1 回にまとめる */
const loadAuthContext = cache(async (): Promise<OptionalAuthContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  return { supabase, user: user ?? null };
});

/** RSC 用: Auth サーバーで user を検証（screen + Suspense 子で cache 共有） */
export async function requireAuthContext(): Promise<AuthContext> {
  const { supabase, user } = await loadAuthContext();

  if (!user) {
    redirect(ROUTES.login);
  }

  return { supabase, user };
}

/** 招待参加など未ログイン UI を出す RSC 用 */
export async function getOptionalAuthContext(): Promise<OptionalAuthContext> {
  return loadAuthContext();
}
