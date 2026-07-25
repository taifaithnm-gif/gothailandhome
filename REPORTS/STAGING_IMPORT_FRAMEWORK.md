# STAGING_IMPORT_FRAMEWORK

**Milestone:** STAGING_IMPORT_FRAMEWORK_V1
**Date:** 2026-07-24
**Host:** Mac mini
**Status:** COMPLETE (dry-run framework)

## Summary

Delivered the site-side Staging Import Framework under `src/lib/staging-import/`:

- Import Session (no commit)
- Review state machine (ceiling: READY_FOR_APPROVAL)
- Developer / Project / Image / PDF / News preview imports
- Duplicate Engine, Validation Engine, Approval Engine (candidates only)
- Preview Dashboard + CLI
- ≥80 automated tests (111 passed)
- Documentation set under `docs/`

## Boundaries respected

| Gate | Result |
| --- | --- |
| Production DB | unchanged |
| Storage uploads | blocked |
| Feature flags | unchanged |
| git commit / push / deploy | not performed |
| True approval | blocked |
| Commit path | throws `CommitNotImplementedError` |

## Current Windows01 batch (context only)

- Batch: `BATCH-GTH-20260724-001`
- Export: `/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS`
- Framework itself uses normalized `ImportBatch` + mocks; sealed ZIP Production import is out of scope for this milestone.
