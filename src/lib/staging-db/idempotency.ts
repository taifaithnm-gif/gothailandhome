/**
 * Stable idempotency keys for staging commit plans.
 * Composition: source_batch_id + entity_type + source_record_id + content_hash
 * Never uses timestamps.
 */

import { createHash } from "node:crypto";

import type { IdempotencyDecision } from "./types.ts";
import { stableStringify } from "./environment-guard.ts";

export type IdempotencyKeyParts = {
  sourceBatchId: string;
  entityType: string;
  sourceRecordId: string;
  contentHash: string;
};

export function normalizeHexHash(value: string): string {
  return value.trim().toLowerCase();
}

export function computeContentHash(payload: unknown): string {
  return createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex");
}

export function buildIdempotencyKey(parts: IdempotencyKeyParts): string {
  const material = [
    parts.sourceBatchId.trim(),
    parts.entityType.trim().toLowerCase(),
    parts.sourceRecordId.trim(),
    normalizeHexHash(parts.contentHash),
  ].join("|");
  return createHash("sha256").update(material).digest("hex");
}

export type ExistingRecordFingerprint = {
  sourceBatchId: string;
  entityType: string;
  sourceRecordId: string;
  contentHash: string;
  idempotencyKey: string;
};

export type IdempotencyEvaluateInput = {
  sourceBatchId: string;
  entityType: string;
  sourceRecordId: string;
  contentHash: string;
  /** Same batch prior record, if any. */
  existingSameBatch?: ExistingRecordFingerprint | null;
  /** Cross-batch match by source URL + hash, if any. */
  crossBatchSameUrlHash?: boolean;
  /** Cross-batch same source_record_id (must not overwrite). */
  crossBatchSameSourceRecordId?: boolean;
};

export type IdempotencyEvaluateResult = {
  idempotency_key: string;
  decision: IdempotencyDecision;
  reason: string;
};

export function evaluateIdempotency(
  input: IdempotencyEvaluateInput,
): IdempotencyEvaluateResult {
  const contentHash = normalizeHexHash(input.contentHash);
  const idempotency_key = buildIdempotencyKey({
    sourceBatchId: input.sourceBatchId,
    entityType: input.entityType,
    sourceRecordId: input.sourceRecordId,
    contentHash,
  });

  if (input.existingSameBatch) {
    const existingHash = normalizeHexHash(input.existingSameBatch.contentHash);
    if (existingHash === contentHash) {
      return {
        idempotency_key,
        decision: "WOULD_SKIP_DUPLICATE",
        reason: "same batch + same record + same content hash",
      };
    }
    return {
      idempotency_key,
      decision: "WOULD_UPDATE",
      reason: "same batch + same record + different content hash",
    };
  }

  if (input.crossBatchSameSourceRecordId) {
    return {
      idempotency_key,
      decision: "CONFLICT",
      reason:
        "different batch with same source_record_id — must not overwrite",
    };
  }

  if (input.crossBatchSameUrlHash) {
    return {
      idempotency_key,
      decision: "DUPLICATE_CANDIDATE",
      reason: "different batch with same source URL and hash",
    };
  }

  return {
    idempotency_key,
    decision: "WOULD_INSERT",
    reason: "no prior fingerprint",
  };
}

export type IdempotencySummary = {
  wouldInsert: number;
  wouldSkip: number;
  wouldUpdate: number;
  conflicts: number;
  duplicateCandidates: number;
  keys: string[];
};

export function summarizeIdempotency(
  results: IdempotencyEvaluateResult[],
): IdempotencySummary {
  const summary: IdempotencySummary = {
    wouldInsert: 0,
    wouldSkip: 0,
    wouldUpdate: 0,
    conflicts: 0,
    duplicateCandidates: 0,
    keys: [],
  };
  for (const r of results) {
    summary.keys.push(r.idempotency_key);
    switch (r.decision) {
      case "WOULD_INSERT":
        summary.wouldInsert += 1;
        break;
      case "WOULD_SKIP_DUPLICATE":
        summary.wouldSkip += 1;
        break;
      case "WOULD_UPDATE":
        summary.wouldUpdate += 1;
        break;
      case "CONFLICT":
        summary.conflicts += 1;
        break;
      case "DUPLICATE_CANDIDATE":
        summary.duplicateCandidates += 1;
        break;
      default: {
        const _exhaustive: never = r.decision;
        void _exhaustive;
      }
    }
  }
  summary.keys.sort();
  return summary;
}
