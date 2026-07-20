# Phase 1 Task 009 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-09** — Property card decision information

## Objective

Improve scanability of evidence-backed price, type, location, key facts,
freshness, and primary CTA.

## Files modified

1. `src/lib/property/property-card-model.ts` — **new** pure helpers for
   sourced-only location/project/transit, honest missing values, bedroom
   studio handling, price gating, and unique media alt composition.
2. `src/components/property/property-card.tsx` — decision hierarchy polish:
   type/location, project (when sourced), title link, freshness, transit,
   beds/baths/area with `dict.property.unknown`, price, unique CTA and
   platform-help accessible names; responsive price/CTA stack.
3. `src/components/property/listing-media-frame.tsx` — optional unique `alt`
   for real media (defaults to title); no invented imagery.
4. `scripts/test-property-card.mjs` — **new** P1-09 contract suite.
5. `scripts/test-accessibility-baseline.mjs` — card unique-name / media-alt
   selectors updated for P1-09.
6. `package.json` — `test:property-card` wired into aggregate `npm test`.
7. `P1_TASK_009_COMPLETION_REPORT.md` — this report.

`mapProperty` in `src/lib/data/properties.ts` was verified as already
non-inventing for cover/project/verification fields; no mapper edit required.
`property-grid.tsx` page bounds and `DEFAULT_LISTING_PAGE_SIZE` unchanged.

## Functional changes

- Cards surface only sourced decision fields (type, location, project when
  slug+name exist, transit tags when present, verified badge only when
  flagged, source disclosure only with real media).
- Missing beds/baths/area/price use explicit `Unknown` (or studio for
  sourced `bedrooms === 0`), not opaque placeholders or invented values.
- Primary detail CTA and platform-help links carry unique accessible names
  per listing title; media alt includes title · type · location.
- Price remains visually primary with a labeled primary CTA; freshness
  (`lastVerified` / `sourceUpdated`) stays visible when sourced.
- Layout keeps `min-h-11` CTA, `min-w-0` fact cells, and stacks price/CTA on
  narrow widths; homepage featured bound (6) and listing page size (24)
  unchanged.

## Routes/components affected

- Any surface rendering `PropertyCard` / `PropertyGrid`:
  `/[lang]`, `/[lang]/properties`, `/[lang]/buy`, `/[lang]/rent`,
  property/project/developer/district listing previews.
- Shared: `PropertyCard`, `ListingMediaFrame`, card model helpers.

No new routes, backends, collectors, Windows01, OCR, embeddings, AI backend,
live property sources, or production configuration changes.

## Task-specific verification

**PASS** — `npm run test:property-card` exited 0:

- honest missing-value helpers
- sourced-only location/project/transit
- card evidence-backed field wiring
- media alt contract / no fake imagery
- mapper non-invention checks
- matrix layout affordances + catalog-size bounds unchanged

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:property-card`, accessibility,
responsive, navigation, homepage, listing search/filters/results, and SEO
gates.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated all
66 static pages.

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-09.

## Remaining P1 tasks

**27 tasks remain; none started by this task:**

- M2: P1-10–P1-14
- M3: P1-15–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-09.** P1-10 not started.
