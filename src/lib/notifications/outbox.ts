import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isPhase2NotificationsEnabled } from "@/lib/feature-flags";
import type { NotificationEventType } from "@/lib/notifications/prefs";

export type OutboxStatus = "pending" | "sent" | "failed" | "dead";

export async function enqueueNotification(input: {
  userId?: string | null;
  email?: string | null;
  eventType: NotificationEventType;
  payload: Record<string, unknown>;
}): Promise<{ ok: true; id?: string } | { ok: false; message: string }> {
  if (!isPhase2NotificationsEnabled()) {
    return { ok: false, message: "Notifications feature disabled." };
  }
  if (!input.email && !input.userId) {
    return { ok: false, message: "Recipient required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_outbox")
    .insert({
      user_id: input.userId ?? null,
      email: input.email ?? null,
      event_type: input.eventType,
      payload: input.payload,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data?.id };
}

/**
 * Attempt to deliver pending outbox rows.
 * Uses Resend when RESEND_API_KEY is set; otherwise marks as failed with reason
 * (no silent drop — visible for ops). Bounce handling: mark dead after 3 fails.
 */
export async function processNotificationOutbox(limit = 20): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  if (!isPhase2NotificationsEnabled()) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("notification_outbox")
    .select("id, email, event_type, payload, attempts")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  let sent = 0;
  let failed = 0;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM_EMAIL ?? "noreply@gothailandhome.com";

  for (const row of rows ?? []) {
    const attempts = (row.attempts ?? 0) + 1;
    try {
      if (!row.email) throw new Error("Missing email");
      if (!apiKey) throw new Error("RESEND_API_KEY not configured");

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [row.email],
          subject: `GoThailandHome: ${row.event_type}`,
          text: JSON.stringify(row.payload, null, 2),
        }),
      });
      if (!res.ok) {
        throw new Error(`Resend HTTP ${res.status}`);
      }
      await supabase
        .from("notification_outbox")
        .update({
          status: "sent",
          attempts,
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", row.id);
      sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "send failed";
      const status = attempts >= 3 ? "dead" : "failed";
      await supabase
        .from("notification_outbox")
        .update({
          status: status === "dead" ? "dead" : "pending",
          attempts,
          last_error: message,
        })
        .eq("id", row.id);
      if (status === "dead") {
        // leave as dead
        await supabase
          .from("notification_outbox")
          .update({ status: "dead" })
          .eq("id", row.id);
      }
      failed += 1;
    }
  }

  return { processed: (rows ?? []).length, sent, failed };
}
