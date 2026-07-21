import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isPhase2CrmSyncEnabled } from "@/lib/feature-flags";
import {
  mapLeadToCrmPayload,
  signCrmBody,
  type CrmLeadPayload,
} from "@/lib/crm/adapter";

export type CrmSyncResult =
  | { ok: true; deliveryId: string }
  | { ok: false; message: string; deadLetter?: boolean };

/**
 * Push a lead to the configured CRM webhook.
 * Records delivery attempts for lag / dead-letter monitoring.
 */
export async function pushLeadToCrm(input: {
  id: string;
  leadType: string;
  status: string;
  email?: string | null;
  name?: string | null;
  locale?: string | null;
  phone?: string | null;
  message?: string | null;
}): Promise<CrmSyncResult> {
  if (!isPhase2CrmSyncEnabled()) {
    return { ok: false, message: "CRM sync feature disabled." };
  }

  const url = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET ?? "";
  if (!url) {
    return { ok: false, message: "CRM_WEBHOOK_URL not configured." };
  }

  const payload: CrmLeadPayload = mapLeadToCrmPayload(input);
  const body = JSON.stringify(payload);
  const signature = secret ? signCrmBody(body, secret) : "";

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("crm_sync_deliveries")
    .insert({
      lead_id: input.id,
      direction: "outbound",
      status: "pending",
      payload,
      attempts: 1,
    })
    .select("id")
    .maybeSingle();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature ? { "X-GTH-Signature": signature } : {}),
      },
      body,
    });
    if (!res.ok) {
      throw new Error(`CRM HTTP ${res.status}`);
    }
    if (row?.id) {
      await supabase
        .from("crm_sync_deliveries")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", row.id);
    }
    return { ok: true, deliveryId: row?.id ?? "unknown" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "CRM push failed";
    if (row?.id) {
      await supabase
        .from("crm_sync_deliveries")
        .update({
          status: "dead",
          last_error: message,
        })
        .eq("id", row.id);
    }
    return { ok: false, message, deadLetter: true };
  }
}

export async function getCrmSyncLagSeconds(): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("crm_sync_deliveries")
    .select("created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.created_at) return null;
  return Math.floor((Date.now() - new Date(data.created_at).getTime()) / 1000);
}
