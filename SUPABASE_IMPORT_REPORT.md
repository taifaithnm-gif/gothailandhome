# SUPABASE_IMPORT_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M6 DotProperty Wave 1  
**Importer:** `pipelines/factory/dotproperty/import-dp-only.mjs`  
**Safety:** Only selects/updates/deletes `properties` where `source = 'dotproperty'`

## Import result

| Metric | Count |
|--------|------:|
| Validated DotProperty listings | **192** |
| Validation failures | 0 |
| Inserted (final balanced set) | 192 path (96 new rent after rebalance + sale upserts) |
| DB DotProperty rows after reconcile | **192** |
| Sale / rent in DB | **96 / 96** |
| Package ↔ DB refs | **192 / 192** |
| Package ↔ DB price drift | **0** |
| Hard duplicate `external_ref` | **0** |
| `property_listing_sources` (dotproperty) | 192 |
| Price history / verification events | written on insert/change |

Evidence: `pipelines/factory/dotproperty/_runs/import-dp-only.json`

### Orphan cleanup

First harvest pass was sale-biased (192 sale). After balancing to 96/96, **96** superseded DotProperty-only rows were deleted (children cleaned: sources, price history, verification events, duplicate candidates). PropertyHub / LivingInsider rows were not touched.

## Upstream protection

| Check | Result |
|-------|--------|
| PropertyHub row count | **617** (unchanged) |
| LivingInsider row count | **316** (unchanged) |
| DDproperty | **0** (BLOCKED, unchanged) |
| Hipflat | **0** (BLOCKED, unchanged) |
| PropertyHub `updated_at` max | `2026-07-14T15:05:56.459976+00:00` (frozen) |
| LivingInsider `updated_at` max | `2026-07-14T15:24:51.273471+00:00` (unchanged) |
| PH price sample (120) | **120 / 120** · **0** drift |
| LI price sample (120) | **120 / 120** · **0** drift |
| Schema migrations this milestone | **None** |

## Provenance reuse

Per DotProperty listing:

- identity fingerprint / soft fingerprint  
- `property_listing_sources` row  
- `listing_price_history` on insert/price change  
- `listing_verification_events` (`dotproperty_import`)

No parent developer/project rewrite (resolve existing `property_projects` by slug only).
