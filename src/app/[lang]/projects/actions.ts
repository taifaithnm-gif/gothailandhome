"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type LeadFormState = {
  ok: boolean;
  message: string;
};

export async function submitProjectLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "Enquiry storage is not configured.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en").trim();
  const projectId = String(formData.get("project_id") ?? "").trim() || null;
  const projectSlug = String(formData.get("project_slug") ?? "").trim();
  const projectTitle = String(formData.get("project_title") ?? "").trim();
  const conversionEvent =
    String(formData.get("conversion_event") ?? "generate_lead").trim() ||
    "generate_lead";

  if (!name || !email || !message) {
    return { ok: false, message: "Name, email, and message are required." };
  }

  const contextLine =
    projectSlug || projectTitle
      ? `Project: ${projectTitle || projectSlug}${projectSlug ? ` (${projectSlug})` : ""}`
      : null;
  const storedMessage = contextLine
    ? `${contextLine}\n\n${message}`
    : message;

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone: phone || null,
    message: storedMessage,
    locale,
    project_id: projectId,
    utm_source: String(formData.get("utm_source") ?? "").trim() || null,
    utm_medium: String(formData.get("utm_medium") ?? "").trim() || null,
    utm_campaign: String(formData.get("utm_campaign") ?? "").trim() || null,
    utm_content: String(formData.get("utm_content") ?? "").trim() || null,
    utm_term: String(formData.get("utm_term") ?? "").trim() || null,
    gclid: String(formData.get("gclid") ?? "").trim() || null,
    fbclid: String(formData.get("fbclid") ?? "").trim() || null,
    conversion_event: conversionEvent,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "ok" };
}
