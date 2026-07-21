"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePartnerPermission } from "@/lib/partners/auth";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createStewardshipAction(formData: FormData) {
  const partner = await requirePartnerPermission("listings.steward");
  const slug = formString(formData, "property_slug").trim().toLowerCase();
  if (!slug) redirect("/partners/app/agent");
  const supabase = await createClient();
  await supabase.from("agent_stewardships").insert({
    org_id: partner.orgId,
    user_id: partner.userId,
    property_slug: slug,
    notes: formString(formData, "notes").slice(0, 1000) || null,
  });
  await supabase.from("partner_audit_events").insert({
    org_id: partner.orgId,
    actor_user_id: partner.userId,
    event_type: "stewardship_created",
    payload: { property_slug: slug },
  });
  revalidatePath("/partners/app/agent");
  redirect("/partners/app/agent");
}

export async function createHandoffAction(formData: FormData) {
  const partner = await requirePartnerPermission("leads.handoff");
  const leadId = formString(formData, "lead_id").trim() || null;
  const supabase = await createClient();
  await supabase.from("partner_lead_handoffs").insert({
    org_id: partner.orgId,
    from_user_id: partner.userId,
    lead_id: leadId,
    status: "pending",
    viewing_notes: formString(formData, "viewing_notes").slice(0, 2000) || null,
  });
  await supabase.from("partner_audit_events").insert({
    org_id: partner.orgId,
    actor_user_id: partner.userId,
    event_type: "lead_handoff_created",
    payload: { lead_id: leadId },
  });
  revalidatePath("/partners/app/agent");
  redirect("/partners/app/agent");
}
