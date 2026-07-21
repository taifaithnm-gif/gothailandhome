import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { isPartnerRole, type PartnerRole } from "@/lib/partners/rbac";
import { createClient } from "@/lib/supabase/server";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPartnerInvite(input: {
  orgId: string;
  role: PartnerRole;
  email: string;
  invitedByUserId: string;
  ttlHours?: number;
}): Promise<{ ok: true; token: string } | { ok: false; message: string }> {
  if (!isPartnerRole(input.role)) {
    return { ok: false, message: "Invalid role." };
  }
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(
    Date.now() + (input.ttlHours ?? 72) * 60 * 60 * 1000,
  ).toISOString();
  const supabase = await createClient();
  const { error } = await supabase.from("partner_invites").insert({
    org_id: input.orgId,
    role: input.role,
    email: input.email.trim().toLowerCase(),
    token_hash: hashToken(token),
    invited_by: input.invitedByUserId,
    expires_at: expiresAt,
    status: "pending",
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, token };
}

export async function acceptPartnerInvite(input: {
  token: string;
  userId: string;
  email: string | null;
}): Promise<{ ok: true; role: PartnerRole } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("partner_invites")
    .select("id, org_id, role, email, expires_at, status")
    .eq("token_hash", hashToken(input.token))
    .maybeSingle();

  if (!invite || invite.status !== "pending") {
    return { ok: false, message: "Invite not found." };
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { ok: false, message: "Invite expired." };
  }
  if (
    input.email &&
    invite.email &&
    input.email.toLowerCase() !== invite.email.toLowerCase()
  ) {
    return { ok: false, message: "Invite email mismatch." };
  }
  if (!isPartnerRole(invite.role)) {
    return { ok: false, message: "Invalid invite role." };
  }

  const { error: memErr } = await supabase.from("partner_memberships").upsert(
    {
      org_id: invite.org_id,
      user_id: input.userId,
      role: invite.role,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "org_id,user_id" },
  );
  if (memErr) return { ok: false, message: memErr.message };

  await supabase
    .from("partner_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return { ok: true, role: invite.role };
}
