/**
 * News adapter — never auto-publishes.
 */

import type { NewsCandidate } from "../types.ts";
import {
  buildProvenance,
  daysBetween,
  domainFromUrl,
  isSafeHttpUrl,
  KNOWN_GOTH_NEWS_FIELDS,
  normalizeName,
  sha256Text,
  unknownFields,
} from "./goth-helpers.ts";
import type {
  GothAdapterContext,
  GothMappedReviewState,
  GothNewsRecord,
} from "./goth-types.ts";

export function adaptGothNews(
  raw: Record<string, unknown>,
  ctx: GothAdapterContext,
  seenUrls: Map<string, string>,
  seenTitles: Map<string, string>,
  nowIso = new Date().toISOString(),
): GothNewsRecord {
  const title = raw.title != null ? String(raw.title) : null;
  const sourceUrl = String(raw.source_url ?? "").trim();
  const normalizedTitle = title ? normalizeName(title) : null;
  const capturedAt =
    raw.captured_at != null
      ? String(raw.captured_at)
      : raw.retrieved_at != null
        ? String(raw.retrieved_at)
        : raw.discovered_at != null
          ? String(raw.discovered_at)
          : null;
  const publishedAt =
    raw.published_at != null ? String(raw.published_at) : null;

  const freshnessDays = publishedAt
    ? daysBetween(publishedAt, nowIso)
    : capturedAt
      ? daysBetween(capturedAt, nowIso)
      : null;

  let freshness: GothNewsRecord["freshness"] = "unknown";
  if (typeof freshnessDays === "number") {
    freshness = freshnessDays > 365 ? "stale" : "fresh";
  }

  const idBasis = sourceUrl || title || JSON.stringify(raw);
  const id = `news-${sha256Text(idBasis).slice(0, 16)}`;

  const duplicateUrl = Boolean(sourceUrl && seenUrls.has(sourceUrl));
  const duplicateTitle = Boolean(
    normalizedTitle && seenTitles.has(normalizedTitle),
  );
  if (sourceUrl && !duplicateUrl) seenUrls.set(sourceUrl, id);
  if (normalizedTitle && !duplicateTitle) seenTitles.set(normalizedTitle, id);

  let reviewState: GothMappedReviewState = "READY_FOR_APPROVAL";
  if (!isSafeHttpUrl(sourceUrl)) reviewState = "REJECTED";
  else if (duplicateUrl || duplicateTitle) reviewState = "DUPLICATE";
  else if (freshness === "stale" || !publishedAt) reviewState = "REVIEW_REQUIRED";

  const unsupported = unknownFields(raw, KNOWN_GOTH_NEWS_FIELDS);
  const provenance = buildProvenance({
    sourceRecordId: id,
    batchId: ctx.batchId,
    jobId: ctx.jobId,
    schemaVersion: ctx.schemaVersion,
    sourceUrl,
    sourceDomain:
      raw.source_domain != null
        ? String(raw.source_domain)
        : raw.domain != null
          ? String(raw.domain)
          : domainFromUrl(sourceUrl),
    capturedAt,
    rawPayload: raw,
    unsupportedFields: unsupported,
    reviewReason:
      reviewState === "DUPLICATE"
        ? "NEWS_DUPLICATE"
        : reviewState === "REVIEW_REQUIRED"
          ? "NEWS_REVIEW_REQUIRED"
          : null,
  });

  return {
    id,
    sourceId: id,
    title,
    normalizedTitle,
    sourceUrl,
    sourceDomain: provenance.sourceDomain ?? null,
    publishedAt,
    capturedAt,
    freshnessDays,
    freshness,
    developerCandidateId:
      raw.developer_id != null ? String(raw.developer_id) : null,
    projectCandidateId:
      raw.project_id != null ? String(raw.project_id) : null,
    duplicateUrl,
    duplicateTitle,
    reviewState,
    evidence: [{ kind: "news", url: sourceUrl }],
    rawPayload: raw,
    unsupportedFields: unsupported,
    provenance,
  };
}

export function adaptGothNewsList(
  rows: Record<string, unknown>[],
  ctx: GothAdapterContext,
): GothNewsRecord[] {
  const urls = new Map<string, string>();
  const titles = new Map<string, string>();
  return rows.map((row) => adaptGothNews(row, ctx, urls, titles));
}

export function toImportNews(record: GothNewsRecord): NewsCandidate {
  return {
    id: record.id,
    sourceUrl: record.sourceUrl,
    title: record.title,
    developerId: record.developerCandidateId,
    projectId: record.projectCandidateId,
    capturedAt: record.capturedAt,
    freshnessDays: record.freshnessDays,
    evidence: record.evidence,
    provenance: record.provenance,
  };
}
