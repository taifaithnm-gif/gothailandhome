import "server-only";

import { redirect } from "next/navigation";

import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";

export type CustomerSession = {
  userId: string;
  email: string | null;
};

/**
 * Customer = authenticated Supabase user who is NOT an admin.
 * Admin privilege escalation is blocked by checking admin_users.
 */
export async function getOptionalCustomer(): Promise<CustomerSession | null> {
  if (!isPhase2AccountEnabled()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (admin) {
    // Staff sessions are not customer sessions for account UX.
    return null;
  }

  return { userId: user.id, email: user.email ?? null };
}

export async function requireCustomer(lang: string): Promise<CustomerSession> {
  if (!isPhase2AccountEnabled()) {
    redirect(`/${lang}`);
  }
  const customer = await getOptionalCustomer();
  if (!customer) {
    redirect(`/${lang}/account/sign-in`);
  }
  return customer;
}

export async function isAdminUserId(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
