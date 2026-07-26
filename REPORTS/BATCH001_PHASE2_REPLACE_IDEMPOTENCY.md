# Batch001 Phase2 Replace — Idempotency

**Milestone:** `REPLACE_EMPTY_V1_SESSION_WITH_PHASE2_COMMIT`  
**Result:** `PASS`

## Method

Immediately after successful Phase2 commit, re-invoked `commit_staging_import_v1` with the **same locked Phase2 artifact** (hash `9d31bf8b5bca…f723d562`) under process-level commit authorization.

## Outcome

| Check | Result |
| --- | --- |
| Second write blocked | YES |
| Error class | unique constraint `staging_import_sessions_import_session_id_key` |
| Semantics | `IMPORT_SESSION_ALREADY_COMMITTED` (unique session id) |
| REPEAT_RUN_NEW_ROWS | 0 |
| Developers/Projects/Assets/PDFs/News/ReviewItems/Conflicts/Sessions after retry | unchanged |

No second business rows were inserted.
