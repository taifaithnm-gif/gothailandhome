# SOURCE_RECONCILIATION_REPORT

**Date:** 2026-07-14  
**Evidence:** `pipelines/factory/livinginsider/_runs/post-import-reconciliation.json` · `post-import-provenance.json`

## Package ↔ Supabase

### PropertyHub

| Metric | Value |
|--------|------:|
| Package listings | 617 |
| DB `source=propertyhub` | 617 |
| Matched `external_ref` | 617 |
| Package-only refs | 0 |
| DB-only refs | 0 |
| Price mismatches | **0** |
| Identity field issues | 0 |

### LivingInsider

| Metric | Value |
|--------|------:|
| Package listings | 316 |
| DB `source=livinginsider` | 316 |
| Matched `external_ref` | 316 |
| Package-only refs | 0 |
| DB-only refs | 0 |
| Price mismatches | **0** |
| Identity field issues | 0 |

### Combined

| Metric | Value |
|--------|------:|
| Total DB source records (PH + LI) | **933** |

## LivingInsider provenance coverage (DB)

| Artifact | Coverage |
|----------|----------|
| `duplicate_fingerprint` | 316 / 316 |
| `source_listing_id` | 316 / 316 |
| `normalized_source_url` | 316 / 316 |
| `property_listing_sources` row | 316 / 316 |
| `listing_price_history` | 316 / 316 |
| `listing_verification_events` | 316 / 316 |
| `project_id` present | 316 / 316 |

## PropertyHub immutability check

| Signal | Result |
|--------|--------|
| Row count | 617 |
| Prices vs packages | Exact match |
| Max `updated_at` | `2026-07-14T15:05:56.459976+00:00` (baseline unchanged) |

No schema changes applied during this audit.
