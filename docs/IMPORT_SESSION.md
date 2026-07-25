# Import Session

**Source:** `src/lib/staging-import/staging-session.ts`

## Pipeline

```
created
  → batch_loaded
  → validated
  → normalized
  → review_mapped
  → duplicate_checked
  → preview_ready
  → blocked_commit
```

Phases `duplicate_checked` and `review_mapped` are both performed inside `run()`; the final phase is always `blocked_commit`.

## API

```ts
const session = new ImportSession();
session.loadBatch(batch);
const result = session.run({ actor: "cli" });
session.commit(); // always throws
```

Or:

```ts
const result = runImportSession(batch);
```

## Result guarantees (V1)

- `committed: false`
- `databaseWrites: 0`
- `storageUploads: 0`
- `productionChanged: false`
- Preview actions are `WOULD_*` only
- Approval candidates all have `approved: false`

## Idempotency

Re-running the same batch yields the same preview totals and action distribution (deterministic mapping). Session IDs differ unless supplied.
