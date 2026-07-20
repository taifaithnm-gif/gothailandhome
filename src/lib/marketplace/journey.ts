/**
 * P1-21 — Contact / marketplace journey consolidation.
 *
 * One canonical entry path per audience. Hub (`/marketplace`) is the catalog;
 * Contact (`/contact`) is Platform Customer Success only. Form destinations stay
 * reachable from the hub (and contextual CTAs), but site chrome does not
 * duplicate them as peer nav items.
 */

export type MarketplaceAudience =
  | "buyer"
  | "owner"
  | "developer"
  | "agency"
  | "viewing"
  | "platform_support";

export type MarketplaceJourney = {
  audience: MarketplaceAudience;
  /** Hub entry id, or null when the path is Contact (not a hub card). */
  hubEntryId:
    | "find_my_home"
    | "list_your_property"
    | "developer_partnership"
    | "agency_partnership"
    | "viewing_request"
    | null;
  /** Canonical site-relative path (no locale). */
  path: string;
  /** Where the intake form actually lives (viewing stays on listing detail). */
  formPath: string;
  /** Shared lead success channel, or null for platform support (inline). */
  channel:
    | "find_my_home"
    | "list_your_property"
    | "developer_partnership"
    | "agency_partnership"
    | "viewing_request"
    | null;
  /** Demand / ownership submissions stay private — never presented as published. */
  privateSubmission: boolean;
};

/**
 * Canonical audience → entry matrix. Site chrome must not invent alternate
 * peer destinations for the same audience.
 */
export const MARKETPLACE_JOURNEYS: readonly MarketplaceJourney[] = [
  {
    audience: "buyer",
    hubEntryId: "find_my_home",
    path: "/find-my-home",
    formPath: "/find-my-home",
    channel: "find_my_home",
    privateSubmission: true,
  },
  {
    audience: "owner",
    hubEntryId: "list_your_property",
    path: "/list-your-property",
    formPath: "/list-your-property",
    channel: "list_your_property",
    privateSubmission: true,
  },
  {
    audience: "developer",
    hubEntryId: "developer_partnership",
    path: "/partners/developers",
    formPath: "/partners/developers",
    channel: "developer_partnership",
    privateSubmission: true,
  },
  {
    audience: "agency",
    hubEntryId: "agency_partnership",
    path: "/partners/agencies",
    formPath: "/partners/agencies",
    channel: "agency_partnership",
    privateSubmission: true,
  },
  {
    audience: "viewing",
    hubEntryId: "viewing_request",
    path: "/properties",
    formPath: "/properties/[id]",
    channel: "viewing_request",
    privateSubmission: true,
  },
  {
    audience: "platform_support",
    hubEntryId: null,
    path: "/contact",
    formPath: "/contact",
    channel: null,
    privateSubmission: true,
  },
] as const;

/** Hub catalog path — sole marketplace chrome entry. */
export const MARKETPLACE_HUB_PATH = "/marketplace";

/** Platform Customer Success path — sole contact chrome entry. */
export const CONTACT_PATH = "/contact";

export function getJourneyByAudience(
  audience: MarketplaceAudience,
): MarketplaceJourney {
  const row = MARKETPLACE_JOURNEYS.find((item) => item.audience === audience);
  if (!row) {
    throw new Error(`Unknown marketplace audience: ${audience}`);
  }
  return row;
}

export function listJourneyPaths(): string[] {
  return MARKETPLACE_JOURNEYS.map((item) => item.path);
}
