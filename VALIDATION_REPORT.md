# VALIDATION_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M5 Hipflat Wave 1

## Data validation

| Check | Result |
|-------|--------|
| Hipflat harvest | **BLOCKED** (Cloudflare 403 × 66 search pages · 0 listings) |
| Hipflat package ↔ DB | PASS (0 inventory ↔ 0 DB rows) |
| PropertyHub row count | PASS **617** |
| LivingInsider row count | PASS **316** |
| DDproperty status | PASS (still **BLOCKED** · adapter untouched) |
| PH price drift (sample 80) | PASS **0** |
| LI price drift (sample 80) | PASS **0** |
| Hard duplicates introduced | PASS (**0** Hipflat rows) |
| Auto-merge | PASS (**0**) |
| Schema change | PASS (**none**) |

## Engineering checks

| Check | Result |
|-------|--------|
| ESLint | PASS — 0 errors |
| TypeScript via `next build` | PASS |
| `next build` | PASS |
| `npm test` | **N/A** — no `test` script in `package.json` |
| Supabase reconciliation | PASS (PH 617 · LI 316 · DD 0 · HF 0) |

## Stop conditions

| Condition | Triggered? |
|-----------|------------|
| Hipflat Cloudflare / equivalent block | **Yes** — harvest BLOCKED |
| Source pages unverifiable | **Yes** |
| Verified PH/LI data at risk | **No** — Hipflat-only importer; 0 PH/LI writes |
| Schema change required | No |
| Auto-merge performed | No |
| Fabricated listings | No |
| Cloudflare bypass attempted | No |

## Status

**PASS (infrastructure) · harvest BLOCKED by Cloudflare**

Ready to commit and push adapter/tooling + empty Wave-1 Hipflat packages + reports. Re-run harvest only when CF-free egress is available; do not invent listings.
