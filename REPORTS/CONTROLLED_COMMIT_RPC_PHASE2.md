# CONTROLLED_COMMIT_RPC_PHASE2

**Date:** 2026-07-26T05:37:51.335Z  
**Milestone:** CONTROLLED_COMMIT_RPC_PHASE2  
**OVERALL:** PASS

## Scorecard

```
OVERALL: PASS
MILESTONE: CONTROLLED_COMMIT_RPC_PHASE2
SESSION_INSERT: PASS
DEVELOPER_INSERT: PASS
PROJECT_INSERT: PASS
ASSET_INSERT: PASS
PDF_INSERT: PASS
NEWS_INSERT: PASS
REVIEWITEM_INSERT: PASS
CONFLICT_INSERT: PASS
AUDIT_INSERT: PASS
TRANSACTION: PASS
ROLLBACK_TEST: PASS
IDEMPOTENCY: PASS
RLS: PASS
TYPECHECK: PASS
LINT: PASS
BUILD: PASS
TESTS: 146 staging-db-implementation + 93 staging-db-design + controlled-commit-integration PASS
```

## Implementation

| Item | Approach |
| --- | --- |
| Function | `commit_staging_import_v1` CREATE OR REPLACE |
| SQL artifact | `database/staging-rpc/commit_staging_import_v1_phase2.sql` |
| Frozen migrations 001–009 | **unchanged** (checksum-safe) |
| Apply | `npm run staging:db:apply-commit-rpc-phase2 -- --confirm-staging` |
| Integration test | `npm run test:controlled-commit-integration -- --confirm-staging` |
| Batch001 | **NOT re-run** |

Atomic order inside RPC: Session → Developer → Project → Asset → PDF → News → ReviewItem → Duplicate → Conflict → Audit. Any failure aborts the whole Postgres function transaction.

## PAYLOAD_COUNTS vs DATABASE_COUNTS

Synthetic session `sess_phase2_bee24e5c` / `BATCH-PHASE2-bee24e5c` (authoritative SELECT COUNT(*)).

### Developers

Payload: 2

Actual DB: 2

一致: PASS

### Projects

Payload: 2

Actual DB: 2

一致: PASS

### Assets

Payload: 1

Actual DB: 1

一致: PASS

### PDFs

Payload: 1

Actual DB: 1

一致: PASS

### News

Payload: 1

Actual DB: 1

一致: PASS

### ReviewItems

Payload: 2

Actual DB: 2

一致: PASS

### Conflicts

Payload: 1

Actual DB: 1

一致: PASS

### Sessions

Payload: 1

Actual DB: 1

一致: PASS

### Audit

Payload: 1

Actual DB: 1

一致: PASS

## Gate checks

| Check | Result |
| --- | --- |
| Project 36936 `review_state` | REVIEW_REQUIRED |
| UNKNOWN developer / no auto-link | PASS |
| Asset `storage_status=PLANNED`, no object id | PASS |
| Forbidden `APPROVED` mid-tx → full ROLLBACK | PASS |
| Duplicate session commit blocked | PASS |
| Rollback soft-delete + audit preserved | PASS |
| RLS live | PASS |
| Migration audit | PASS |
| Schema verify | PASS |
| `STAGING_COMMIT_ENABLED` after run | false |

## Safety

| Check | Result |
| --- | --- |
| Migration files 001–009 modified | NO |
| Schema / RLS / Hard Block / Commit Gate modified | NO |
| Batch Adapter / Payload Format / Batch001 data | NO |
| Rollback RPC / Idempotency design | unchanged |
| Production write | NO |
| Storage upload | NO |
| Auto-approve | NO |
| git commit / push / deploy | NOT_EXECUTED |

## Notes

- Applied `commit_staging_import_v1` Phase2 function body via `database/staging-rpc/` (migrations untouched).
- Project 36936 `review_state=REVIEW_REQUIRED` verified.
- UNKNOWN developer preserved; `canonical_developer_id` null (no auto-link).
- Rollback `soft_deleted=7`; audit events preserved.
- RPC return counts are actual insert counters; report still requires DB COUNT verification.
