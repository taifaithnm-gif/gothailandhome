# VALIDATION_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M7 FazWaz Wave 1

## Data validation

| Check | Result |
|-------|--------|
| FazWaz harvest | **PASS** (190 validated · 94 sale / 96 rent) |
| FazWaz package ↔ DB | PASS (**190 / 190**, **0** drift) |
| PropertyHub | PASS **617** · **0** drift |
| LivingInsider | PASS **316** · **0** drift |
| DotProperty | PASS **192** · **0** drift |
| Hard duplicates (FazWaz) | PASS **0** |
| Auto-merge | PASS **0** (70 soft candidates open) |
| Schema change | PASS **none** |
| `fazwaz.com` Cloudflare | Documented blocked · harvest used public `fazwaz.co.th` only |

## Engineering checks

| Check | Result |
|-------|--------|
| ESLint | PASS — 0 errors |
| `next build` / TypeScript | PASS |
| `npm test` | **N/A** — no test script |
| Supabase reconciliation | PASS |

## Combined inventory

| Source | Count |
|--------|------:|
| PropertyHub | 617 |
| LivingInsider | 316 |
| DotProperty | 192 |
| FazWaz | 190 |
| **Total active** | **1315** |
| DDproperty / Hipflat | 0 (BLOCKED adapters preserved) |

## Status

**PASS — ready to commit and push**
