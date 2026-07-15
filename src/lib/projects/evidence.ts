import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { VerificationLevel } from "@/components/ui/badge";

/** Completeness matrix classes — read-only; never rewrite classifications here. */
export type ProjectEvidenceClass =
  | "OFFICIAL"
  | "VERIFIED_PORTAL"
  | "DERIVED"
  | "UNVERIFIED";

export type ProjectEvidenceField =
  | "official_project_name"
  | "thai_project_name"
  | "developer_relation"
  | "official_project_url"
  | "project_status"
  | "completion_year"
  | "full_address"
  | "district"
  | "subdistrict"
  | "latitude"
  | "longitude"
  | "building_count"
  | "floor_count"
  | "total_units"
  | "unit_types"
  | "official_facilities"
  | "nearest_bts"
  | "nearest_mrt"
  | "official_brochure"
  | "official_floor_plans"
  | "official_gallery_source"
  | "verification_timestamp";

export type ProjectEvidenceRow = {
  slug: string;
} & Record<`C_${ProjectEvidenceField}`, ProjectEvidenceClass>;

type CompletenessMatrix = {
  generated_at: string;
  classification_enum: ProjectEvidenceClass[];
  fields: ProjectEvidenceField[];
  projects: ProjectEvidenceRow[];
};

let cached: CompletenessMatrix | null = null;

function loadMatrix(): CompletenessMatrix {
  if (cached) return cached;
  const path = join(
    process.cwd(),
    "pipelines/factory/project-master/completeness_matrix.json",
  );
  cached = JSON.parse(readFileSync(path, "utf8")) as CompletenessMatrix;
  return cached;
}

export function getProjectEvidence(
  slug: string,
): ProjectEvidenceRow | null {
  const matrix = loadMatrix();
  return matrix.projects.find((p) => p.slug === slug) ?? null;
}

export function evidenceClassFor(
  row: ProjectEvidenceRow | null,
  field: ProjectEvidenceField,
): ProjectEvidenceClass {
  if (!row) return "UNVERIFIED";
  const key = `C_${field}` as const;
  const value = row[key];
  if (
    value === "OFFICIAL" ||
    value === "VERIFIED_PORTAL" ||
    value === "DERIVED" ||
    value === "UNVERIFIED"
  ) {
    return value;
  }
  return "UNVERIFIED";
}

export function toVerificationLevel(
  evidence: ProjectEvidenceClass,
): VerificationLevel {
  switch (evidence) {
    case "OFFICIAL":
      return "official";
    case "VERIFIED_PORTAL":
      return "verified_portal";
    case "DERIVED":
      return "derived";
    default:
      return "unverified";
  }
}

/** Coordinates safe to present as verified map points (not inferred-only). */
export function hasVerifiedCoordinates(
  row: ProjectEvidenceRow | null,
): boolean {
  const lat = evidenceClassFor(row, "latitude");
  const lng = evidenceClassFor(row, "longitude");
  return (
    (lat === "OFFICIAL" || lat === "VERIFIED_PORTAL") &&
    (lng === "OFFICIAL" || lng === "VERIFIED_PORTAL")
  );
}

export function hasOfficialGallery(
  row: ProjectEvidenceRow | null,
): boolean {
  return evidenceClassFor(row, "official_gallery_source") === "OFFICIAL";
}

/** Minimum verified listing sample before showing a price range. */
export const MIN_PRICE_SUMMARY_SAMPLE = 3;

/** Initial listing cards embedded in the project HTML response. */
export const PROJECT_LISTING_PREVIEW_SIZE = 3;

export type EvidenceLabelKey =
  | "evidenceOfficial"
  | "evidencePortal"
  | "evidenceDerived"
  | "evidenceUnavailable";

export function evidenceLabelKey(
  evidence: ProjectEvidenceClass,
): EvidenceLabelKey {
  switch (evidence) {
    case "OFFICIAL":
      return "evidenceOfficial";
    case "VERIFIED_PORTAL":
      return "evidencePortal";
    case "DERIVED":
      return "evidenceDerived";
    default:
      return "evidenceUnavailable";
  }
}

/** True when a classified fact may be shown (not an unverified claim). */
export function mayPresentFact(evidence: ProjectEvidenceClass): boolean {
  return (
    evidence === "OFFICIAL" ||
    evidence === "VERIFIED_PORTAL" ||
    evidence === "DERIVED"
  );
}
