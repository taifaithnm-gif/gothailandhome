# DEVELOPER_DATA_INTEGRITY_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.6 — Developer Detail Alpha

## Freeze rules honored

- No harvest
- No verified listing record writes
- No developer evidence classification upgrades
- No listing or project relationship rewrites
- No schema changes
- No developer manifest mutations

## Counts

| Entity | Expected | Observed |
|--------|---------:|---------:|
| Developers | 20 | 20 |
| Projects | 50 | 50 |
| PropertyHub | 617 | 617 |
| LivingInsider | 316 | 316 |
| DotProperty | 192 | 192 |
| FazWaz | 190 | 190 |
| **Source total** | **1,315** | **1,315** |

`npm run test:listing-integrity` — PASS

## Known UI / database drift (unchanged)

| Layer | Total |
|-------|------:|
| Package baseline | **1,315** |
| Previously observed UI/database published total | **1,318** |

Those **3** additional UI/DB rows were **not** modified.

## Overall

# PASS — Data integrity preserved
