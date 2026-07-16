# PUBLIC_ALPHA_BACKLOG_V2

**Date:** 2026-07-16  
**Supersedes for ops planning:** extends `PUBLIC_ALPHA_BACKLOG.md` after Phase 10  
**Decision:** **PASS WITH ACTIONS**  
**Rule:** No open **P0** product blockers. Do not start CRM, city expansion, or unlicensed media scrape from this backlog automatically.

Priority: **P0** blocker · **P1** before broad public / paid push · **P2** important · **P3** optional

## P0

_None open for Public Alpha soft launch._

(Do **not** treat missing GA4 as P0 for a private/soft Alpha URL, but treat it as **P1 hard gate before paid traffic**.)

## P1 — before broad Public Alpha / paid traffic

| ID | Action | Owner hint |
|----|--------|------------|
| A1 | Wire **GA4** (Measurement ID + page_view + lead events) | Ops / eng |
| A2 | **Google Search Console** verify + sitemap submit + coverage watch | Ops |
| A3 | **Bing Webmaster** verify + sitemap | Ops |
| A4 | **IndexNow** key + `.well-known` + ping on publish | Eng |
| A5 | Paginate sitemap listing URLs (all published × locales) | Eng (R1) |
| A6 | Fresh Lighthouse on home / properties / project; publish dated scores | Eng (R6) |
| A7 | Re-verify `marketplace_leads` RLS + monitoring | Eng/Sec (R3) |
| A8 | Decision on +3 Livin PropertyHub DB drift rows | Data (R4) |
| A9 | Quarantine/unpublish non-master seed developers in DB | Data (R5) |
| A10 | Public messaging: do not overclaim project media / inventory depth | Product |
| A11 | Root `<html lang>` per locale without ISR regression | Eng (R2) |

## P2 — credibility deepen (Phase 10 carryover)

| ID | Action |
|----|--------|
| B1 | Licensed official project heroes / galleries / floor-plan binaries |
| B2 | Continue official project batches beyond Sprint 3b six developers |
| B3 | Outer-district named hospitals/schools/parks from official directories only |
| B4 | Office-area corridors only when sourced (no invention) |
| B5 | Lighthouse CI budgets (A21) |
| B6 | CDN / image optimization for remote covers |
| B7 | Full WCAG / axe CI |
| B8 | Additional official brochure PDF mirrors with provenance |

## P3 — optional / deferred

| ID | Action |
|----|--------|
| C1 | Consumer lead-status dashboards |
| C2 | Billing / lead resale |
| C3 | Formal external security review |
| C4 | CRM automation (explicitly out of Alpha) |
| C5 | Auth expansion / multi-city mass import |

## Phase 10 score snapshot (context)

| Family | Latest |
|--------|-------:|
| Developers | 93.5% |
| Projects (6-field) | 40.5% |
| Districts | 79% |
| Media catalog | 46.8% |
| Equal-weight mean | 71% |
