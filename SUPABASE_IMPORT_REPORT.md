# SUPABASE_IMPORT_REPORT

**Date:** 2026-07-14  
**Importer:** `pipelines/factory/livinginsider/import-li-only.mjs`  
**Safety:** Only selects/updates `properties` where `source = 'livinginsider'`

## Import result

| Metric | Count |
|--------|------:|
| Validated LI listings | 316 |
| Validation failures | 0 |
| Inserted | 96 |
| Updated (LI rows only) | 220 |
| DB LivingInsider rows after import | **316** |
| Sale / rent in DB | 200 / 116 |
| `property_listing_sources` (livinginsider) | 316 |
| Price history appends (this pass) | (see `import-li-only.json`) |
| Verification events | 316-path events recorded |

Evidence: `pipelines/factory/livinginsider/_runs/import-li-only.json`

## PropertyHub protection

| Check | Result |
|-------|--------|
| PropertyHub row count | **617** (unchanged) |
| Package price match | **617 / 617** |
| PropertyHub `updated_at` max | Unchanged through LI-only import (`2026-07-14T15:05:56…`) |
| Schema migrations this milestone | **None** |

## Provenance reuse

Per LI listing:

- identity fingerprint / soft fingerprint  
- `property_listing_sources` row  
- `listing_price_history` on insert/price change  
- `listing_verification_events` (`livinginsider_import`)

No Parent developer/project rewrite during LI-only import (resolve existing `property_projects` by slug only).
