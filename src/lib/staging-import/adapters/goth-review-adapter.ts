/**
 * Review queue adapter — maps Windows01 review items → site review SM.
 * Automation ceiling: READY_FOR_APPROVAL. Never APPROVED / PUBLISHED.
 */

import { createHash } from "node:crypto";

import type {
  GothDeveloperRecord,
  GothImageRecord,
  GothMappedReviewState,
  GothNewsRecord,
  GothPdfRecord,
  GothProjectRecord,
  GothReviewCandidate,
} from "./goth-types.ts";
import { FORBIDDEN_GOTH_AUTOMATION_STATES } from "./goth-types.ts";

export function mapWindows01ReasonToReview(reason: string | undefined): {
  reviewState: GothMappedReviewState;
  mappedReason: string;
  severity: "low" | "medium" | "high";
  suggestedAction: string;
  blocking: boolean;
} {
  const r = (reason ?? "UNKNOWN").toUpperCase();
  if (r.includes("DUPLICATE")) {
    return {
      reviewState: "DUPLICATE",
      mappedReason: "DUPLICATE_CANDIDATE",
      severity: "medium",
      suggestedAction: "COMPARE_AND_DECIDE",
      blocking: false,
    };
  }
  if (r.includes("CONFLICT") || r.includes("NAME_CONFLICT")) {
    return {
      reviewState: "CONFLICT",
      mappedReason: "CONFLICT",
      severity: "high",
      suggestedAction: "RESOLVE_CONFLICT",
      blocking: true,
    };
  }
  if (
    r.includes("REJECT") ||
    r.includes("MALICIOUS") ||
    r.includes("FORBIDDEN")
  ) {
    return {
      reviewState: "REJECTED",
      mappedReason: "REJECTED",
      severity: "high",
      suggestedAction: "CONFIRM_REJECT",
      blocking: true,
    };
  }
  if (r.includes("QUARANTINE") || r.includes("SAFETY")) {
    return {
      reviewState: "QUARANTINED",
      mappedReason: "QUARANTINED",
      severity: "high",
      suggestedAction: "TRIAGE_QUARANTINE",
      blocking: true,
    };
  }
  if (
    r.includes("LOW_CONFIDENCE") ||
    r.includes("REVIEW") ||
    r.includes("FAILED") ||
    r.includes("UNKNOWN") ||
    r.includes("FETCH_FAILED")
  ) {
    return {
      reviewState: "REVIEW_REQUIRED",
      mappedReason: "REVIEW_REQUIRED",
      severity: "medium",
      suggestedAction: "HUMAN_REVIEW",
      blocking: true,
    };
  }
  return {
    reviewState: "RECEIVED",
    mappedReason: "RECEIVED",
    severity: "low",
    suggestedAction: "VALIDATE",
    blocking: false,
  };
}

function candidateId(parts: string[]): string {
  return `rc-${createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16)}`;
}

export function adaptGothReviewItem(
  raw: Record<string, unknown>,
  index: number,
  createdAt: string,
): GothReviewCandidate {
  const reason = String(raw.reason ?? "UNKNOWN");
  const mapped = mapWindows01ReasonToReview(reason);
  const entityId = String(
    raw.project_id ?? raw.image_id ?? raw.source_url ?? `review-${index}`,
  );
  return {
    candidateId: candidateId([reason, entityId, String(index)]),
    entityType: "review_item",
    entityId,
    sourceReason: reason,
    mappedReason: mapped.mappedReason,
    severity: mapped.severity,
    evidence: [
      {
        kind: "other",
        url: raw.source_url != null ? String(raw.source_url) : undefined,
      },
    ],
    suggestedAction: mapped.suggestedAction,
    blocking: mapped.blocking,
    reviewerNotes: "",
    createdAt,
    reviewState: mapped.reviewState,
    approved: false,
    published: false,
  };
}

export function adaptGothReviewItems(
  rows: Record<string, unknown>[],
  createdAt = new Date().toISOString(),
): GothReviewCandidate[] {
  return rows.map((row, i) => adaptGothReviewItem(row, i, createdAt));
}

