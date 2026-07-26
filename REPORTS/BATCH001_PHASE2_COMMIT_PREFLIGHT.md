# Batch001 Phase2 Commit Preflight

**Milestone:** `ROLLBACK_EMPTY_BATCH001_SESSION_AND_RECOMMIT_PHASE2`  
**Result:** `FAIL`

## Passed gates

| Gate | Result |
| --- | --- |
| `ENV_CHECK` | PASS (`STAGING_ENV_OK`) |
| `DATABASE_CONNECTION_MODE` | `SESSION_POOLER` |
| `PRODUCTION_HARD_BLOCK` | PASS (`CLEAR`) |
| Probe | PASS (`STAGING_PROBE_PASS`) |
| `SCHEMA_VERIFY` | PASS |
| `RLS_LIVE_VALIDATION` | PASS |
| `MIGRATION_AUDIT` | PASS (9 files, 0 errors) |
| `MIGRATION_HISTORY` | PASS (001–009 present, checksums match) |
| Phase2 RPC deployed | PASS (deployed function body hash == `database/staging-rpc/commit_staging_import_v1_phase2.sql`, `521ecddc2a61…`) |
| Entity insert SQL in DB function | PASS (developers/projects/assets/pdfs/news/review_items/conflicts) |
| Sealed digest pinned | VERIFIED (`d709a72c2ff8…80ec6786`, not recomputed/overwritten) |
| `commit-payload.sha256` | MATCH |
| Batch/Job IDs | `BATCH-GTH-20260724-001` / `JOB-GTH-DISCOVERY-20260724-001` |
| `STAGING_COMMIT_ENABLED` | false |

## Blocking failure

`COMMIT_PAYLOAD_PHASE2_INCOMPATIBLE`

The controlled commit payload at `.work/staging-db/BATCH-GTH-20260724-001/implementation/commit-payload.json` contains only:

- session envelope fields
- `counts` / `entity_counts` (developers 5, projects 10, images 9, pdfs 5, news 10, review_items 63, conflicts 1)

It contains **no entity arrays** (`developers[]`, `projects[]`, `assets[]/images[]`, `pdfs[]`, `news[]`, `review_items[]`, `conflicts[]`).

The deployed Phase2 `commit_staging_import_v1` rejects this payload by design:

```
payload.developers array required when counts.developers > 0
```

## Why not auto-fixed in this run

Producing a Phase2-compatible Batch001 payload requires regenerating `commit-payload.json` and its `.sha256` sidecar from the review-console data — i.e. regenerating the pinned Batch001 commit artifact. This run's constraints forbid regenerating Batch001 and overwriting stored digests/hashes, so preflight fails closed instead.

## Consequence

- `COMMIT_PREFLIGHT=FAIL`
- Old empty session rollback: NOT_EXECUTED (would strand Batch001 with no committable payload)
- Controlled commit: NOT_EXECUTED
- Database business rows: unchanged (write operations: 0)
