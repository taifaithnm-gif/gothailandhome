"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePartnerPermission } from "@/lib/partners/auth";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateDeveloperOrgAction(formData: FormData) {
  const partner = await requirePartnerPermission("org.update");
  const supabase = await createClient();
  await supabase
    .from("partner_orgs")
    .update({
      name: formString(formData, "name").slice(0, 160),
      website: formString(formData, "website").slice(0, 240) || null,
      lead_routing_email:
        formString(formData, "lead_routing_email").slice(0, 240) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", partner.orgId);

  await supabase.from("partner_audit_events").insert({
    org_id: partner.orgId,
    actor_user_id: partner.userId,
    event_type: "org_profile_updated",
    payload: {},
  });

  revalidatePath("/partners/app/developer");
  redirect("/partners/app/developer");
}
