import { createClient } from "@/server/supabase/server";

import type { LoginFormInput } from "@/features/auth/model/login";
import type { SignupFormInput } from "@/features/auth/model/signup-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getSessionUser(client: SupabaseClient) {
  return client.auth.getUser();
}

export function updateUserMetadata(
  client: SupabaseClient,
  data: { full_name: string },
) {
  return client.auth.updateUser({ data });
}

export async function signUpWithEmail({
  displayName,
  email,
  password,
}: SignupFormInput) {
  const supabase = await createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });
}

export async function signInWithPassword({ email, password }: LoginFormInput) {
  const supabase = await createClient();

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await createClient();

  return supabase.auth.signOut();
}
