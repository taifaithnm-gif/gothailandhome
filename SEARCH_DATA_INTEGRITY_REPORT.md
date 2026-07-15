# SEARCH_DATA_INTEGRITY_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.3 — Search Results Alpha

## Package integrity (offline)

| Source | Count |
|--------|------:|
| PropertyHub | 617 |
| LivingInsider | 316 |
| DotProperty | 192 |
| FazWaz | 190 |
| **Total** | **1,315** |

`npm run test:listing-integrity` → **PASS**  
Baseline SHA unchanged; listing package files not modified.

## Live UI total vs packages

Unfiltered `/en/properties` result count shown in UI: **1,318** verified published rows.

| Scope | Count | Note |
|-------|------:|------|
| Freeze packages `n` | 1,315 | Source packages; immutable this milestone |
| UI/DB verified published total | 1,318 | Pre-existing live drift (+3), documented in prior P0 notes |

Reconciliation: package inventory and DB published count are different layers. Search does not mutate packages or listing facts; drift is pre-existing and out of scope to “fix” via harvest or price/provenance edits.

## Guarantees this milestone

- No harvest  
- No changes to prices, source identities, fingerprints, provenance, or listing relations  
- No schema migrations required for filters (read existing columns / joins only)  
- Contact-role invariants still PASS (Apple = Platform CS only)
