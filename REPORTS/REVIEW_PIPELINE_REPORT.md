# REVIEW_PIPELINE_REPORT

**Date:** 2026-07-24T12:36:33.233Z
**Result:** PASS

## Evidence review status machine

```text
NEW → REVIEWING → APPROVED → IMPORT_READY → IMPORTED
              ↘ REJECTED (terminal)
```

- Adapter dry-run sets evidence status to **NEW** only.
- **Never auto APPROVED.**
- Human-only: APPROVED, IMPORT_READY, IMPORTED.

## Review card fields (required)

Developer · Project · Province · Source URL · Evidence · Image · PDF · News · Hash · Review Status

## Cards prepared this run

| Record | Developer | Project | Province | Status |
| --- | --- | --- | --- | --- |
| mock-rec-001 | Ananda Development | Ashton Silom | Bangkok | **NEW** |
| mock-rec-002 | Sansiri | THE LINE Phahonyothin Park | Bangkok | **NEW** |
| mock-rec-003 | Noble Development | Noble Around Ari | Bangkok | **NEW** |

## Auto-approve check

All cards reviewStatus === NEW: **true**

## Preview packages

Written under `documents/review/*.preview.json` — Production **not** connected.
