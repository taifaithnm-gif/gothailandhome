# Error Code Catalog (Architecture Freeze V1)

| Code | Error | Layer |
| --- | --- | --- |
| GTH_REVIEW_ILLEGAL_STATE_TRANSITION | InvalidReviewStateTransitionError | Import |
| FORBIDDEN_AUTOMATION_STATE | ForbiddenAutomationStateError | Import |
| COMMIT_NOT_IMPLEMENTED | CommitNotImplementedError | Import |
| STAGING_COMMIT_DISABLED | StagingCommitDisabledError | Staging DB |
| PRODUCTION_WRITE_BLOCKED | ProductionWriteBlockedError | Staging DB |
| STAGING_ENVIRONMENT_BLOCKED | StagingEnvironmentBlockedError | Staging DB |
| PATH_TRAVERSAL_BLOCKED | PathTraversalBlockedError | Staging DB |
| STORAGE_UPLOAD_BLOCKED | StorageUploadBlockedError | Import |
| CONTRACT_INVALID | ContractValidationError | Import |
| IDEMPOTENCY_CONFLICT | IdempotencyConflictError | Staging DB |

Errors must expose `name`, `code`, `message`, optional `details`/`context`. Never embed secrets or absolute local paths in user-facing output.
