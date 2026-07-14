# SUPABASE_IMPORT_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M5 Hipflat Wave 1  
**Importer:** `pipelines/factory/hipflat/import-hf-only.mjs`  
**Safety:** Only selects/updates `properties` where `source = 'hipflat'`

## Import result

| Metric | Count |
|--------|------:|
| Validated Hipflat listings | **0** |
| Validation failures | 0 |
| Inserted | **0** |
| Updated | **0** |
| DB Hipflat rows after import | **0** |
| `property_listing_sources` (hipflat) | 0 |
| Price history / verification events | 0 |

Evidence: `pipelines/factory/hipflat/_runs/import-hf-only.json`

Note: harvest returned Cloudflare-blocked empty packages; importer correctly no-oped.

## Upstream protection

| Check | Result |
|-------|--------|
| PropertyHub row count | **617** (unchanged) |
| LivingInsider row count | **316** (unchanged) |
| DDproperty row count | **0** (unchanged / still BLOCKED) |
| PropertyHub `updated_at` max | `2026-07-14T15:05:56.459976+00:00` (frozen) |
| LivingInsider `updated_at` max | `2026-07-14T15:24:51.273471+00:00` (unchanged by HF import) |
| PH price sample (80 rows) | **80 / 80** match · **0** drift |
| LI price sample (80 rows) | **80 / 80** match · **0** drift |
| Schema migrations this milestone | **None** |

## Provenance reuse (ready when harvest unblocks)

Per Hipflat listing the importer will write:

- identity fingerprint / soft fingerprint  
- `property_listing_sources` row  
- `listing_price_history` on insert/price change  
- `listing_verification_events` (`hipflat_import`)

No parent developer/project rewrite (resolve existing `property_projects` by slug only).
