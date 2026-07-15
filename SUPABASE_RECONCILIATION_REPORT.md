# SUPABASE_RECONCILIATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 6 M8 Multi-Source Overnight Consolidation Audit  
**Mode:** Read-only reconcile (no imports, deletes, or merges)

## Source inventory

| Source | Package | DB | Delta | Classification |
|--------|--------:|---:|------:|----------------|
| propertyhub | 617 | 617 | 0 | imported |
| livinginsider | 316 | 316 | 0 | imported |
| ddproperty | 0 | 0 | 0 | implemented_but_blocked |
| hipflat | 0 | 0 | 0 | implemented_but_blocked |
| dotproperty | 192 | 192 | 0 | imported |
| fazwaz | 190 | 190 | 0 | imported |
| **Total imported** | **1315** | **1315** | **0** | |

## Price drift

| Check | Result |
|-------|--------|
| Package ↔ DB across all imported sources | **0 / 1315** drift |
| PropertyHub freeze `updated_at` | Held |
| LivingInsider post-import `updated_at` | Held |

## Provenance tables (imported 1315)

| Artifact | Coverage |
|----------|----------|
| `property_listing_sources` | 1315 / 1315 |
| `listing_price_history` | 1315 / 1315 |
| `listing_verification_events` | 1315 / 1315 |

## Candidates

| Metric | Count |
|--------|------:|
| Open soft-match candidates | 191 |
| Auto-merges | 0 |

## Schema

| Check | Result |
|-------|--------|
| Schema migrations this milestone | **None** |
| Schema change required for audit | **No** |

Evidence: `pipelines/factory/overnight/_runs/overnight-audit.json`
