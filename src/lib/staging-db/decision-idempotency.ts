/**
 * Decision idempotency key helpers — Phase A.
 * Composition: sha256(batch_id | review_item_id | decision_family | decision_action | content_hash)
 * No timestamps. No Apply/Submit business logic.
 */

import { createHash } from "node:crypto";

import { normalizeHexHash } from "./idempotency.ts";

export type DecisionIdempotencyKeyParts = {
  sourceBatchId: string;
  reviewItemId: string;
  decisionFamily: string;
  decisionAction: string;
  contentHash: string;
};

export function buildDecisionIdempotencyKey(
  parts: DecisionIdempotencyKeyParts,
): string {
  const material = [
    parts.sourceBatchId.trim(),
    parts.reviewItemId.trim(),
    parts.decisionFamily.trim(),
    parts.decisionAction.trim(),
    normalizeHexHash(parts.contentHash),
  ].join("|");
  return createHash("sha256").update(material).digest("hex");
}
