# SUPABASE_IMPORT_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M7 FazWaz Wave 1  
**Importer:** `pipelines/factory/fazwaz/import-fz-only.mjs`  
**Safety:** Only selects/updates `properties` where `source = 'fazwaz'`

## Import result

| Metric | Count |
|--------|------:|
| Validated FazWaz listings | **190** |
| Validation failures | 0 |
| Inserted | **190** |
| Updated | 0 |
| DB FazWaz rows | **190** |
| Sale / rent | **94 / 96** |
| Package ↔ DB price drift | **0** (190/190) |
| Hard duplicate `external_ref` | **0** |
| `property_listing_sources` / price history / events | 190 path each |

Evidence: `pipelines/factory/fazwaz/_runs/import-fz-only.json`

## Upstream protection

| Check | Result |
|-------|--------|
| PropertyHub | **617** unchanged · `updated_at` max `2026-07-14T15:05:56…` |
| LivingInsider | **316** unchanged · `updated_at` max `2026-07-14T15:24:51…` |
| DotProperty | **192** unchanged |
| DDproperty / Hipflat | **0** unchanged |
| PH / LI / DP price samples (100) | **0** drift |
| Schema migrations | **None** |

## Provenance reuse

Per FazWaz listing: identity fingerprint, soft fingerprint, `property_listing_sources`, `listing_price_history`, `listing_verification_events` (`fazwaz_import`). Parent projects resolved by slug only.
