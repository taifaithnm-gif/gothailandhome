/**
 * Approval Engine — candidates only.
 * V1 never truly approves. Ceiling: READY_FOR_APPROVAL.
 */

import { ApprovalBlockedError } from "./errors.ts";
import type { ReviewQueueItem } from "./review-mapper.ts";
import type { ApprovalCandidate, EntityPreviewRow } from "./types.ts";

export function buildApprovalCandidates(
  rows: EntityPreviewRow[],
): ApprovalCandidate[] {
  return rows.map((row) => {
    let kind: ApprovalCandidate["kind"] = "review";
    if (
      row.action === "WOULD_SKIP_DUPLICATE" ||
      row.action === "WOULD_DUPLICATE" ||
      row.reviewState === "DUPLICATE"
    ) {
      kind = "duplicate";
    } else if (row.action === "WOULD_REJECT") {
      kind = "reject";
    } else if (row.action === "WOULD_QUARANTINE") {
      kind = "quarantine";
    } else if (row.reviewState === "READY_FOR_APPROVAL") {
      kind = "approval";
    } else {
      kind = "review";
    }
    return {
      kind,
      entityType: row.entityType,
      entityId: row.entityId,
      reviewState: row.reviewState,
      reasons: row.reasons,
      approved: false,
    };
  });
}

export function buildApprovalCandidatesFromQueue(
  items: ReviewQueueItem[],
): ApprovalCandidate[] {
  return buildApprovalCandidates(
    items.map((i) => ({
      entityType: i.entityType,
      entityId: i.entityId,
      action: i.action,
      reviewState: i.reviewState,
      reasons: i.reasons,
    })),
  );
}

/** Explicitly blocked — no true approval in V1. */
export function approveCandidate(candidate: ApprovalCandidate): never {
  void candidate;
  throw new ApprovalBlockedError();
}

export function summarizeApprovalCandidates(candidates: ApprovalCandidate[]): Record<
  ApprovalCandidate["kind"],
  number
> {
  const out: Record<ApprovalCandidate["kind"], number> = {
    approval: 0,
    review: 0,
    reject: 0,
    quarantine: 0,
    duplicate: 0,
  };
  for (const c of candidates) out[c.kind] += 1;
  return out;
}
