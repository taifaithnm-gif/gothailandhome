# Phase 1 Task 021 Completion Report

**Date:** 2026-07-20  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-21** — Contact and marketplace journey consolidation

## Objective

Align Contact, Marketplace, Find My Home, List Property, partnership, and
viewing entry points.

## Files modified

1. `src/lib/marketplace/journey.ts` — canonical audience → entry route matrix
   (buyer / owner / developer / agency / viewing / platform_support) with
   private-submission flags and hub/contact path constants.
2. `src/lib/navigation/site-nav.ts` — hub-first chrome: marketplace group is
   `/marketplace` only; Partners routes through the hub (not developers-only).
3. `src/app/[lang]/contact/page.tsx` — breadcrumbs via hub; privacy note;
   marketplace journey handoff card; shared `PlatformCustomerSuccess` role
   block alongside the detailed PCS aside.
4. `src/dictionaries/en.json` / `zh.json` / `th.json` — `contact.journey*`,
   `contact.privacyNote`; hub promise discloses private ≠ published.
5. `scripts/test-marketplace-journey.mjs` — P1-21 route-matrix acceptance suite.
6. `scripts/test-navigation-locale.mjs` — updated for hub-first IA.
7. `package.json` — `test:marketplace-journey` wired into `npm test`.
8. `P1_TASK_021_COMPLETION_REPORT.md` — this report.

## Functional changes

- One clear entry path per audience via `MARKETPLACE_JOURNEYS`.
- Site chrome no longer peers Find My Home / List Property beside the hub;
  Partners opens the hub so both developer and agency cards are reachable.
- Contact remains Platform Customer Success only, with an explicit handoff to
  the Marketplace hub for other audiences.
- Hub promise and contact privacy copy state that private submissions are never
  presented as published inventory.
- Viewing intake stays on listing detail; hub card still browses `/properties`.

## Routes/components affected

- Header/footer marketplace + partners links.
- `/[lang]/contact` (journey handoff + shared PCS block).
- Marketplace hub copy (promise).

Preserved: favorites, compare, inquiry handoff, listing/property/project/
developer/district flows, accessibility, responsive, metadata, canonical,
hreflang, JSON-LD. No Windows01, live sources, OCR, collectors, embeddings, or
production-config changes.

## Task-specific verification

**PASS** — `npm run test:marketplace-journey` exited 0 (route matrix, hub-first
chrome, contact roles, private ≠ published). Related: `test:navigation`,
`test:marketplace-hub`, `test:homepage`, `test:contact-roles`.

## Typecheck / Lint / Test / Build

| Gate | Result |
|------|--------|
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** |
| `npm test` | **PASS** |
| `npm run build` | **PASS** |

## Remaining P1 tasks

**15 tasks remain:** P1-22–P1-36.

**Stopped after P1-21 for the continuous run handoff.** P1-22 depends on
**G-CONTENT-PUBLIC** (content types + locale fallback policy approval), which
is not recorded as closed in the repository planning documents.
