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
| of which `status=draft` seed demos (live) | 12 |
| of which `status=published` (live) | 0 |
| imported/`source` listings with `agent_id` | 0 |

**Clarification (2026-07-15 reconciliation):** The freeze-era “12” are Phase 3 **seed demo** rows. They still have `agent_id` linked to demo agents Anya/Somchai, but Phase 5 geography migration set `status='draft'` for placeholders without `listing_url`/source. Published Alpha inventory therefore shows **0** agents. See [AGENT_ID_RECONCILIATION_REPORT.md](AGENT_ID_RECONCILIATION_REPORT.md).

Offline contact tests still assert the freeze baseline row (`properties with agent_id` = 12).

## P0 mutations of verified listing business data

| Action | Done? |
|--------|------|
| Harvest | No |
| Price / fingerprint / provenance / source identity edits | No |
| Schema migrations | No |
| Auto-merge | No |

## Price / fingerprint integrity

Listing packages byte/identity gate unchanged (PASS). No import jobs run.
