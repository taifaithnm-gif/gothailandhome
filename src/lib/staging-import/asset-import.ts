/**
 * Image (asset) import — hash, project link, mock storage path, mime, duplicate.
 * Never uploads to Storage.
 */

import {
  initialReviewState,
  transitionAutomation,
} from "./approval-state.ts";
import type { DuplicateEngine } from "./duplicate-check.ts";
import { StorageUploadBlockedError } from "./errors.ts";
import type {
  EntityPreviewRow,
  ImageCandidate,
  PreviewAction,
  ReviewState,
  ValidationIssue,
} from "./types.ts";

export type ImageImportResult = {
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  issues: ValidationIssue[];
  storagePathMock: string | null;
  approved: false;
};

const HASH_RE = /^[a-f0-9]{64}$/i;

export function importImagePreview(
  candidate: ImageCandidate,
  options?: {
    knownProjectIds?: Set<string>;
    duplicateEngine?: DuplicateEngine;
  },
): ImageImportResult {
  const issues: ValidationIssue[] = [];
  let state: ReviewState = initialReviewState();

  if (!candidate.id) {
    issues.push({
      code: "IMAGE_MISSING_ID",
      severity: "error",
      entityType: "image",
      message: "Image id required",
    });
  }
  if (!candidate.hash || !HASH_RE.test(candidate.hash)) {
    issues.push({
      code: "IMAGE_HASH_INVALID",
      severity: "error",
      entityType: "image",
      entityId: candidate.id,
      message: "Image hash must be 64-char hex sha256",
      field: "hash",
    });
  }
  if (
    candidate.projectId &&
    options?.knownProjectIds &&
    !options.knownProjectIds.has(candidate.projectId)
  ) {
    issues.push({
      code: "IMAGE_PROJECT_UNLINKED",
      severity: "warning",
      entityType: "image",
      entityId: candidate.id,
      message: `Project ${candidate.projectId} not known`,
      field: "projectId",
    });
  }
  if (candidate.mime && !candidate.mime.startsWith("image/")) {
    issues.push({
      code: "IMAGE_MIME_INVALID",
      severity: "error",
      entityType: "image",
      entityId: candidate.id,
      message: `Unexpected mime: ${candidate.mime}`,
      field: "mime",
    });
  }

  const storagePathMock =
    candidate.storagePathMock ??
    (candidate.id ? `mock/storage/images/${candidate.id}` : null);

  state = transitionAutomation(state, "VALIDATED");
  const dupHits = options?.duplicateEngine?.checkImage(candidate) ?? [];
  const hasErrors = issues.some((i) => i.severity === "error");

  let action: PreviewAction;
  if (dupHits.length > 0) {
    state = transitionAutomation(state, "DUPLICATE");
    action = "WOULD_SKIP_DUPLICATE";
  } else if (hasErrors) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REJECT";
  } else if (issues.length > 0) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REVIEW";
  } else {
    state = transitionAutomation(state, "READY_FOR_APPROVAL");
    action = "WOULD_CREATE";
  }

  return {
    entityId: candidate.id,
    action,
    reviewState: state,
    issues,
    storagePathMock,
    approved: false,
  };
}

export function toImagePreviewRow(result: ImageImportResult): EntityPreviewRow {
  return {
    entityType: "image",
    entityId: result.entityId,
    action: result.action,
    reviewState: result.reviewState,
    reasons: result.issues.map((i) => i.code),
  };
}

export function uploadImageToStorage(): never {
  throw new StorageUploadBlockedError();
}
