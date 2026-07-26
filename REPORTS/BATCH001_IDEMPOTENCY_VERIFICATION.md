# BATCH001 Idempotency Verification

**Date:** 2026-07-26  
**Batch:** BATCH-GTH-20260724-001  
**Session:** `sess_3465132f7da014513da1d0a2`

## Method

Re-ran the same controlled commit command with process-level `STAGING_COMMIT_ENABLED=true` and identical payload / sealed digest. Did **not** use a second insert success path.

## Result

| Check | Result |
| --- | --- |
| Second commit exit | 1 |
| Error | `duplicate key value violates unique constraint "staging_import_sessions_import_session_id_key"` |
| Mapped code | `GTH_DB_COMMIT_RPC_FAILED` |
| New session rows | **0** (still 1 total for batch) |
| New entity rows | **0** |
| New audit rows | **0** additional beyond first commit |

## Verdict

**PASS** — duplicate commit blocked by unique `import_session_id` (and unique `idempotency_key` on sessions). No additional business rows created.
