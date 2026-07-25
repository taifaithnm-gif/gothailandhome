import type { EvidenceReviewStatus, Windows01ReviewState } from "./types.ts";

/**
 * Internal pipeline review state machine — worker cannot jump to publish states.
 */
const TRANSITIONS: Record<Windows01ReviewState, readonly Windows01ReviewState[]> = {
  RECEIVED: ["MANIFEST_VALIDATED", "QUARANTINED", "REJECTED"],
  MANIFEST_VALIDATED: ["SCHEMA_VALIDATED", "QUARANTINED", "REJECTED"],
  SCHEMA_VALIDATED: ["SAFETY_CHECKED", "QUARANTINED", "REJECTED"],
  SAFETY_CHECKED: ["DEDUPED", "QUARANTINED", "REJECTED"],
  DEDUPED: ["ENTITY_MATCHED", "CONFLICT_DETECTED", "QUARANTINED", "REJECTED"],
  ENTITY_MATCHED: [
    "CONFLICT_DETECTED",
    "AWAITING_HUMAN_REVIEW",
    "STAGING_IMPORTED",
    "QUARANTINED",
    "REJECTED",
  ],
  CONFLICT_DETECTED: ["AWAITING_HUMAN_REVIEW", "QUARANTINED", "REJECTED"],
  QUARANTINED: ["AWAITING_HUMAN_REVIEW", "REJECTED"],
  AWAITING_HUMAN_REVIEW: [
    "REJECTED",
    "STAGING_IMPORTED",
    "APPROVED_FOR_PUBLISH",
    "QUARANTINED",
  ],
  REJECTED: [],
  STAGING_IMPORTED: ["AWAITING_HUMAN_REVIEW", "APPROVED_FOR_PUBLISH", "REJECTED"],
  APPROVED_FOR_PUBLISH: ["PRODUCTION_PUBLISHED", "REJECTED"],
  PRODUCTION_PUBLISHED: [],
};

export function initialReviewState(): Windows01ReviewState {
  return "RECEIVED";
}

export function canTransition(
  from: Windows01ReviewState,
  to: Windows01ReviewState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: Windows01ReviewState,
  to: Windows01ReviewState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal Windows01 review transition: ${from} → ${to}`);
  }
}

/** Human-only transitions that workers must never invoke. */
export const HUMAN_ONLY_STATES: readonly Windows01ReviewState[] = [
  "APPROVED_FOR_PUBLISH",
  "PRODUCTION_PUBLISHED",
];

/**
 * Human evidence review status machine (directive):
 * NEW → REVIEWING → APPROVED → IMPORT_READY → IMPORTED
 *                 ↘ REJECTED (terminal)
 * APPROVED may also go to REJECTED.
 * Never auto-transition to APPROVED.
 */
const EVIDENCE_TRANSITIONS: Record<
  EvidenceReviewStatus,
  readonly EvidenceReviewStatus[]
> = {
  NEW: ["REVIEWING", "REJECTED"],
  REVIEWING: ["APPROVED", "REJECTED"],
  APPROVED: ["IMPORT_READY", "REJECTED"],
  REJECTED: [],
  IMPORT_READY: ["IMPORTED", "REJECTED"],
  IMPORTED: [],
};

export function initialEvidenceReviewStatus(): EvidenceReviewStatus {
  return "NEW";
}

export function canEvidenceTransition(
  from: EvidenceReviewStatus,
  to: EvidenceReviewStatus,
): boolean {
  return EVIDENCE_TRANSITIONS[from].includes(to);
}

export function assertEvidenceTransition(
  from: EvidenceReviewStatus,
  to: EvidenceReviewStatus,
): void {
  if (!canEvidenceTransition(from, to)) {
    throw new Error(`Illegal evidence review transition: ${from} → ${to}`);
  }
}

/** Adapter/automation must never set these evidence statuses. */
export const HUMAN_ONLY_EVIDENCE_STATUSES: readonly EvidenceReviewStatus[] = [
  "APPROVED",
  "IMPORT_READY",
  "IMPORTED",
];
