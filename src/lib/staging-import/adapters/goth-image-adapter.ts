/**
 * Image adapter — local file checks only. Never uploads Storage.
 */

import fs from "node:fs";
import path from "node:path";

import type { ImageCandidate } from "../types.ts";
import {
  buildProvenance,
  KNOWN_GOTH_IMAGE_FIELDS,
  projectIdFromSourcePage,
  readJpegDimensions,
  safeRelativePath,
  sha256File,
  sniffImageMime,
  unknownFields,
} from "./goth-helpers.ts";
import type {
  GothAdapterContext,
  GothAssetDecision,
  GothImageRecord,
} from "./goth-types.ts";

export function adaptGothImage(
  raw: Record<string, unknown>,
  ctx: GothAdapterContext,
  knownProjectIds: Set<string>,
  seenHashes: Map<string, string>,
): GothImageRecord {
  const imageId = String(raw.image_id ?? "").trim();
  const localRel = safeRelativePath(
    ctx.batchDir,
    raw.local_path != null ? String(raw.local_path) : null,
  );
  const full = localRel ? path.join(ctx.batchDir, localRel) : null;
  const fileExists = Boolean(full && fs.existsSync(full));
  const buf = fileExists && full ? fs.readFileSync(full) : Buffer.alloc(0);
  const mime = fileExists ? sniffImageMime(buf) : null;
  const actualSha = fileExists && full ? sha256File(full) : "";
  const declaredSha = String(raw.sha256 ?? "").toLowerCase();
  const ext = localRel ? path.extname(localRel).toLowerCase() : "";
  const extensionConsistent =
    mime == null
      ? false
      : (mime === "image/jpeg" && (ext === ".jpg" || ext === ".jpeg")) ||
        (mime === "image/png" && ext === ".png") ||
        (mime === "image/webp" && ext === ".webp") ||
        (mime === "image/gif" && ext === ".gif");

  const dims =
    mime === "image/jpeg"
      ? readJpegDimensions(buf)
      : {
          width: raw.width != null ? Number(raw.width) : null,
          height: raw.height != null ? Number(raw.height) : null,
        };

  const pagePid = projectIdFromSourcePage(
    raw.source_page != null ? String(raw.source_page) : null,
  );
  const projectId =
    raw.project_id != null && String(raw.project_id).trim()
      ? String(raw.project_id)
      : null;

  const issues: string[] = [];
  if (!fileExists) issues.push("FILE_MISSING");
  if (actualSha && declaredSha && actualSha !== declaredSha) {
    issues.push("SHA256_MISMATCH");
  }
  if (!mime) issues.push("MIME_UNKNOWN");
  if (mime && !extensionConsistent) issues.push("EXTENSION_MISMATCH");
  if (pagePid && projectId && pagePid !== projectId) {
    issues.push("LINKAGE_MISMATCH");
  }
  if (projectId && !knownProjectIds.has(projectId)) {
    issues.push("PROJECT_UNLINKED");
  }
  if (String(raw.linkage_status ?? "") !== "PASS") {
    issues.push("LINKAGE_NOT_PASS");
  }

  const isTrackingPixel =
    (dims?.width != null &&
      dims?.height != null &&
      dims.width <= 2 &&
      dims.height <= 2) ||
    (fileExists && buf.length > 0 && buf.length < 2048);
  if (isTrackingPixel) issues.push("TRACKING_PIXEL");

  const isPlaceholder =
    Boolean(imageId && /placeholder|spacer|blank/i.test(imageId)) ||
    Boolean(
      raw.source_url &&
        /placeholder|spacer|1x1|pixel/i.test(String(raw.source_url)),
    );
  if (isPlaceholder) issues.push("PLACEHOLDER");

  const isLogoCandidate =
    Boolean(
      raw.source_url && /logo|brand|favicon/i.test(String(raw.source_url)),
    ) ||
    (dims?.width != null &&
      dims?.height != null &&
      dims.width <= 200 &&
      dims.height <= 200 &&
      Math.abs(dims.width - dims.height) < 40);
  if (isLogoCandidate) issues.push("LOGO_CANDIDATE");

  let decision: GothAssetDecision = "ACCEPT_CANDIDATE";
  if (actualSha && seenHashes.has(actualSha)) {
    issues.push("DUPLICATE_HASH");
    decision = "DUPLICATE_CANDIDATE";
  } else if (actualSha) {
    seenHashes.set(actualSha, imageId || localRel || actualSha);
  }

  if (issues.includes("FILE_MISSING") || issues.includes("SHA256_MISMATCH")) {
    decision = "REJECTED";
  } else if (decision === "DUPLICATE_CANDIDATE") {
    // keep duplicate
  } else if (issues.includes("TRACKING_PIXEL") || issues.includes("PLACEHOLDER")) {
    decision = "QUARANTINED";
  } else if (issues.length > 0) {
    decision = "REVIEW_REQUIRED";
  }

  const unsupported = unknownFields(raw, KNOWN_GOTH_IMAGE_FIELDS);
  const provenance = buildProvenance({
    sourceRecordId: imageId || localRel || "image-unknown",
    batchId: ctx.batchId,
    jobId: ctx.jobId,
    schemaVersion: ctx.schemaVersion,
    sourceUrl: raw.source_url != null ? String(raw.source_url) : null,
    sourceDomain: raw.source_domain != null ? String(raw.source_domain) : null,
    capturedAt: raw.captured_at != null ? String(raw.captured_at) : null,
    rawPayload: raw,
    unsupportedFields: unsupported,
    reviewReason: issues.join(",") || null,
  });

  const linkageOk =
    fileExists &&
    mime != null &&
    (!pagePid || !projectId || pagePid === projectId) &&
    (!projectId || knownProjectIds.has(projectId));

  return {
    id: imageId || actualSha.slice(0, 20) || `img-${provenance.sourceRecordId}`,
    sourceId: imageId || provenance.sourceRecordId,
    hash: actualSha || declaredSha,
    projectId,
    mime,
    width: dims?.width ?? null,
    height: dims?.height ?? null,
    relativePreviewPath: localRel,
    fileExists,
    extensionConsistent,
    linkageOk,
    isPlaceholder,
    isTrackingPixel,
    isLogoCandidate,
    decision,
    issues,
    evidence: localRel
      ? [{ kind: "image", path: localRel, hash: actualSha || declaredSha, mime: mime ?? undefined }]
      : [],
    rawPayload: raw,
    unsupportedFields: unsupported,
    provenance,
  };
}

export function adaptGothImages(
  rows: Record<string, unknown>[],
  ctx: GothAdapterContext,
  knownProjectIds: Set<string>,
): GothImageRecord[] {
  const seen = new Map<string, string>();
  return rows.map((row) => adaptGothImage(row, ctx, knownProjectIds, seen));
}

export function toImportImage(record: GothImageRecord): ImageCandidate {
  return {
    id: record.id,
    hash: record.hash,
    projectId: record.projectId,
    width: record.width,
    height: record.height,
    mime: record.mime,
    path: record.relativePreviewPath,
    storagePathMock: record.relativePreviewPath
      ? `mock/storage/${record.relativePreviewPath}`
      : null,
    decision: record.decision,
    provenance: record.provenance,
  };
}
