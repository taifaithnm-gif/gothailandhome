# Phase 1 Task 012 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-12** — Project detail decision flow

## Objective

Improve navigation through project facts, evidence, units, facilities, nearby
places, FAQ, related listings, and inquiry.

## Files modified

1. `src/lib/projects/visible-faq.ts` — shared visible FAQ helper (locale → en →
   zh → th; empty Q/A omitted) for UI and FAQPage schema parity.
2. `src/lib/seo/schema.ts` — `projectFaqSchema` uses `visibleProjectFaqs`.
3. `src/components/projects/project-lead-form.tsx` — project slug/title context
   (hidden fields + visible enquiry label); analytics includes slug.
4. `src/app/[lang]/projects/actions.ts` — stores inquiry message with
   `Project: {title} ({slug})` context prefix (no DB migration).
5. `src/app/[lang]/projects/[slug]/page.tsx` — on-page section nav; `scroll-mt-24`
   anchors; split `#units` / `#price`; FAQ via shared helper; listing previews
   bounded with `PROJECT_LISTING_PREVIEW_SIZE`; lead form receives project
   context.
6. `src/dictionaries/en.json` / `zh.json` / `th.json` — `sectionNav` and
   `inquiryForProject`.
7. `scripts/test-project-detail-flow.mjs` — P1-12 acceptance contract suite.
8. `package.json` — `test:project-detail-flow` wired into `npm test`.
9. `P1_TASK_012_COMPLETION_REPORT.md` — this report.

## Functional changes

- Project detail exposes a labeled on-page section nav with hash links to
  overview, units, listings, price, map, facilities, nearby, developer,
  verification, related projects, FAQ (when present), and inquiry.
- Sections use `scroll-mt-24` so sticky chrome does not hide anchors; unit types
  and price summary are first-class sections (`#units`, `#price`).
- Facts continue to render through `FactValue` / `VerificationBadge` with
  evidence labels; verification legend unchanged.
- Visible FAQ and FAQPage JSON-LD share `visibleProjectFaqs` so schema matches
  what users see.
- Sale/rent listing previews remain capped at `PROJECT_LISTING_PREVIEW_SIZE`
  (3); related projects remain capped at 6.
- Project lead form and server action include project title/slug context on the
  enquiry without new backend columns.

## Routes/components affected

- `/[lang]/projects/[slug]` — section hierarchy, FAQ rendering, inquiry wiring.
- Components: `ProjectLeadForm`; helpers: `visibleProjectFaqs`,
  `projectFaqSchema`.

Homepage conversion, listing filters/results, property cards, property detail
trust, property media, accessibility, responsive behavior, navigation,
metadata, canonical, hreflang, and non-project JSON-LD contracts are preserved.

## Task-specific verification

**PASS** — `npm run test:project-detail-flow` exited 0:

- section anchors and hierarchy (including `#units`, `#price`, section nav)
- evidence label retention on facts
- FAQ helper + schema wiring parity
- bounded listing / related-project previews
- inquiry project context (form, action, page props)
- EN/ZH/TH dictionary keys

Related targeted suite also passed:

- `npm run test:project-center`

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:project-detail-flow` and all
previous P0/P1 aggregate tests.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated all
66 static pages.

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-12.

## Remaining P1 tasks

**24 tasks remain; none started by this task:**

- M2: P1-13–P1-14
- M3: P1-15–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-12.** P1-13 not started.
