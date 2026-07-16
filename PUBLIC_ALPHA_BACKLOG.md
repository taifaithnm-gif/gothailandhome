# PUBLIC_ALPHA_BACKLOG

**Date:** 2026-07-16  
**After:** Platform Alpha RC2 (`PASS WITH ACTIONS`)  
**Rule:** No open **P0** blockers. Do not start CRM, auth expansion, city expansion, or deployment from this backlog automatically.

Priority: **P0** blocker · **P1** before broad public push · **P2** important · **P3** optional

## P0

_None open for RC2._

(Historical P0s from Alpha Fix Backlog — project 500s, unbounded listing SSR, unlabeled empty media, Apple-as-agent — are closed or mitigated.)

## P1

| ID | Action | Notes |
|----|--------|-------|
| R1 | Paginate sitemap listing URLs | Cover all published properties per locale |
| R2 | Root `<html lang>` per locale | Without destroying ISR/cache |
| R3 | Re-verify `marketplace_leads` RLS + monitoring | Before marketing traffic |
| R4 | Ops decision on +3 Livin PropertyHub DB rows | Keep / package / unpublish — **no silent delete** |
| R5 | Unpublish or clearly quarantine 3 seed developers | Align DB with 20-master |
| R6 | Fresh Lighthouse measure on home / properties / project | Update performance report with dated lab run |
| R7 | Branded `loading.tsx` / `error.tsx` | Better failure UX |
| R8 | Listing agent coverage plan | Evidenced contacts only; never invent Apple |

## P2

| ID | Action |
|----|--------|
| R9 | Lighthouse CI budgets (A21) |
| R10 | District index route |
| R11 | CDN / image optimization pipeline for remote covers |
| R12 | Deepen official copy only where sourced |
| R13 | Full WCAG / axe CI |
| R14 | Draft seed project hygiene (`river-horizon`, `lagoon-leaf`) |

## P3

| ID | Action |
|----|--------|
| R15 | Consumer lead-status dashboards |
| R16 | Billing / lead resale (explicitly out of Alpha) |
| R17 | Formal external security review |

## Explicitly deferred (do not start from RC2)

- CRM automation  
- Authentication expansion  
- New city expansion beyond Bangkok-first Alpha  
- Production deployment program  
