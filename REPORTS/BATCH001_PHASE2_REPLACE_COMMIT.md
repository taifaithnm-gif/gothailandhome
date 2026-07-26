# Batch001 Phase2 Replace — Controlled Commit

**Milestone:** `REPLACE_EMPTY_V1_SESSION_WITH_PHASE2_COMMIT`  
**Result:** `PASS`

## Input locks (unchanged)

| Lock | Value |
| --- | --- |
| Source sealed digest | `d709a72c2ff8…80ec6786` VERIFIED |
| Phase2 artifact hash | `9d31bf8b5bca…f723d562` VERIFIED / not regenerated / not modified |
| Artifact path | `ARTIFACTS/STAGING_COMMIT/BATCH-GTH-20260724-001/PHASE2/commit-payload.phase2.json` |
| V1 payload | preserved byte-identical |
| Source ZIP / manifests / sidecar | not modified |

## Commit

| Field | Value |
| --- | --- |
| RPC | `commit_staging_import_v1` Phase2 |
| New import session | `sess_p2_fbda6bfdbeb462c00f25f88f` |
| Authorization | process-level `STAGING_COMMIT_ENABLED=true` only |
| `.env.staging.local` after | `STAGING_COMMIT_ENABLED=false` |
| Storage uploads | 0 |
| Production connection | NO |

## RPC-reported counts (non-authoritative)

| Metric | RPC |
| --- | --- |
| developers | 5 |
| projects | 10 |
| assets | 9 |
| pdfs | 5 |
| news | 10 |
| review_items | 63 |
| conflicts | 1 |
| audit | 1 |

Authoritative verification: see `REPORTS/BATCH001_PHASE2_REPLACE_DATABASE_VERIFICATION.md`.
