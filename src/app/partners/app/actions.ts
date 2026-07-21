"use server";

import { redirect } from "next/navigation";

import { isAdminUserId } from "@/lib/auth/customer";
import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";
import { acceptPartnerInvite } from "@/lib/partners/onboarding";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function partnerSignIn(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isPhase2PartnerPortalEnabled()) {
    return { error: "Partner portal disabled." };
  }
  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");
  const inviteToken = formString(formData, "inviteToken").trim();
  if (!email || !password) return { error: "Email and password required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { error: "Sign-in failed." };
  }
  if (await isAdminUserId(data.user.id)) {
    await supabase.auth.signOut();
    return { error: "Staff must use admin login." };
  }

  if (inviteToken) {
    const accepted = await acceptPartnerInvite({
      token: inviteToken,
      userId: data.user.id,
      email: data.user.email ?? email,
    });
    if (!accepted.ok) return { error: accepted.message };
  }

  redirect("/partners/app");
}

export async function partnerSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/partners/app/sign-in");
}
