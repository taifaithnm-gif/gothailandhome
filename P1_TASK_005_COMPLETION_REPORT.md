# Phase 1 Task 005 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-05** — Homepage conversion hierarchy

## Objective

Clarify the path from home to buy/rent, filtered listings, projects, districts,
and inquiry. Every CTA must land on a valid localized route; featured sections
must remain bounded; unsupported “verified”/performance claims must be avoided;
mobile order and keyboard flow must be tested.

## Files modified

1. `src/app/[lang]/page.tsx` — conversion section order, bounds, inquiry CTAs,
   keyboard focus on view-all/knowledge links.
2. `src/components/home/home-conversion-paths.tsx` — new Buy / Rent / sale-scan
   path cards.
3. `src/components/home/home-hero-search.tsx` — focus-visible buy/rent toggle,
   larger submit target, hero Buy/Rent links.
4. `src/dictionaries/en.json` — paths copy, CTA labels, safer developer subtitle,
   sale-scan disclaimer.
5. `src/dictionaries/zh.json` — matching EN keys.
6. `src/dictionaries/th.json` — matching EN keys.
7. `scripts/test-homepage-conversion.mjs` — homepage conversion contract suite.
8. `package.json` — added `test:homepage`; wired into aggregate `npm test`.
9. `P1_TASK_005_COMPLETION_REPORT.md` — this report.

## Business functionality implemented

- Documented conversion order: **hero → sources → paths → listings → projects →
  districts → developers → why → marketplace → knowledge → support**.
- Primary path cards to `/buy`, `/rent`, and filtered
  `/properties?listing_type=sale&city=bangkok&sort=price_asc` (explicitly not a
  yield forecast).
- Listings surface before projects so inventory discovery precedes project browse.
- Featured bounds locked: 6 listings, 6 projects, 12 districts, 6 developers.
- Hero keeps filtered properties search plus Find My Home / List Property, with
  Buy/Rent shortcuts.
- Support section ends with Contact + Find My Home inquiry CTAs.
- Developer section copy no longer over-claims “verified profiles.”

## Routes/components affected

- `/[lang]` homepage (primary).
- Linked destinations: `/buy`, `/rent`, `/properties` (+ filters), `/projects`,
  `/districts/[slug]`, `/cities/[slug]`, `/developers`, `/marketplace`,
  `/knowledge`, `/contact`, `/find-my-home`, `/list-your-property`.
- Components: `HomeConversionPaths`, `HomeHeroSearch`, existing grids/cards.

## SEO impact

- Home `buildPageMetadata` (canonical / hreflang / OG) unchanged.
- Organization + Website JSON-LD unchanged.
- Sitemap unchanged.
- Route-metadata and SEO performance suites remain green.

## Accessibility impact

- P1-02 baseline preserved (`test:accessibility` PASS).
- Added focus-visible on hero buy/rent toggle, path cards, view-all links, and
  knowledge cards; hero submit uses `min-h-11`.

## Responsive verification

**PASS** — `npm run test:responsive` exited 0 (home grid / hero / shell contracts
still green).

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including navigation, accessibility, responsive,
and `test:homepage`.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated all
66 static pages.

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-05.

## Remaining P1 tasks

**31 tasks remain; none started by this task:**

- M2: P1-06–P1-14
- M3: P1-15–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-05.** P1-06 not started.
