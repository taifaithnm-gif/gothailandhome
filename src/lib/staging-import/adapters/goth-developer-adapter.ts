/**
 * Developer adapter — Goth → internal developer candidates.
 * Never reuses developer_id=dev-unknown as a unique primary key.
 */

import type { DeveloperCandidate } from "../types.ts";
import {
  buildProvenance,
  KNOWN_GOTH_DEVELOPER_FIELDS,
  normalizeName,
  sha256Text,
  toConfidence,
  unknownFields,
} from "./goth-helpers.ts";
import type {
  GothAdapterContext,
  GothDeveloperRecord,
  GothIdentityStatus,
  GothMappedReviewState,
} from "./goth-types.ts";

export function stableUnknownDeveloperId(raw: Record<string, unknown>): string {
  const basis = [
    String(raw.source_url ?? ""),
    String(raw.name ?? ""),
    String(raw.slug ?? ""),
    String(raw.captured_at ?? ""),
    JSON.stringify(raw.developer_resolution ?? {}),
  ].join("|");
  const hash = sha256Text(basis).slice(0, 16);
  return `candidate-dev-${hash}`;
}

export function adaptGothDeveloper(
  raw: Record<string, unknown>,
  ctx: GothAdapterContext,
): GothDeveloperRecord {
  const resolution = (raw.developer_resolution ?? {}) as Record<string, unknown>;
  const declaredId = String(resolution.developer_id ?? "");
  const name = String(raw.name ?? resolution.developer_name ?? "").trim();
  const slug = String(raw.slug ?? "").trim() || null;
  const isUnknown =
    !declaredId ||
    declaredId === "dev-unknown" ||
    String(name).toUpperCase() === "UNKNOWN";

  const id = isUnknown
    ? stableUnknownDeveloperId(raw)
    : declaredId.startsWith("dev-")
      ? declaredId
      : `dev-${declaredId}`;

  const identityStatus: GothIdentityStatus = isUnknown ? "UNKNOWN" : "KNOWN";
  const confidence = toConfidence(resolution.confidence ?? "UNKNOWN");
  const officialWebsite =
    raw.official_website == null ? null : String(raw.official_website);
  const officialWebsiteVerified = Boolean(raw.official_website_verified);
  const dnsStatus: GothDeveloperRecord["dnsStatus"] =
    officialWebsiteVerified && officialWebsite
      ? "ok"
      : officialWebsite && !officialWebsiteVerified
        ? "unverified"
        : officialWebsite == null
          ? "unknown"
          : "failed";

  const reviewState: GothMappedReviewState =
    identityStatus === "UNKNOWN" || confidence === "LOW" || dnsStatus === "failed"
      ? "REVIEW_REQUIRED"
      : "READY_FOR_APPROVAL";

  const unsupported = unknownFields(raw, KNOWN_GOTH_DEVELOPER_FIELDS);
  const aliases = Array.isArray(raw.aliases)
    ? raw.aliases.map((a) => String(a)).filter(Boolean)
    : [];
  if (slug && !aliases.includes(slug)) aliases.push(slug);

  const sourceUrl =
    raw.source_url != null
      ? String(raw.source_url)
      : resolution.source_url != null
        ? String(resolution.source_url)
        : null;

  const provenance = buildProvenance({
    sourceRecordId: slug ?? id,
    batchId: ctx.batchId,
    jobId: ctx.jobId,
    schemaVersion: ctx.schemaVersion,
    sourceUrl,
    sourceDomain: sourceUrl ? (() => {
      try {
        return new URL(sourceUrl).hostname;
      } catch {
        return null;
      }
    })() : null,
    capturedAt: raw.captured_at != null ? String(raw.captured_at) : null,
    rawPayload: raw,
    unsupportedFields: unsupported,
    confidence,
    reviewReason: identityStatus === "UNKNOWN" ? "UNKNOWN_DEVELOPER" : null,
  });

  return {
    id,
    sourceId: slug ?? id,
    name: name || id,
    normalizedName: normalizeName(name || id),
    aliases,
    officialWebsite,
    officialWebsiteVerified,
    resolutionMethod:
      resolution.resolution_method != null
        ? String(resolution.resolution_method)
        : null,
    confidence,
    evidence: [
      {
        kind: "other",
        url: sourceUrl ?? undefined,
        path: undefined,
      },
    ],
    dnsStatus,
    sourceUrl,
    reviewState,
    identityStatus,
    rawPayload: raw,
    unsupportedFields: unsupported,
    provenance,
  };
}

export function adaptGothDevelopers(
  rows: Record<string, unknown>[],
  ctx: GothAdapterContext,
): GothDeveloperRecord[] {
  return rows.map((row) => adaptGothDeveloper(row, ctx));
}

export function toImportDeveloper(
  record: GothDeveloperRecord,
): DeveloperCandidate {
  return {
    id: record.id,
    sourceId: record.sourceId,
    name: record.name,
    normalizedName: record.normalizedName,
    aliases: record.aliases,
    officialWebsite: record.officialWebsite,
    officialWebsiteVerified: record.officialWebsiteVerified,
    resolutionMethod: record.resolutionMethod,
    confidence: record.confidence,
    evidence: record.evidence,
    dnsFailure: record.dnsStatus === "failed",
    unknown: record.identityStatus === "UNKNOWN",
    identityStatus: record.identityStatus,
    reviewState: record.reviewState as DeveloperCandidate["reviewState"],
    slug: record.sourceId,
    sourceUrl: record.sourceUrl,
    provenance: record.provenance,
  };
}
