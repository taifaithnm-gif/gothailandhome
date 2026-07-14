# Property Factory pipelines

Implements Import Pipeline V2 + DATA_STANDARD validators (Phase 6 M1).

## CLI

```bash
npm run factory -- validate <path>
npm run factory -- dry-run --wave bangkok-w1
npm run factory -- apply --wave bangkok-w1
npm run factory -- resume <batch_id>
npm run factory -- rollback <batch_id>
npm run factory -- generate
```

## Modules

- `schemas/` — JSON Schema for developer, district, project, listing
- `lib/validate.mjs` — schema, required fields, duplicates, source, coordinates, images
- `lib/import-engine.mjs` — dry-run / apply / resume / rollback
- `adapters/` — reserved for portal adapters (PropertyHub first)

## Non-goals (M1)

No Marketplace, AI, CRM, or Payment writes.
