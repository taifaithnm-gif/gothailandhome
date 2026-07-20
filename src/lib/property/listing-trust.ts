/**
 * P1-10 — Listing detail trust helpers.
 * Presentation-only freshness rules aligned with PROPERTY_FRESHNESS_STANDARD_V1
 * age bands. Does not publish, refresh, or invent facts.
 */

export type ListingFreshnessStatus =
  | "fresh"
  | "warning"
  | "expired"
  | "unknown";

export const LISTING_FRESH_MAX_DAYS = 30;
export const LISTING_WARNING_MAX_DAYS = 90;

export function displayOrUnknown(
  value: string | number | null | undefined,
  unknown: string,
): string {
  if (value == null || value === "") return unknown;
  if (typeof value === "number" && !Number.isFinite(value)) return unknown;
  return String(value);
}

export function daysSinceUtc(
  iso: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  if (then.getTime() > now.getTime()) return null;
  const ms = now.getTime() - then.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

/**
 * Deterministic freshness band from last_verified_at.
 * Missing/invalid/future dates are unknown — never treated as fresh.
 */
export function listingFreshnessStatus(
  lastVerifiedAt: string | null | undefined,
  now: Date = new Date(),
): ListingFreshnessStatus {
  const age = daysSinceUtc(lastVerifiedAt, now);
  if (age == null) return "unknown";
  if (age <= LISTING_FRESH_MAX_DAYS) return "fresh";
  if (age <= LISTING_WARNING_MAX_DAYS) return "warning";
  return "expired";
}

/**
 * Price/availability may be presented as current only when the listing is
 * verified and last verification is within the fresh window.
 */
export function mayPresentPriceAsCurrent(input: {
  isVerifiedListing: boolean;
  lastVerifiedAt: string | null | undefined;
  now?: Date;
}): boolean {
  if (!input.isVerifiedListing) return false;
  return (
    listingFreshnessStatus(input.lastVerifiedAt, input.now ?? new Date()) ===
    "fresh"
  );
}

export function isUnknownFactValue(
  value: string,
  unknownLabel: string,
): boolean {
  return value === unknownLabel;
}

/** Stable listing context for inquiry / platform escalation CTAs. */
export function buildListingInquiryContext(input: {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
}): {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
} {
  return {
    propertyId: input.propertyId.trim(),
    propertySlug: input.propertySlug.trim(),
    propertyTitle: input.propertyTitle.trim(),
  };
}

export function listingContactEscalationPath(
  localePathContact: string,
  propertySlug: string,
): string {
  const slug = propertySlug.trim();
  if (!slug) return localePathContact;
  const sep = localePathContact.includes("?") ? "&" : "?";
  return `${localePathContact}${sep}property=${encodeURIComponent(slug)}`;
}
