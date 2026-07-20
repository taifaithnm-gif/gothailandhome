# Phase 1 Task 018 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-18** — Property comparison page and controls

## Objective

Add compare controls and a localized side-by-side comparison page.

## Files modified

1. `src/components/compare/compare-provider.tsx` — hydration-safe
   `CompareProvider` / `useCompare` over the P1-17 local-device contract
   (`useSyncExternalStore`); exposes count/isFull/max and prune.
2. `src/components/compare/compare-button.tsx` — add/remove control with
   `aria-pressed`, live region, `data-compare-state`, disabled-at-max guard.
3. `src/components/compare/compare-view.tsx` — client comparison board:
   resolve slugs, responsive/accessible `<table>` on approved fields,
   missing→unknown, two-to-four bound, removed/unpublished handling + prune.
4. `src/app/[lang]/compare/page.tsx` — localized page + metadata; `noindex`
   because it is state-dependent.
5. `src/app/[lang]/compare/actions.ts` — `resolveCompareProperties` server
   action (published-only resolution).
6. `src/lib/compare/index.ts` — added `COMPARE_MIN_ITEMS = 2` (two-to-four).
7. `src/components/property/property-card.tsx` — CompareButton on card media.
8. `src/app/[lang]/properties/[id]/page.tsx` — CompareButton on listing key
   summary alongside the favorite control.
9. `src/app/[lang]/layout.tsx` — wraps shell with `CompareProvider`.
10. `src/lib/navigation/site-nav.ts` — `/compare` browse nav entry.
11. `src/dictionaries/en.json` / `zh.json` / `th.json` — `nav.compare`,
    `meta.compare*`, `compare.*` copy.
12. `scripts/test-compare-ui.mjs` — P1-18 acceptance contract suite.
13. `scripts/test-compare-state.mjs` — removed the temporal “compare page must
    not exist yet” guard now that P1-18 adds the page (P1-17 contract checks
    otherwise unchanged).
14. `package.json` — `test:compare-ui` wired into `npm test`.
15. `P1_TASK_018_COMPLETION_REPORT.md` — this report.

## Functional changes

- Accountless add/remove compare controls on property cards and detail.
- Controls announce selected/unselected/full state; disabled when the bounded
  selection (max 4) is full; hydration-safe provider.
- Localized `/[lang]/compare` renders a side-by-side table for two-to-four
  selections on the G-PRODUCT-COMPARE approved allowlist only; each rendered
  row is guarded by `isApprovedCompareField`.
- Missing facts render as unknown (never zero); unsourced prices show unknown.
- Fewer than two selections prompt to add more; removed/unpublished slugs show
  as unavailable and are pruned from local storage.
- Page is `noindex` (state-dependent) and intentionally excluded from sitemap.

## Routes/components affected

- `/[lang]/compare` — new comparison page (EN/ZH/TH), noindex.
- Components: `CompareProvider`, `CompareButton`, `CompareView`,
  `PropertyCard` (control), property detail key summary (control).
- Site nav browse group.

Preserved: favorites state/UI; homepage conversion; listing filters/results;
property card decision fields; property detail trust; property media;
project/developer/district detail flows; accessibility; responsive behavior;
navigation; metadata; canonical; hreflang; JSON-LD. No Windows01, live
collectors, OCR, embeddings, AI runtime, or production-config changes.

## Task-specific verification

**PASS** — `npm run test:compare-ui` exited 0:

- controls announce state and are hydration-safe
- cards and detail expose compare controls
- page is noindex and localized with metadata
- table compares two-to-four on approved fields
- missing values are unknown, never zero
- no blocked investment-claim fields in view
- removed/unpublished handled and pruned
- nav + layout wiring
- state-dependent compare route stays out of sitemap
- EN/ZH/TH metadata and copy keys

Related suites also passed: `test:compare-state`, `test:navigation`,
`test:property-card`, `test:accessibility`, `test:responsive`.

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:compare-ui` and all previous
P0/P1 aggregate tests.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated
routes including `/[lang]/compare` (en/zh/th).

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-18.

## Remaining P1 tasks

**18 tasks remain; none started by this task:**

- M3: P1-19–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-18.** P1-19 begins next per the continuous execution plan.
