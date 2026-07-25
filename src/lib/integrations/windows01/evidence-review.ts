import type {
  EvidenceReviewCard,
  EvidenceReviewStatus,
  Windows01RecordV0,
  Windows01ReviewState,
} from "./types.ts";
import {
  assertEvidenceTransition,
  canEvidenceTransition,
  initialEvidenceReviewStatus,
} from "./review-state.ts";

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t || null;
}

function fromPayloadOrHints(
  record: Windows01RecordV0,
  keys: string[],
): string | null {
  for (const key of keys) {
    const fromPayload = str(record.payload[key]);
    if (fromPayload) return fromPayload;
    const fromHint = record.entityHints ? str(record.entityHints[key]) : null;
    if (fromHint) return fromHint;
  }
  return null;
}

/**
 * Build an evidence review card for human review UI / preview.
 * Always starts at NEW — never auto-approved.
 */
export function buildEvidenceReviewCard(
  record: Windows01RecordV0,
  pipelineState: Windows01ReviewState,
  reviewStatus: EvidenceReviewStatus = initialEvidenceReviewStatus(),
): EvidenceReviewCard {
  return {
    recordId: record.recordId,
    developer: fromPayloadOrHints(record, [
      "developer",
      "developer_name",
      "developerName",
    ]),
    project: fromPayloadOrHints(record, [
      "project",
      "project_name",
      "projectName",
    ]),
    province: fromPayloadOrHints(record, ["province", "province_name"]),
    sourceUrl: record.sourceUrl ?? null,
    evidence: [...record.evidenceRefs],
    image: record.evidence?.image ?? null,
    pdf: record.evidence?.pdf ?? null,
    news: record.evidence?.news ?? record.evidence?.newsUrl ?? null,
    hash: record.contentHash,
    imageHash: record.evidence?.imageHash ?? null,
    pdfHash: record.evidence?.pdfHash ?? null,
    newsUrl: record.evidence?.newsUrl ?? null,
    reviewStatus,
    pipelineState,
    timestamp: record.timestamp,
  };
}

/**
 * Human-only evidence status transition.
 * Adapter dry-run must never call this with APPROVED.
 */
export function transitionEvidenceReview(
  card: EvidenceReviewCard,
  to: EvidenceReviewStatus,
  actor: "human" | "system",
): EvidenceReviewCard {
  if (actor !== "human" && (to === "APPROVED" || to === "IMPORT_READY" || to === "IMPORTED")) {
    throw new Error(
      `System/automation must not set evidence status ${to} (no auto-approve)`,
    );
  }
  assertEvidenceTransition(card.reviewStatus, to);
  return { ...card, reviewStatus: to };
}

export function isAutoApproveForbidden(
  from: EvidenceReviewStatus,
  to: EvidenceReviewStatus,
  actor: "human" | "system",
): boolean {
  if (actor === "human") return false;
  if (to === "APPROVED" || to === "IMPORT_READY" || to === "IMPORTED") return true;
  return !canEvidenceTransition(from, to);
}
