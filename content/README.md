# Property Factory content root

Package layout for GoThailandHome Phase 6 M1.

See `DATA_STANDARD.md`, `IMPORT_PIPELINE_V2.md`, and `pipelines/factory/`.

## Commands

```bash
npm run factory:generate
npm run factory:validate -- content/areas/bangkok/districts/bang-kapi.json
npm run factory:dry-run -- --wave bangkok-w1
npm run factory:apply -- --wave bangkok-w1
npm run factory:resume -- <batch_id>
npm run factory:rollback -- <batch_id>
```

## Validation rules

- All packages must pass DATA_STANDARD JSON Schema validators.
- Listings require source allow-list + listing_url + price provenance.
- No fabricated yields, prices, or inventory counts in area packages.
