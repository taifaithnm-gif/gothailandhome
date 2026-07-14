# Property Factory pipelines

Implements Import Pipeline V2 + DATA_STANDARD validators (Phase 6 M1 core).

## CLI

```bash
npm run factory -- validate <path>
npm run factory -- dry-run <path|--wave bangkok-w1>
npm run factory -- apply <path|--wave bangkok-w1>
npm run factory -- resume <batch_id>
npm run factory -- rollback <batch_id>
npm run factory -- generate
```

M1 exit specimens:

```bash
npm run factory -- validate content/projects/the-livin-ramkhamhaeng
npm run factory -- validate content/areas/bangkok/districts/bang-kapi.json
npm run factory -- dry-run content/projects/the-livin-ramkhamhaeng
npm run factory -- dry-run content/areas/bangkok/districts/bang-kapi.json
```

## Modules

- `schemas/` — developer, district, project, listing, **media**, i18n, source
- `lib/validate.mjs` — schema, required fields, source URL, capture dates, coordinates, price, duplicates/fingerprints, media path checks, EN/ZH/TH gates
- `lib/import-engine.mjs` — dry-run / apply / resume / rollback
- `adapters/` — reserved for portal adapters (PropertyHub first)

## Database (additive)

`supabase/migrations/20260714200000_factory_m1_foundation.sql`

- `listing_verification_status` + `properties.verification_status`
- `listing_price_history`
- `import_batches` / `import_batch_items`
- source validation + `duplicate_fingerprint` columns

```bash
npm run db:migrate:phase6-m1
```

## Non-goals (M1)

No Marketplace, AI, CRM, Payment, UI redesign, or volume listing imports.
