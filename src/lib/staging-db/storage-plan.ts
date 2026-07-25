/**
 * Storage upload plan — design only. Never uploads.
 */

import {
  ALLOWED_SIMULATION_STORAGE_STATUSES,
  type StoragePlanItem,
  type StorageStatus,
} from "./types.ts";
import { StagingDbError } from "./errors.ts";
import { buildStorageObjectPath, assertRelativeSafePath } from "./path-safety.ts";
import { normalizeHexHash } from "./idempotency.ts";

export type StoragePlanInput = {
  batchId: string;
  entityType: "asset" | "pdf";
  entityId: string;
  localRelativePath: string | null;
  sha256: string;
  mimeType: string | null;
  fileSize: number | null;
  originalFilename: string | null;
  reviewRequired?: boolean;
  quarantine?: boolean;
  knownDuplicateSha256?: boolean;
};

export function assertSimulationStorageStatus(status: StorageStatus): void {
  if (!ALLOWED_SIMULATION_STORAGE_STATUSES.includes(status)) {
    throw new StagingDbError(
      "INVALID_STORAGE_STATUS",
      `Simulation storage_status must be NOT_PLANNED or PLANNED, got ${status}`,
      { status },
    );
  }
}

export function planStorageItem(input: StoragePlanInput): StoragePlanItem {
  if (!input.localRelativePath) {
    return {
      entity_type: input.entityType,
      entity_id: input.entityId,
      source_local_path: "",
      source_sha256: normalizeHexHash(input.sha256),
      mime_type: input.mimeType,
      file_size: input.fileSize,
      target_bucket_candidate: "staging-assets",
      target_object_path_candidate: "",
      duplicate_object_candidate: null,
      upload_required: false,
      review_required: true,
      storage_action: "WOULD_REVIEW",
    };
  }

  const sourceLocal = assertRelativeSafePath(input.localRelativePath);
  const target = buildStorageObjectPath({
    batchId: input.batchId,
    entityType: input.entityType,
    entityId: input.entityId,
    originalFilename: input.originalFilename ?? sourceLocal,
  });

  if (input.quarantine) {
    return {
      entity_type: input.entityType,
      entity_id: input.entityId,
      source_local_path: sourceLocal,
      source_sha256: normalizeHexHash(input.sha256),
      mime_type: input.mimeType,
      file_size: input.fileSize,
      target_bucket_candidate: "staging-quarantine",
      target_object_path_candidate: target,
      duplicate_object_candidate: null,
      upload_required: false,
      review_required: true,
      storage_action: "WOULD_QUARANTINE",
    };
  }

  if (input.knownDuplicateSha256) {
    return {
      entity_type: input.entityType,
      entity_id: input.entityId,
      source_local_path: sourceLocal,
      source_sha256: normalizeHexHash(input.sha256),
      mime_type: input.mimeType,
      file_size: input.fileSize,
      target_bucket_candidate: "staging-assets",
      target_object_path_candidate: target,
      duplicate_object_candidate: `sha256:${normalizeHexHash(input.sha256)}`,
      upload_required: false,
      review_required: false,
      storage_action: "WOULD_SKIP_DUPLICATE",
    };
  }

  if (input.reviewRequired) {
    return {
      entity_type: input.entityType,
      entity_id: input.entityId,
      source_local_path: sourceLocal,
      source_sha256: normalizeHexHash(input.sha256),
      mime_type: input.mimeType,
      file_size: input.fileSize,
      target_bucket_candidate: "staging-assets",
      target_object_path_candidate: target,
      duplicate_object_candidate: null,
      upload_required: false,
      review_required: true,
      storage_action: "WOULD_REVIEW",
    };
  }

  return {
    entity_type: input.entityType,
    entity_id: input.entityId,
    source_local_path: sourceLocal,
    source_sha256: normalizeHexHash(input.sha256),
    mime_type: input.mimeType,
    file_size: input.fileSize,
    target_bucket_candidate: "staging-assets",
    target_object_path_candidate: target,
    duplicate_object_candidate: null,
    upload_required: true,
    review_required: false,
    storage_action: "WOULD_UPLOAD",
  };
}

export type StoragePlanDocument = {
  status: "SIMULATED_ONLY";
  batchId: string;
  items: StoragePlanItem[];
  counts: {
    wouldUpload: number;
    wouldSkipDuplicate: number;
    wouldQuarantine: number;
    wouldReview: number;
  };
  storage_uploads: 0;
  notes: string[];
};

export function buildStoragePlanDocument(
  batchId: string,
  items: StoragePlanItem[],
): StoragePlanDocument {
  const counts = {
    wouldUpload: 0,
    wouldSkipDuplicate: 0,
    wouldQuarantine: 0,
    wouldReview: 0,
  };
  for (const item of items) {
    switch (item.storage_action) {
      case "WOULD_UPLOAD":
        counts.wouldUpload += 1;
        break;
      case "WOULD_SKIP_DUPLICATE":
        counts.wouldSkipDuplicate += 1;
        break;
      case "WOULD_QUARANTINE":
        counts.wouldQuarantine += 1;
        break;
      case "WOULD_REVIEW":
        counts.wouldReview += 1;
        break;
      default: {
        const _e: never = item.storage_action;
        void _e;
      }
    }
  }
  return {
    status: "SIMULATED_ONLY",
    batchId,
    items: [...items].sort((a, b) =>
      `${a.entity_type}:${a.entity_id}`.localeCompare(
        `${b.entity_type}:${b.entity_id}`,
      ),
    ),
    counts,
    storage_uploads: 0,
    notes: [
      "Storage is decoupled from DB commit",
      "No files are uploaded in Design V1",
      "storage_action vocabulary is WOULD_* only",
    ],
  };
}
