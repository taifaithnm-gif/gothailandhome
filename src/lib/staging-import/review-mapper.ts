/**
 * Map entity import results → review queue rows / states.
 */

import type {
  EntityPreviewRow,
  EntityType,
  PreviewAction,
  ReviewState,
} from "./types.ts";

export type ReviewQueueItem = {
  entityType: EntityType;
  entityId: string;
  reviewState: ReviewState;
  action: PreviewAction;
  priority: "high" | "medium" | "low";
  reasons: string[];
  queue: "review" | "duplicate" | "conflict" | "ready" | "reject" | "quarantine";
};

function priorityFor(action: PreviewAction, state: ReviewState): ReviewQueueItem["priority"] {
  if (action === "WOULD_REJECT" || state === "CONFLICT") return "high";
  if (
    action === "WOULD_REVIEW" ||
    action === "WOULD_DUPLICATE" ||
    action === "WOULD_SKIP_DUPLICATE" ||
    action === "WOULD_QUARANTINE"
  ) {
    return "medium";
  }
  return "low";
}

function queueFor(
  action: PreviewAction,
  state: ReviewState,
): ReviewQueueItem["queue"] {
  if (action === "WOULD_REJECT") return "reject";
  if (action === "WOULD_QUARANTINE") return "quarantine";
  if (
    action === "WOULD_DUPLICATE" ||
    action === "WOULD_SKIP_DUPLICATE" ||
    state === "DUPLICATE"
  ) {
    return "duplicate";
  }
  if (state === "CONFLICT") return "conflict";
  if (state === "READY_FOR_APPROVAL") return "ready";
  return "review";
}

export function mapToReviewQueue(rows: EntityPreviewRow[]): ReviewQueueItem[] {
  return rows.map((row) => ({
    entityType: row.entityType,
    entityId: row.entityId,
    reviewState: row.reviewState,
    action: row.action,
    priority: priorityFor(row.action, row.reviewState),
    reasons: row.reasons,
    queue: queueFor(row.action, row.reviewState),
  }));
}

export function summarizeReviewQueue(items: ReviewQueueItem[]): Record<
  ReviewQueueItem["queue"],
  number
> {
  const out: Record<ReviewQueueItem["queue"], number> = {
    review: 0,
    duplicate: 0,
    conflict: 0,
    ready: 0,
    reject: 0,
    quarantine: 0,
  };
  for (const item of items) out[item.queue] += 1;
  return out;
}
