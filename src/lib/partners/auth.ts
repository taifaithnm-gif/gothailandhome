import "server-only";

import { redirect } from "next/navigation";

import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";
import {
  isPartnerRole,
  partnerHasPermission,
  type PartnerPermission,
  type PartnerRole,
} from "@/lib/partners/rbac";
import { createClient } from "@/lib/supabase/server";

export type PartnerSession = {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  role: PartnerRole;
  membershipId: string;
};

export async function getOptionalPartner(): Promise<PartnerSession | null> {
  if (!isPhase2PartnerPortalEnabled()) return null;
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
  if (admin) return null;

  const { data: membership } = await supabase
    .from("partner_memberships")
    .select("id, org_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership || !isPartnerRole(membership.role)) return null;

  const { data: org } = await supabase
    .from("partner_orgs")
    .select("id, name")
    .eq("id", membership.org_id)
    .maybeSingle();
  if (!org) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: org.id,
    orgName: org.name,
    role: membership.role,
    membershipId: membership.id,
  };
}

export async function requirePartner(
  role?: PartnerRole,
): Promise<PartnerSession> {
  if (!isPhase2PartnerPortalEnabled()) {
    redirect("/en");
  }
  const partner = await getOptionalPartner();
  if (!partner) redirect("/partners/app/sign-in");
  if (role && partner.role !== role) {
    redirect("/partners/app");
  }
  return partner;
}

export async function requirePartnerPermission(
  permission: PartnerPermission,
): Promise<PartnerSession> {
  const partner = await requirePartner();
  if (!partnerHasPermission(partner.role, permission)) {
    redirect("/partners/app");
  }
  return partner;
}
