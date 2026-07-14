# VALIDATION_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M4 DDproperty Wave 1

## Data validation

| Check | Result |
|-------|--------|
| DDproperty harvest | **BLOCKED** (Cloudflare 403 × 66 search pages · 0 listings) |
| DD package ↔ DB reconcile | PASS (0 packages inventory ↔ 0 DB rows) |
| PropertyHub row count | PASS **617** |
| LivingInsider row count | PASS **316** |
| PH `updated_at` max frozen | PASS (`2026-07-14T15:05:56…`) |
| LI unchanged by DD import | PASS |
| Auto-merge | PASS (**0**) |
| Schema change | PASS (**none**) |

## Engineering checks

| Check | Result |
|-------|--------|
| ESLint | PASS — 0 errors (warnings only; unused-disable in URI fix + pre-existing PH harvest) |
| TypeScript via `next build` | PASS |
| `next build` | PASS |
| `npm test` | **N/A** — no `test` script in `package.json` |
| Supabase reconciliation | PASS (PH 617 · LI 316 · DD 0) |

## Stop conditions

| Condition | Triggered? |
|-----------|------------|
| Verified PH/LI data at risk | **No** — DD-only importer; 0 writes to PH/LI |
| Schema change required | No |
| Auto-merge performed | No |
| Fabricated listings | No |

## Status

**PASS (infrastructure) · harvest BLOCKED by Cloudflare**

Ready to commit and push adapter/tooling + empty Wave-1 DD packages + reports. Re-run harvest when CF egress is available; do not invent listings.
