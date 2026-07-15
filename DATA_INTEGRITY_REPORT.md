# DATA_INTEGRITY_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 P0 Stabilization  
**Note:** Supersedes stale numeric rows in older alpha integrity notes for agent_id only; package baseline unchanged.

## Package baseline (unchanged)

| Source | Count |
|--------|------:|
| PropertyHub | 617 |
| LivingInsider | 316 |
| DotProperty | 192 |
| FazWaz | 190 |
| **Total packages** | **1315** |
| DDproperty / Hipflat | 0 (blocked) |

Integrity gate: `npm run test:listing-integrity` → **PASS**  
`baseline_sha256`: `f0eb4b0ab5381dd47bc60bff0f6fed68d98346cb85cc3993df11f9477d78872c`  
`row_identity_sha256`: `27b71874f3643be844021b72f081ce200e638cefb17805e5d75cfe42c552a984`

## Content packages

| Entity | Expected | Observed |
|--------|----------|----------|
| Developers (packages) | 20 | 20 |
| Projects (packages) | 50 | 50 |

## Live Supabase reconcile (read-only)

Evidence: `pipelines/factory/overnight/_runs/p0-supabase-reconcile.json`

| Metric | Value |
|--------|------:|
| Published properties | 1318 |
| Verified published | 1318 |
| propertyhub | 617 |
| livinginsider | 316 |
| dotproperty | 192 |
| fazwaz | 190 |
| Published projects | 50 |
| Developers (table) | 23 |
## Listing-agent relations

| Metric | Count |
|--------|------:|
| properties with `agent_id` | 12 |
| Live DB at P0 validation (read-only; not modified) | 0 |

Offline contact tests assert the freeze baseline row (`properties with agent_id` = 12). Live count is pre-existing drift.

## P0 mutations of verified listing business data

| Action | Done? |
|--------|------|
| Harvest | No |
| Price / fingerprint / provenance / source identity edits | No |
| Schema migrations | No |
| Auto-merge | No |

## Price / fingerprint integrity

Listing packages byte/identity gate unchanged (PASS). No import jobs run.
