# IMPORT_PIPELINE

## Flow

```
Batch load
  → Contract validation
  → Normalize
  → Validation engine
  → Per-entity preview import
  → Duplicate engine (in-pass + batch scan)
  → Review mapping
  → Approval candidates
  → Preview dashboard
  → Dry-run transaction finalize
  → blocked_commit
```

## Entity actions

| Action | Meaning |
| --- | --- |
| WOULD_CREATE | New entity candidate |
| WOULD_UPDATE | Existing id match |
| WOULD_REVIEW | Needs human review |
| WOULD_REJECT | Hard validation failure |
| WOULD_DUPLICATE | Duplicate candidate (generic) |
| WOULD_SKIP_DUPLICATE | Duplicate engine hit |
| WOULD_QUARANTINE | Quarantine candidate |

## CLI

- `npm run staging:import`
- `npm run staging:preview`
- `npm run staging:validate`
- `npm run staging:report`

Outputs land under `staging/import/` by default.
