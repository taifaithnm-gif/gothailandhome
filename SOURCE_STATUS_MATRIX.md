# SOURCE_STATUS_MATRIX

**Date:** 2026-07-15  
**Milestone:** Phase 6 M8 Multi-Source Overnight Consolidation Audit  
**Rule:** Read-only reconcile · no harvest · no schema change · no auto-merge

## Matrix

| Source | Classification | Adapter | Harvest | Packages | DB rows | Sale/Rent (pkg) | Notes |
|--------|----------------|---------|---------|----------|--------:|-----------------|-------|
| PropertyHub | **imported** | yes | PASS | 617 | **617** | 308 / 309 | `updated_at` max frozen `2026-07-14T15:05:56.459976+00:00` |
| LivingInsider | **imported** | yes | PASS (prior) | 316 | **316** | 200 / 116 | `updated_at` max `2026-07-14T15:24:51.273471+00:00` |
| DDproperty | **implemented_but_blocked** | yes | BLOCKED (Cloudflare) | 0 | **0** | — | Adapter preserved; no invent |
| Hipflat | **implemented_but_blocked** | yes | BLOCKED (Cloudflare) | 0 | **0** | — | Adapter preserved; no invent |
| DotProperty | **imported** | yes | PASS | 192 | **192** | 96 / 96 | Public `dotproperty.co.th` |
| FazWaz | **imported** | yes | PASS | 190 | **190** | 94 / 96 | Public `fazwaz.co.th` (`fazwaz.com` CF-blocked, unused) |

## Classification legend

| Status | Meaning |
|--------|---------|
| `imported` | Validated packages present and matching Supabase rows |
| `implemented_but_blocked` | Adapter + harvest tooling shipped; live harvest blocked by access controls |
| `validation_failed` | Packages exist but failed import/validation gates |
| `not_executed` | No adapter / no harvest attempt |

## Counts

| Metric | Value |
|--------|------:|
| Imported listing total | **1315** |
| Blocked sources | 2 (DDproperty, Hipflat) |
| Validation failures | 0 |
| Not executed | 0 |

Evidence: `pipelines/factory/overnight/_runs/overnight-audit.json`
