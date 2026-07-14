# SUPABASE_IMPORT_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M4 DDproperty Wave 1  
**Importer:** `pipelines/factory/ddproperty/import-dd-only.mjs`  
**Safety:** Only selects/updates `properties` where `source = 'ddproperty'`

## Import result

| Metric | Count |
|--------|------:|
| Validated DD listings | **0** |
| Validation failures | 0 |
| Inserted | **0** |
| Updated | **0** |
| DB DDproperty rows after import | **0** |
| `property_listing_sources` (ddproperty) | 0 |
| Price history / verification events | 0 (nothing to import) |

Evidence: `pipelines/factory/ddproperty/_runs/import-dd-only.json`

Note: harvest returned Cloudflare-blocked empty packages; importer correctly no-oped (`No listings-ddproperty.json packages with listings`).

## Upstream protection

| Check | Result |
|-------|--------|
| PropertyHub row count | **617** (unchanged) |
| LivingInsider row count | **316** (unchanged) |
| PropertyHub `updated_at` max | `2026-07-14T15:05:56.459976+00:00` (frozen) |
| LivingInsider `updated_at` max | `2026-07-14T15:24:51.273471+00:00` (unchanged by DD import) |
| Schema migrations this milestone | **None** |

## Provenance reuse (ready when harvest unblocks)

Per DD listing the importer will write:

- identity fingerprint / soft fingerprint  
- `property_listing_sources` row  
- `listing_price_history` on insert/price change  
- `listing_verification_events` (`ddproperty_import`)

No parent developer/project rewrite (resolve existing `property_projects` by slug only).
