import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { VerificationLevel } from "@/components/ui/badge";

/**
 * Developer Master matrix statuses (Phase 7) — read-only.
 * Never upgrade fields here without official evidence.
 */
export type DeveloperMatrixStatus =
  | "OFFICIAL"
  | "PRESENT"
  | "SET_OR_CATALOG"
  | "CITY_ONLY"
  | "FACTORY"
  | "PLACEHOLDER"
  | "MISSING"
  | "MIXED"
  | string;

/** User-facing presentation classes (no internal matrix jargon in UI). */
export type DeveloperPresentationClass =
  | "OFFICIAL"
  | "PARTIAL"
  | "UNVERIFIED"
  | "FACTORY_LINKED";

export type DeveloperEvidenceField =
  | "official_name"
  | "logo_source"
  | "official_website"
  | "company_profile"
  | "established_year"
  | "headquarters"
  | "completed_projects"
  | "active_projects";

export type DeveloperEvidenceRow = {
  slug: string;
  official_name: string | null;
  logo_source: string | null;
  official_website: string | null;
  established_year: number | null;
  headquarters: string | null;
  completed_n: number;
  active_n: number;
  unclassified_n: number;
  completed_slugs: string[];
  active_slugs: string[];
  S_official_name: DeveloperMatrixStatus;
  S_logo_source: DeveloperMatrixStatus;
  S_official_website: DeveloperMatrixStatus;
  S_company_profile: DeveloperMatrixStatus;
  S_established_year: DeveloperMatrixStatus;
  S_headquarters: DeveloperMatrixStatus;
  S_completed_projects: DeveloperMatrixStatus;
  S_active_projects: DeveloperMatrixStatus;
};

let cached: DeveloperEvidenceRow[] | null = null;

function loadMatrix(): DeveloperEvidenceRow[] {
  if (cached) return cached;
  const path = join(
    process.cwd(),
    "pipelines/factory/developer-master/completeness_matrix.json",
  );
  cached = JSON.parse(readFileSync(path, "utf8")) as DeveloperEvidenceRow[];
  return cached;
}

export function getDeveloperEvidence(
  slug: string,
): DeveloperEvidenceRow | null {
  return loadMatrix().find((row) => row.slug === slug) ?? null;
}

export function matrixStatusFor(
  row: DeveloperEvidenceRow | null,
  field: DeveloperEvidenceField,
): DeveloperMatrixStatus {
  if (!row) return "MISSING";
  const key = `S_${field}` as keyof DeveloperEvidenceRow;
  const value = row[key];
  return typeof value === "string" ? value : "MISSING";
}

/**
 * Map Phase 7 matrix codes → stable presentation classes.
 * Does not upgrade evidence — PRESENT/SET/CITY remain PARTIAL.
 */
export function toPresentationClass(
  status: DeveloperMatrixStatus,
): DeveloperPresentationClass {
  switch (status) {
    case "OFFICIAL":
      return "OFFICIAL";
    case "FACTORY":
    case "MIXED":
      return "FACTORY_LINKED";
    case "PLACEHOLDER":
    case "MISSING":
      return "UNVERIFIED";
    case "PRESENT":
    case "SET_OR_CATALOG":
    case "CITY_ONLY":
      return "PARTIAL";
    default:
      return "UNVERIFIED";
  }
}

export function presentationClassFor(
  row: DeveloperEvidenceRow | null,
  field: DeveloperEvidenceField,
): DeveloperPresentationClass {
  return toPresentationClass(matrixStatusFor(row, field));
}

export type EvidenceLabelKey =
  | "evidenceOfficial"
  | "evidencePartial"
  | "evidenceFactory"
  | "evidenceUnavailable";

export function evidenceLabelKey(
  cls: DeveloperPresentationClass,
): EvidenceLabelKey {
  switch (cls) {
    case "OFFICIAL":
      return "evidenceOfficial";
    case "PARTIAL":
      return "evidencePartial";
    case "FACTORY_LINKED":
      return "evidenceFactory";
    default:
      return "evidenceUnavailable";
  }
}

export function toVerificationLevel(
  cls: DeveloperPresentationClass,
): VerificationLevel {
  switch (cls) {
    case "OFFICIAL":
      return "official";
    case "PARTIAL":
      return "verified_portal";
    case "FACTORY_LINKED":
      return "derived";
    default:
      return "unverified";
  }
}

/** Present a value when it is not pure unavailable. */
export function mayPresentFact(cls: DeveloperPresentationClass): boolean {
  return (
    cls === "OFFICIAL" || cls === "PARTIAL" || cls === "FACTORY_LINKED"
  );
}

/** Official logo only — placeholders are never treated as trademarks. */
export function hasVerifiedOfficialLogo(
  row: DeveloperEvidenceRow | null,
): boolean {
  return matrixStatusFor(row, "logo_source") === "OFFICIAL";
}

/** Initial project cards and listing cards on developer detail HTML. */
export const DEVELOPER_PROJECT_PREVIEW_SIZE = 6;
export const DEVELOPER_LISTING_PREVIEW_SIZE = 3;
