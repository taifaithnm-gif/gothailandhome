# Human Review Console

Local read-only console for Goth Batch import review candidates.

## Route

`/internal/review/windows01/batches/BATCH-GTH-20260724-001`

## Access gates

- `FEATURE_GOTH_REVIEW_CONSOLE` default **false**
- Blocked when `APP_DEPLOY_ENV=production` or `VERCEL_ENV=production`
- Not in public navigation
- Not in sitemap
- `robots: noindex`
- No Production database client imports on this path

## Enable locally

```bash
FEATURE_GOTH_REVIEW_CONSOLE=true APP_DEPLOY_ENV=development npm run dev
```

Then open the route above after generating console data:

```bash
npm run staging:goth:import -- --zip ... --sidecar ... --dry-run
npm run staging:goth:review-console -- --batch BATCH-GTH-20260724-001
```

## Data files

`.work/review-console/<batchId>/`

- summary.json
- developers.json / projects.json / images.json / pdfs.json / news.json
- review-items.json
- duplicate-candidates.json / conflict-candidates.json
- ready-for-approval.json / rejected.json / quarantined.json
- audit-log.jsonl

`summary.productionSafe` must be `true`; `databaseWrites` / `storageUploads` must be `0`.

## UI capabilities

- Summary cards
- Entity / review-state / severity / confidence filters
- Search + pagination
- Evidence / raw payload expanders
- UNKNOWN developer + province conflict markers
- Local image path preview (no remote image loading)
- PDF metadata preview

## Forbidden actions

Approve, Publish, Delete, and any real state mutation are not implemented. Buttons are preview-only:

- View Evidence
- View Source Metadata
- Marking Preview (no-op)
