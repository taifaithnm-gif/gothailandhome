"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2CrmSyncEnabled, isPhase2OpsLeadsEnabled } from "@/lib/feature-flags";
import {
  canTransitionLeadStatus,
  isLeadStatus,
  type LeadStatus,
} from "@/lib/ops/lead-lifecycle";
import { pushLeadToCrm } from "@/lib/crm/webhook";
import { enqueueNotification } from "@/lib/notifications/outbox";
import { isPhase2NotificationsEnabled } from "@/lib/feature-flags";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateLeadStatusAction(formData: FormData) {
  if (!isPhase2OpsLeadsEnabled()) {
    redirect("/admin");
  }
  const { supabase, user } = await requireAdmin();
  const id = formString(formData, "id");
  const nextStatus = formString(formData, "status");
  const note = formString(formData, "note").slice(0, 500);
  const assignedTo = formString(formData, "assignedTo").slice(0, 120);

  if (!id || !isLeadStatus(nextStatus)) {
    redirect("/admin/ops/leads");
  }

  const { data: current } = await supabase
    .from("marketplace_leads")
    .select("id, status, email, name, lead_type, locale, phone, message")
    .eq("id", id)
    .maybeSingle();

  if (!current) redirect("/admin/ops/leads");

  const from = current.status as LeadStatus;
  if (!canTransitionLeadStatus(from, nextStatus)) {
    redirect(`/admin/ops/leads/${id}?error=invalid_transition`);
  }

  const { error } = await supabase
    .from("marketplace_leads")
    .update({
      status: nextStatus,
      assigned_to: assignedTo || null,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!error) {
    await supabase.from("marketplace_lead_events").insert({
      lead_id: id,
      actor_user_id: user.id,
      event_type: "status_change",
      from_status: from,
      to_status: nextStatus,
      note: note || null,
    });

    if (isPhase2NotificationsEnabled() && current.email) {
      await enqueueNotification({
        email: current.email,
        eventType: "lead_status_changed",
        payload: { leadId: id, from, to: nextStatus },
      });
    }

    if (isPhase2CrmSyncEnabled()) {
      await pushLeadToCrm({
        id,
        leadType: current.lead_type,
        status: nextStatus,
        email: current.email,
        name: current.name,
        locale: current.locale,
        phone: current.phone,
        message: current.message,
      });
    }
  }

  revalidatePath("/admin/ops/leads");
  revalidatePath(`/admin/ops/leads/${id}`);
  redirect(`/admin/ops/leads/${id}`);
}
