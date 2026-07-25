# GOTH_BATCH001_REVIEW_CONSOLE

**Batch:** BATCH-GTH-20260724-001

## Data directory

`.work/review-console/BATCH-GTH-20260724-001/`

## Summary flags

| Field | Value |
| --- | --- |
| productionSafe | true |
| databaseWrites | 0 |
| storageUploads | 0 |
| totalEntities | 39 |
| totalReviewItems | 38 |

## Route

`/internal/review/windows01/batches/BATCH-GTH-20260724-001`

Enable:

```bash
FEATURE_GOTH_REVIEW_CONSOLE=true APP_DEPLOY_ENV=development npm run dev
```

## Safety

- No absolute local paths in console JSON
- No remote image loading
- No Approve/Publish/Delete controls
- Feature flag default false; production blocked
- Not in sitemap / public nav
