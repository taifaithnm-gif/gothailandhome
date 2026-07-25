/**
 * Staging Import Framework V1 — typed errors.
 */

export class StagingImportError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StagingImportError";
    this.code = code;
    this.details = details;
  }
}

export class ContractValidationError extends StagingImportError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONTRACT_INVALID", message, details);
    this.name = "ContractValidationError";
  }
}

export class BatchLoadError extends StagingImportError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("BATCH_LOAD_FAILED", message, details);
    this.name = "BatchLoadError";
  }
}

export class IllegalStateTransitionError extends StagingImportError {
  constructor(from: string, to: string) {
    super(
      "GTH_REVIEW_ILLEGAL_STATE_TRANSITION",
      `Illegal review transition: ${from} → ${to}`,
      { from, to },
    );
    this.name = "IllegalStateTransitionError";
  }
}

/** Architecture Freeze alias — prefer this name in new code. */
export class InvalidReviewStateTransitionError extends IllegalStateTransitionError {
  constructor(from: string, to: string) {
    super(from, to);
    this.name = "InvalidReviewStateTransitionError";
  }
}

export class ForbiddenAutomationStateError extends StagingImportError {
  constructor(state: string) {
    super(
      "FORBIDDEN_AUTOMATION_STATE",
      `Automation may not enter state: ${state}`,
      { state },
    );
    this.name = "ForbiddenAutomationStateError";
  }
}

export class CommitNotImplementedError extends StagingImportError {
  constructor() {
    super(
      "COMMIT_NOT_IMPLEMENTED",
      "Import commit is intentionally absent in Staging Import Framework V1",
    );
    this.name = "CommitNotImplementedError";
  }
}

export class ApprovalBlockedError extends StagingImportError {
  constructor(message = "True approval is forbidden in V1 dry-run") {
    super("APPROVAL_BLOCKED", message);
    this.name = "ApprovalBlockedError";
  }
}

export class StorageUploadBlockedError extends StagingImportError {
  constructor() {
    super(
      "STORAGE_UPLOAD_BLOCKED",
      "Storage uploads are forbidden in Staging Import Framework V1",
    );
    this.name = "StorageUploadBlockedError";
  }
}