/** Enrich review queue with entity-derived candidates (never APPROVED+). */
export function buildEntityReviewCandidates(options: {
  developers: GothDeveloperRecord[];
  projects: GothProjectRecord[];
  images: GothImageRecord[];
  pdfs: GothPdfRecord[];
  news: GothNewsRecord[];
  createdAt?: string;
}): GothReviewCandidate[] {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const out: GothReviewCandidate[] = [];

  for (const d of options.developers) {
    if (d.reviewState === "READY_FOR_APPROVAL") continue;
    out.push({
      candidateId: candidateId(["developer", d.id, d.reviewState]),
      entityType: "developer",
      entityId: d.id,
      sourceReason: d.identityStatus === "UNKNOWN" ? "UNKNOWN_DEVELOPER" : d.reviewState,
      mappedReason: d.reviewState,
      severity: d.identityStatus === "UNKNOWN" ? "high" : "medium",
      evidence: d.evidence,
      suggestedAction: "HUMAN_REVIEW",
      blocking: true,
      reviewerNotes: "",
      createdAt,
      reviewState: d.reviewState,
      approved: false,
      published: false,
    });
  }

  for (const p of options.projects) {
    if (p.reviewState === "READY_FOR_APPROVAL") continue;
    out.push({
      candidateId: candidateId(["project", p.id, p.reviewState]),
      entityType: "project",
      entityId: p.id,
      sourceReason: p.provinceConflict
        ? "PROVINCE_CONFLICT"
        : p.provinceConfidence === "LOW"
          ? "PROVINCE_LOW_CONFIDENCE"
          : p.developerIdentityStatus === "UNKNOWN"
            ? "UNKNOWN_DEVELOPER"
            : p.reviewState,
      mappedReason: p.reviewState,
      severity: p.provinceConflict ? "high" : "medium",
      evidence: p.evidence,
      suggestedAction: p.provinceConflict ? "RESOLVE_CONFLICT" : "HUMAN_REVIEW",
      blocking: true,
      reviewerNotes: "",
      createdAt,
      reviewState: p.reviewState,
      approved: false,
      published: false,
    });
  }

  for (const img of options.images) {
    if (img.decision === "ACCEPT_CANDIDATE") continue;
    const state: GothMappedReviewState =
      img.decision === "DUPLICATE_CANDIDATE"
        ? "DUPLICATE"
        : img.decision === "REJECTED"
          ? "REJECTED"
          : img.decision === "QUARANTINED"
            ? "QUARANTINED"
            : "REVIEW_REQUIRED";
    out.push({
      candidateId: candidateId(["image", img.id, state]),
      entityType: "image",
      entityId: img.id,
      sourceReason: img.issues.join(",") || img.decision,
      mappedReason: state,
      severity: state === "REJECTED" || state === "QUARANTINED" ? "high" : "medium",
      evidence: img.evidence,
      suggestedAction: "VIEW_EVIDENCE",
      blocking: state !== "DUPLICATE",
      reviewerNotes: "",
      createdAt,
      reviewState: state,
      approved: false,
      published: false,
    });
  }

  for (const pdf of options.pdfs) {
    if (pdf.decision === "ACCEPT_CANDIDATE") continue;
    const state: GothMappedReviewState =
      pdf.decision === "DUPLICATE_CANDIDATE"
        ? "DUPLICATE"
        : pdf.decision === "REJECTED"
          ? "REJECTED"
          : "REVIEW_REQUIRED";
    out.push({
      candidateId: candidateId(["pdf", pdf.id, state]),
      entityType: "pdf",
      entityId: pdf.id,
      sourceReason: pdf.issues.join(",") || pdf.decision,
      mappedReason: state,
      severity: state === "REJECTED" ? "high" : "medium",
      evidence: pdf.evidence,
      suggestedAction: "VIEW_SOURCE_METADATA",
      blocking: state !== "DUPLICATE",
      reviewerNotes: "",
      createdAt,
      reviewState: state,
      approved: false,
      published: false,
    });
  }

  for (const n of options.news) {
    if (n.reviewState === "READY_FOR_APPROVAL") continue;
    out.push({
      candidateId: candidateId(["news", n.id, n.reviewState]),
      entityType: "news",
      entityId: n.id,
      sourceReason: n.duplicateUrl
        ? "DUPLICATE_URL"
        : n.duplicateTitle
          ? "DUPLICATE_TITLE"
          : n.freshness === "stale"
            ? "STALE_NEWS"
            : !n.publishedAt
              ? "MISSING_PUBLISHED_DATE"
              : n.reviewState,
      mappedReason: n.reviewState,
      severity: n.reviewState === "REJECTED" ? "high" : "medium",
      evidence: n.evidence,
      suggestedAction: "HUMAN_REVIEW",
      blocking: n.reviewState !== "DUPLICATE",
      reviewerNotes: "",
      createdAt,
      reviewState: n.reviewState,
      approved: false,
      published: false,
    });
  }

  for (const c of out) {
    if (
      (FORBIDDEN_GOTH_AUTOMATION_STATES as readonly string[]).includes(
        c.reviewState,
      )
    ) {
      throw new Error(`AUTOMATION_CEILING_VIOLATION: ${c.reviewState}`);
    }
    if (c.approved || c.published) {
      throw new Error("APPROVE_OR_PUBLISH_BLOCKED");
    }
  }

  return out;
}

export function assertAutomationCeiling(
  state: string,
): asserts state is GothMappedReviewState {
  if (
    (FORBIDDEN_GOTH_AUTOMATION_STATES as readonly string[]).includes(state)
  ) {
    throw new Error(`Forbidden automation state: ${state}`);
  }
}
