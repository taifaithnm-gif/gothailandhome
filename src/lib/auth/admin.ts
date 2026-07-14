import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login?error=unauthorized");
  }

  return { supabase, user, admin };
}

export async function getOptionalAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return admin ? { supabase, user, admin } : null;
}
