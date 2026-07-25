/**
 * Staging DB Commit Design V1 — typed errors with stable error codes.
 */

export class StagingDbError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StagingDbError";
    this.code = code;
    this.details = details;
  }
}

export class ProductionWriteBlockedError extends StagingDbError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super(
      "PRODUCTION_WRITE_BLOCKED",
      `Production write blocked: ${reason}`,
      details,
    );
    this.name = "ProductionWriteBlockedError";
  }
}

export class StagingCommitDisabledError extends StagingDbError {
  constructor(
    message = "STAGING_COMMIT_DISABLED — real staging commit is not enabled in this milestone",
  ) {
    super("STAGING_COMMIT_DISABLED", message);
    this.name = "StagingCommitDisabledError";
  }
}

export class StagingEnvironmentBlockedError extends StagingDbError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super(
      "STAGING_ENVIRONMENT_BLOCKED",
      `Staging write environment blocked: ${reason}`,
      details,
    );
    this.name = "StagingEnvironmentBlockedError";
  }
}

export class InvalidReviewStateError extends StagingDbError {
  constructor(state: string) {
    super(
      "INVALID_REVIEW_STATE",
      `Review state not allowed in staging commit plan: ${state}`,
      { state },
    );
    this.name = "InvalidReviewStateError";
  }
}

export class InvalidSessionStatusError extends StagingDbError {
  constructor(status: string) {
    super(
      "INVALID_SESSION_STATUS",
      `Import session status not allowed in simulation: ${status}`,
      { status },
    );
    this.name = "InvalidSessionStatusError";
  }
}

export class IdempotencyConflictError extends StagingDbError {
  constructor(key: string, details?: Record<string, unknown>) {
    super(
      "IDEMPOTENCY_CONFLICT",
      `Idempotency conflict for key: ${key}`,
      { key, ...details },
    );
    this.name = "IdempotencyConflictError";
  }
}

export class PathTraversalBlockedError extends StagingDbError {
  constructor(pathValue: string) {
    super(
      "PATH_TRAVERSAL_BLOCKED",
      `Unsafe path rejected: ${pathValue}`,
      { path: pathValue },
    );
    this.name = "PathTraversalBlockedError";
  }
}

export class TransactionFailedError extends StagingDbError {
  constructor(phase: string, cause: string) {
    super(
      "TRANSACTION_FAILED",
      `Simulated transaction failed at phase ${phase}: ${cause}`,
      { phase, cause },
    );
    this.name = "TransactionFailedError";
  }
}

export class SchemaValidationError extends StagingDbError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("SCHEMA_VALIDATION_FAILED", message, details);
    this.name = "SchemaValidationError";
  }
}
