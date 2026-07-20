# Phase 1 Task 010 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-10** — Property detail trust and inquiry hierarchy

## Objective

Strengthen detail-page evidence presentation, contact-role separation, and
inquiry CTAs.

## Files modified

1. `src/lib/property/listing-trust.ts` — **new** presentation helpers for
   freshness bands (30/90-day), price-as-current gate, honest unknown values,
   and listing-scoped inquiry/escalation context.
2. `src/app/[lang]/properties/[id]/page.tsx` — trust-aware price caption /
   freshness messaging; muted unknown facts; source evidence block; passes
   listing id/slug/title into contact card; keeps `listingSchema` + breadcrumbs.
3. `src/components/property/listing-contact-card.tsx` — distinct listing /
   viewing / platform blocks; listing-scoped escalation href; inquiry heading.
4. `src/components/property/viewing-request-form.tsx` — hidden
   `property_id` / `property_slug` / `property_title` plus visible listing title
   context.
5. `src/components/marketplace/contact-blocks.tsx` — optional
   `escalationHref` for listing-scoped platform help (still not ownership).
6. `src/app/[lang]/marketplace/actions.ts` — viewing lead payload stores
   `property_slug` and `property_title` with existing role flags.
7. `src/dictionaries/en.json` / `zh.json` / `th.json` — inquiry and freshness /
   price-as-of copy keys.
8. `scripts/test-property-detail-trust.mjs` — **new** P1-10 contract suite.
9. `package.json` — `test:property-detail` wired into aggregate `npm test`.
10. `P1_TASK_010_COMPLETION_REPORT.md` — this report.

## Functional changes

- Listing owner/agent block and platform support remain separate surfaces;
  platform escalation never substitutes as listing contact.
- Price is marked current only when the listing is verified and
  `last_verified_at` is within 30 days; otherwise an as-of / not-current
  caption and freshness message are shown.
- Missing facts render as `Unknown` with de-emphasized styling (not promoted).
- Viewing request and platform escalation CTAs carry listing context
  (id, slug, title; contact link includes `?property=<slug>`).
- Metadata / JSON-LD `listingSchema` and breadcrumb contracts remain in place.

## Routes/components affected

- `/[lang]/properties/[id]` — detail trust hierarchy and inquiry aside.
- Shared: `ListingContactCard`, `ViewingRequestForm`,
  `PlatformCustomerSuccess`, marketplace viewing lead action.

No new routes, collectors, OCR, embeddings, AI runtime services, Windows01,
live property sources, or production configuration changes. Gallery work is
deferred to P1-11.

## Task-specific verification

**PASS** — `npm run test:property-detail` exited 0:

- freshness bands and price-current gate
- listing inquiry context / escalation path
- role separation and non-promotion of stale price
- viewing form + lead payload listing context
- EN/ZH/TH trust/inquiry dictionary keys
- JSON-LD listing schema presence

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:property-detail`, contact-role,
marketplace forms, property-card, listing filters/results, accessibility,
responsive, navigation, homepage, and SEO/route-metadata gates.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated all
66 static pages.

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-10.

## Remaining P1 tasks

**26 tasks remain; none started by this task:**

- M2: P1-11–P1-14
- M3: P1-15–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-10.** P1-11 not started.
