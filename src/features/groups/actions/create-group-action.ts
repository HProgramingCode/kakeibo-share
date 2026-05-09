"use server";

import { createClient } from "@/shared/supabase/server";
import { redirect } from "next/navigation";

export async function createGroupAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/groups/new?error=" + encodeURIComponent("グループ名を入力してください"));
  }

  const { error } = await supabase.from("groups").insert({
    name,
    created_by: user.id,
  });

  if (error) {
    redirect("/groups/new?error=" + encodeURIComponent(error.message));
  }

  redirect("/groups");
}
