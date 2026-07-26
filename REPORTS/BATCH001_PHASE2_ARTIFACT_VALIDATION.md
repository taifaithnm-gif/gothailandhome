# Batch001 Phase2 Artifact — Validation

**Milestone:** `BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT`  
**Result:** `PASS`

## Scorecard

| Check | Result |
| --- | --- |
| SOURCE_BATCH_SEALED_DIGEST | VERIFIED |
| SOURCE_BATCH_FILES_UNCHANGED | PASS |
| V1_COMMIT_PAYLOAD | VALID_BUT_PHASE2_INCOMPATIBLE |
| V1_PAYLOAD_PRESERVED | YES |
| PHASE2_RPC_COMPATIBILITY | PASS (offline contract validator; **no live RPC**) |
| REFERENCE_INTEGRITY | PASS |
| IDEMPOTENCY_KEYS | PASS (unique across entity rows) |
| DETERMINISTIC_BUILD | PASS (run1 hash == run2 hash) |
| UNKNOWN_DEVELOPERS_PRESERVED | 5 |
| PROJECT_36936 | PRESENT |
| PROJECT_36936_REVIEW_INTENT | PASS (`REVIEW_REQUIRED` + conflict row) |
| APPROVALS | 0 |
| PUBLISHED | 0 |
| STORAGE_OBJECT_IDS | 0 |
| Ready-for-approval | 14 (**derived** from `ready-for-approval.json`; not persisted as Approved) |

## Fail-closed gates exercised in tests

- counts ≠ array length → FAIL
- missing entity array → FAIL
- duplicate source / candidate id → FAIL
- unresolved developer/project foreign ref → FAIL
- Phase2 “counts > 0 but array missing” contract → covered

## Status semantics note

When an upstream gate blocks a step, downstream steps are reported as `NOT_RUN` / `SKIPPED` / `NOT_VERIFIED` — not `FAIL`. Real cryptographic or schema failures remain `FAIL`.

This milestone: Controlled Commit / Rollback = `NOT_EXECUTED` (by design). Database count match after commit = `NOT_RUN`.
