# MULTISOURCE_DATA_AUDIT_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 6 M8  
**Scope:** Every imported listing across PropertyHub, LivingInsider, DotProperty, FazWaz

## Field completeness (imported rows)

| Source | Checked | OK | Missing identity/URL/project/price/fp/source/history/event/status |
|--------|--------:|---:|-------------------------------------------------------------------|
| PropertyHub | 617 | **617** | all zeros |
| LivingInsider | 316 | **316** | all zeros |
| DotProperty | 192 | **192** | all zeros |
| FazWaz | 190 | **190** | all zeros |

Required checks per row:

- unique source identity (`source` + `source_listing_id` / `external_ref`)
- source URL
- project relation (`project_id`)
- published price (`price_thb > 0`)
- identity fingerprint (`duplicate_fingerprint`)
- provenance (`property_listing_sources`)
- price history (`listing_price_history`)
- verification event (`listing_verification_events`)
- listing status (`status` / `listing_lifecycle_status`)

## Defect scan

| Defect class | Count |
|--------------|------:|
| Hard duplicates (`external_ref` / `source_listing_id` within source) | **0** |
| Project mapping conflicts (package slug ≠ DB project slug) | **0** |
| District mismatches | **0** |
| Malformed prices or areas | **0** |
| Missing evidence (source/history/event) | **0** |
| Partial imports (package without DB) | **0** |
| Orphan source rows | **0** |

## Package ↔ DB price reconcile

| Source | Checked | Drift |
|--------|--------:|------:|
| PropertyHub | 617 | **0** |
| LivingInsider | 316 | **0** |
| DotProperty | 192 | **0** |
| FazWaz | 190 | **0** |
| **Total** | **1315** | **0** |

## Prior-data freeze holds

| Source | `updated_at` max | Hold |
|--------|------------------|------|
| PropertyHub | `2026-07-14T15:05:56.459976+00:00` | **YES** (matches Wave-1 freeze baseline) |
| LivingInsider | `2026-07-14T15:24:51.273471+00:00` | **YES** (unchanged since LI import) |

No unjustified rewrites of verified prior rows detected in this audit.

Evidence: `pipelines/factory/overnight/_runs/overnight-audit.json`
