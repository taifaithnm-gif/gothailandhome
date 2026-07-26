# Batch001 Phase2 Replace — Database Verification

**Milestone:** `REPLACE_EMPTY_V1_SESSION_WITH_PHASE2_COMMIT`  
**New session:** `sess_p2_fbda6bfdbeb462c00f25f88f`  
**Result:** `PASS`

## Authoritative `SELECT COUNT(*)` (by new import_session_id)

| Table | Payload | RPC | Actual DB | Match |
| --- | --- | --- | --- | --- |
| staging_import_sessions | 1 | 1 | 1 | PASS |
| staging_developers | 5 | 5 | 5 | PASS |
| staging_projects | 10 | 10 | 10 | PASS |
| staging_assets | 9 | 9 | 9 | PASS |
| staging_pdfs | 5 | 5 | 5 | PASS |
| staging_news | 10 | 10 | 10 | PASS |
| staging_review_items | 63 | 63 | 63 | PASS |
| staging_conflict_candidates | 1 | 1 | 1 | PASS |
| staging_audit_events | ≥1 | 1 | 1 | PASS |

## Totals

| Metric | Value |
| --- | --- |
| CORE_ENTITY_COUNT | 39 (= 5+10+9+5+10) |
| WORKFLOW_ENTITY_COUNT | 64 (= 63+1) |
| DATABASE_COUNT_MATCH | PASS |

## Business state

| Check | Result |
| --- | --- |
| Project 36936 present | YES |
| Project 36936 review_state | `REVIEW_REQUIRED` |
| Conflict on 36936 | 1 |
| UNKNOWN developers (no canonical link) | 5 |
| Approvals | 0 |
| Published | 0 |
| Storage object IDs / non-PLANNED | 0 |
| All core rows on new session | 39 |

## Old session after replace

| Item | Value |
| --- | --- |
| `sess_3465132f7da014513da1d0a2` | `ROLLED_BACK` |
| Synthetic `sess_phase2_bee24e5c` | unchanged |
