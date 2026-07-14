/**
 * Listing identity helpers for multi-source readiness.
 * Fingerprints must not depend only on title.
 */
import { createHash } from "node:crypto";

/** Canonical source key (lowercase, trimmed). */
export function normalizeSourceKey(source) {
  return String(source || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/**
 * Extract PropertyHub numeric listing id from external_ref or URL.
 * @returns {string|null}
 */
export function extractPropertyHubListingId(externalRef, listingUrl) {
  const fromRef = String(externalRef || "").match(
    /(?:^|-)(?:propertyhub-)?(\d{5,})$/i,
  );
  if (fromRef) return fromRef[1];
  const fromUrl = String(listingUrl || "").match(/(\d{5,})(?:\/?$|\?)/);
  if (fromUrl) return fromUrl[1];
  const dash = String(listingUrl || "").match(/---(\d{5,})/);
  if (dash) return dash[1];
  return null;
}

/**
 * source_listing_id: stable id within a source system.
 */
export function deriveSourceListingId(source, externalRef, listingUrl) {
  const key = normalizeSourceKey(source);
  if (key === "propertyhub") {
    return extractPropertyHubListingId(externalRef, listingUrl);
  }
  if (key === "livinginsider") {
    const fromRef = String(externalRef || "").match(
      /(?:^|-)(?:livinginsider-)?(\d{5,})$/i,
    );
    if (fromRef) return fromRef[1];
    const fromUrl = String(listingUrl || "").match(
      /(?:en_|LV|detail_en\/[^/]+-)(\d{5,})/i,
    );
    if (fromUrl) return fromUrl[1];
    return null;
  }
  if (externalRef) {
    const stripped = String(externalRef).replace(new RegExp(`^${key}-`, "i"), "");
    return stripped || String(externalRef);
  }
  return null;
}

/**
 * Normalize listing URL for comparison (strip tracking, prefer /en/listings/{id} for PropertyHub).
 */
export function normalizeSourceUrl(source, listingUrl, sourceListingId = null) {
  if (!listingUrl) return null;
  let u;
  try {
    u = new URL(listingUrl);
  } catch {
    return null;
  }
  u.hash = "";
  // Drop common tracking params
  for (const p of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "ref",
  ]) {
    u.searchParams.delete(p);
  }
  const key = normalizeSourceKey(source);
  if (key === "propertyhub" && sourceListingId) {
    return `https://propertyhub.in.th/en/listings/${sourceListingId}`;
  }
  if (key === "livinginsider" && sourceListingId) {
    return `https://www.livinginsider.com/re/en_${sourceListingId}`;
  }
  u.hostname = u.hostname.toLowerCase();
  // Collapse default ports
  if (
    (u.protocol === "https:" && u.port === "443") ||
    (u.protocol === "http:" && u.port === "80")
  ) {
    u.port = "";
  }
  // Trailing slash normalization for path-only
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

export function sourceUrlHash(normalizedUrl) {
  if (!normalizedUrl) return null;
  return createHash("sha256").update(normalizedUrl).digest("hex");
}

/**
 * Primary identity fingerprint: source + source_listing_id (never title-only).
 */
export function identityFingerprint(source, sourceListingId) {
  const key = normalizeSourceKey(source);
  if (!key || !sourceListingId) return null;
  return createHash("sha256")
    .update(`id|${key}|${sourceListingId}`)
    .digest("hex");
}

/**
 * Soft match candidate fingerprint (cross-source). Not for auto-merge.
 * Uses project + type + beds + area + floor — excludes title and price.
 */
export function softMatchFingerprint({
  projectSlug,
  listingType,
  bedrooms,
  areaSqm,
  floorLabel,
}) {
  const area =
    areaSqm == null || Number.isNaN(Number(areaSqm))
      ? ""
      : String(Math.round(Number(areaSqm) * 10) / 10);
  const beds =
    bedrooms == null || Number.isNaN(Number(bedrooms))
      ? ""
      : String(Number(bedrooms));
  const floor = floorLabel == null ? "" : String(floorLabel).trim();
  const raw = [
    "soft",
    String(projectSlug || "").toLowerCase(),
    String(listingType || "").toLowerCase(),
    beds,
    area,
    floor,
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Full identity payload derived from a package listing record.
 */
export function deriveListingIdentity(listing) {
  const source = normalizeSourceKey(listing.source) || "unknown";
  const sourceListingId = deriveSourceListingId(
    source,
    listing.external_ref,
    listing.listing_url,
  );
  const normalized = normalizeSourceUrl(
    source,
    listing.listing_url,
    sourceListingId,
  );
  const identityFp =
    identityFingerprint(source, sourceListingId) ||
    listing.duplicate_fingerprint ||
    null;
  const softFp = softMatchFingerprint({
    projectSlug: listing.project_slug,
    listingType: listing.listing_type,
    bedrooms: listing.bedrooms,
    areaSqm: listing.area_sqm,
    floorLabel: listing.floor_label,
  });

  return {
    source,
    source_listing_id: sourceListingId,
    normalized_source_url: normalized,
    source_url_hash: sourceUrlHash(normalized),
    duplicate_fingerprint: identityFp,
    soft_match_fingerprint: softFp,
    external_ref:
      listing.external_ref ||
      (sourceListingId ? `${source}-${sourceListingId}` : null),
  };
}
