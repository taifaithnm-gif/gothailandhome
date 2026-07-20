/**
 * P1-17 — Comparison field allowlist (G-PRODUCT-COMPARE).
 *
 * Only evidence-backed listing facts already presented on cards/detail may be
 * compared. Unsupported investment and performance claims are explicitly
 * excluded. Missing values must render as unknown in UI (P1-18) — never as
 * zero/fabricated figures.
 */

/** Presentation rule for absent comparable values (enforced by P1-18 UI). */
export const COMPARE_MISSING_VALUE_POLICY = "unknown_not_zero" as const;

/**
 * Approved comparable fields — keys align with PropertyView evidence surfaces
 * used by property cards and detail (sourced facts only).
 */
export const COMPARE_APPROVED_FIELDS = [
  "listingType",
  "type",
  "priceThb",
  "bedrooms",
  "bathrooms",
  "areaSqm",
  "landAreaSqm",
  "floorLabel",
  "buildingLabel",
  "districtName",
  "location",
  "projectName",
  "projectSlug",
  "developerSlug",
  "transitTags",
  "source",
  "lastVerifiedAt",
  "isVerifiedListing",
  "sourceUpdatedAt",
] as const;

export type CompareApprovedField = (typeof COMPARE_APPROVED_FIELDS)[number];

/**
 * Explicitly blocked keys — investment / yield / performance claims that are
 * not supported by current property evidence and must never enter comparison.
 */
export const COMPARE_BLOCKED_FIELDS = [
  "yield",
  "rentalYield",
  "grossYield",
  "netYield",
  "roi",
  "returnOnInvestment",
  "capRate",
  "appreciation",
  "expectedReturn",
  "investmentScore",
  "cashFlow",
  "irr",
  "projectedIncome",
  "performance",
  "profit",
  "guaranteedReturn",
] as const;

export type CompareBlockedField = (typeof COMPARE_BLOCKED_FIELDS)[number];

const approvedSet = new Set<string>(COMPARE_APPROVED_FIELDS);
const blockedSet = new Set<string>(COMPARE_BLOCKED_FIELDS);

export function isApprovedCompareField(field: string): field is CompareApprovedField {
  return approvedSet.has(field);
}

export function isBlockedCompareField(field: string): field is CompareBlockedField {
  return blockedSet.has(field);
}

/**
 * True only when every approved field is outside the investment-claim blocklist
 * (fail closed if the allowlist is ever polluted).
 */
export function compareAllowlistExcludesInvestmentClaims(): boolean {
  for (const field of COMPARE_APPROVED_FIELDS) {
    if (blockedSet.has(field)) return false;
  }
  return true;
}

/** Ordered copy of the approved allowlist for UI/table consumers. */
export function listApprovedCompareFields(): CompareApprovedField[] {
  return [...COMPARE_APPROVED_FIELDS];
}
