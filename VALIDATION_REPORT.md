# VALIDATION_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M6 DotProperty Wave 1

## Data validation

| Check | Result |
|-------|--------|
| DotProperty harvest | **PASS** (192 validated · 96 sale / 96 rent) |
| DotProperty package ↔ DB | PASS (**192 / 192**, **0** price drift) |
| PropertyHub row count | PASS **617** |
| LivingInsider row count | PASS **316** |
| PH / LI price drift (sample 120) | PASS **0** |
| Hard duplicates (DotProperty) | PASS **0** |
| Auto-merge | PASS **0** (26 soft candidates open only) |
| Schema change | PASS **none** |
| DDproperty / Hipflat adapters | PASS untouched · still BLOCKED · 0 rows |

## Engineering checks

| Check | Result |
|-------|--------|
| ESLint | PASS — 0 errors (2 pre-existing warnings) |
| TypeScript via `next build` | PASS |
| `next build` | PASS |
| `npm test` | **N/A** — no `test` script in `package.json` |
| Supabase reconciliation | PASS (PH 617 · LI 316 · DD 0 · HF 0 · DP 192) |

## Stop conditions

| Condition | Triggered? |
|-----------|------------|
| Cloudflare / access-control block on DotProperty | **No** (site public) |
| Verified PH/LI data at risk | **No** |
| Schema change required | No |
| Auto-merge performed | No |
| Fabricated listings | No |

## Status

**PASS — ready to commit and push**

Combined verified inventory after M6: PropertyHub 617 + LivingInsider 316 + DotProperty 192 = **1125** (plus blocked DD/HF adapters with 0 rows).
