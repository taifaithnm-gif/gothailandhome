/**
 * Project adapter — Goth → internal project candidates.
 * UNKNOWN developer / LOW province → review, never silent drop.
 */

import type { ProjectCandidate } from "../types.ts";
import {
  buildProvenance,
  KNOWN_GOTH_PROJECT_FIELDS,
  normalizeName,
  slugCandidate,
  toConfidence,
  unknownFields,
} from "./goth-helpers.ts";
import type {
  GothAdapterContext,
  GothDeveloperRecord,
  GothMappedReviewState,
  GothProjectRecord,
} from "./goth-types.ts";

function findDeveloperCandidate(
  raw: Record<string, unknown>,
  developers: GothDeveloperRecord[],
): GothDeveloperRecord | null {
  const resolution = (raw.developer_resolution ?? {}) as Record<string, unknown>;
  const name = String(
    raw.developer ?? resolution.developer_name ?? "",
  ).trim();
  const normalized = normalizeName(name);
  if (!normalized) return null;
  return (
    developers.find(
      (d) =>
        d.normalizedName === normalized ||
        d.aliases.some((a) => normalizeName(a) === normalized),
    ) ?? null
  );
}

export function adaptGothProject(
  raw: Record<string, unknown>,
  ctx: GothAdapterContext,
  developers: GothDeveloperRecord[],
  options?: {
    imageIdsByProject?: Map<string, string[]>;
    pdfIdsByProject?: Map<string, string[]>;
    newsIdsByProject?: Map<string, string[]>;
  },
): GothProjectRecord {
  const projectId = String(raw.project_id ?? "").trim();
  const name = String(raw.project_name ?? "").trim();
  const provinceRes = (raw.province_resolution ?? {}) as Record<
    string,
    unknown
  >;
  const developerRes = (raw.developer_resolution ?? {}) as Record<
    string,
    unknown
  >;
  const linked = findDeveloperCandidate(raw, developers);
  const developerIdentityStatus =
    linked?.identityStatus ??
    (String(developerRes.developer_id ?? "") === "dev-unknown"
      ? "UNKNOWN"
      : "CANDIDATE");

  const provinceConfidence = toConfidence(provinceRes.confidence);
  const provinceConflict =
    String(provinceRes.status ?? "")
      .toUpperCase()
      .includes("CONFLICT") ||
    String(provinceRes.resolution_method ?? "")
      .toUpperCase()
      .includes("CONFLICT");

  let reviewState: GothMappedReviewState = "READY_FOR_APPROVAL";
  if (provinceConflict) reviewState = "CONFLICT";
  else if (
    provinceConfidence === "LOW" ||
    String(provinceRes.status ?? "").toUpperCase() === "REVIEW_REQUIRED" ||
    developerIdentityStatus === "UNKNOWN" ||
    !raw.evidence
  ) {
    reviewState = "REVIEW_REQUIRED";
  }

  const unsupported = unknownFields(raw, KNOWN_GOTH_PROJECT_FIELDS);
  const evidenceObj = (raw.evidence ?? null) as Record<string, unknown> | null;
  const sourceUrl = raw.source_url != null ? String(raw.source_url) : null;
  const sourceDomain =
    raw.source_domain != null ? String(raw.source_domain) : null;

  const provenance = buildProvenance({
    sourceRecordId: projectId || slugCandidate(name || "project"),
    batchId: ctx.batchId,
    jobId: ctx.jobId,
    schemaVersion: ctx.schemaVersion,
    sourceUrl,
    sourceDomain,
    capturedAt: raw.captured_at != null ? String(raw.captured_at) : null,
    rawPayload: raw,
    unsupportedFields: unsupported,
    confidence: provinceConfidence,
    reviewReason:
      reviewState === "CONFLICT"
        ? "PROVINCE_CONFLICT"
        : reviewState === "REVIEW_REQUIRED"
          ? "PROJECT_REVIEW_REQUIRED"
          : null,
  });

  return {
    id: projectId || `project-${slugCandidate(name || "unknown")}`,
    sourceId: projectId || provenance.sourceRecordId,
    name: name || projectId,
    normalizedName: normalizeName(name || projectId),
    slugCandidate: slugCandidate(name || projectId),
    developerCandidateId: linked?.id ?? null,
    developerIdentityStatus,
    province:
      raw.province != null
        ? String(raw.province)
        : provinceRes.province != null
          ? String(provinceRes.province)
          : null,
    provinceConfidence,
    provinceConflict,
    location: raw.location != null ? String(raw.location) : null,
    sourceUrl,
    sourceDomain,
    evidence: evidenceObj
      ? [
          {
            kind: "html",
            hash:
              evidenceObj.sha256 != null
                ? String(evidenceObj.sha256)
                : undefined,
            url: sourceUrl ?? undefined,
          },
        ]
      : [],
    imageIds: options?.imageIdsByProject?.get(projectId) ?? [],
    pdfIds: options?.pdfIdsByProject?.get(projectId) ?? [],
    newsIds: options?.newsIdsByProject?.get(projectId) ?? [],
    reviewState,
    rawPayload: raw,
    unsupportedFields: unsupported,
    provenance,
  };
}

export function adaptGothProjects(
  rows: Record<string, unknown>[],
  ctx: GothAdapterContext,
  developers: GothDeveloperRecord[],
  options?: Parameters<typeof adaptGothProject>[3],
): GothProjectRecord[] {
  return rows.map((row) => adaptGothProject(row, ctx, developers, options));
}

export function toImportProject(record: GothProjectRecord): ProjectCandidate {
  return {
    id: record.id,
    sourceId: record.sourceId,
    name: record.name,
    normalizedName: record.normalizedName,
    slug: record.slugCandidate,
    routeCandidate: record.slugCandidate,
    developerId: record.developerCandidateId,
    developerName:
      typeof record.rawPayload.developer === "string"
        ? record.rawPayload.developer
        : null,
    developerIdentityStatus: record.developerIdentityStatus,
    province: record.province,
    provinceConfidence: record.provinceConfidence,
    provinceConflict: record.provinceConflict,
    location: record.location,
    sourceUrl: record.sourceUrl,
    sourceDomain: record.sourceDomain,
    evidence: record.evidence,
    images: record.imageIds,
    pdfs: record.pdfIds,
    news: record.newsIds,
    confidence: record.provinceConfidence,
    reviewState: record.reviewState as ProjectCandidate["reviewState"],
    provenance: record.provenance,
  };
}
