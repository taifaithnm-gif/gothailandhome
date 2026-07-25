# Goth Batch Import Adapter

**Version:** 1.0.0
**Mode:** DRY RUN ONLY
**Milestone:** GOTH_BATCH_IMPORT_ADAPTER_V1

## Purpose

Boundary layer that maps Windows01 Goth Batch packages (`goth_batch_manifest.v1`) into the site-internal `ImportBatch` / `ImportSession` pipeline without leaking Windows01 raw field names into staging-import core modules.

## Layout

```
src/lib/staging-import/adapters/
  goth-types.ts
  goth-helpers.ts
  goth-batch-adapter.ts
  goth-developer-adapter.ts
  goth-project-adapter.ts
  goth-image-adapter.ts
  goth-pdf-adapter.ts
  goth-news-adapter.ts
  goth-review-adapter.ts
  goth-import-pipeline.ts
  index.ts
```

## CLI

```bash
npm run staging:goth:import -- \
  --zip "/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS/BATCH-GTH-20260724-001.zip" \
  --sidecar "/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS/BATCH-GTH-20260724-001.sha256" \
  --dry-run

npm run staging:goth:review-console -- --batch BATCH-GTH-20260724-001
```

`--dry-run` is mandatory. No database, storage, approval, or publish paths exist.

## Pipeline

```
LOAD → VERIFY (sealed ZIP + hashes) → NORMALIZE (adapters)
  → VALIDATE → DUPLICATE_CHECK → REVIEW_MAPPING → PREVIEW → BLOCKED_COMMIT
```

`ImportSession.commit()` always throws `CommitNotImplementedError`.

## Safety

| Gate | Value |
| --- | --- |
| Database writes | 0 |
| Storage uploads | 0 |
| Production connection | NO |
| Approvals | 0 |
| Published | 0 |
| Automation ceiling | READY_FOR_APPROVAL |

## Outputs

- `.work/imports/<batchId>/adapter-output/`
- `.work/review-console/<batchId>/`
