/**
 * P2-040 — Partner RBAC roles.
 * Separated from customer (account) and admin (admin_users).
 */

export const PARTNER_ROLES = ["developer", "agent"] as const;
export type PartnerRole = (typeof PARTNER_ROLES)[number];

export const PARTNER_MEMBERSHIP_STATUSES = [
  "invited",
  "active",
  "suspended",
  "revoked",
] as const;
export type PartnerMembershipStatus =
  (typeof PARTNER_MEMBERSHIP_STATUSES)[number];

export type PartnerPermission =
  | "org.read"
  | "org.update"
  | "projects.read"
  | "projects.route_leads"
  | "listings.steward"
  | "leads.handoff"
  | "viewing.notes";

const ROLE_PERMISSIONS: Record<PartnerRole, PartnerPermission[]> = {
  developer: [
    "org.read",
    "org.update",
    "projects.read",
    "projects.route_leads",
  ],
  agent: ["listings.steward", "leads.handoff", "viewing.notes"],
};

export function isPartnerRole(value: string): value is PartnerRole {
  return (PARTNER_ROLES as readonly string[]).includes(value);
}

export function partnerHasPermission(
  role: PartnerRole,
  permission: PartnerPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Explicit non-overlap with staff/customer planes. */
export const PARTNER_PLANE_RULES = {
  cannotAccessAdmin: true,
  cannotEscalateToAdminViaInvite: true,
  customerAccountDistinct: true,
} as const;
