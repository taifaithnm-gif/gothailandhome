# P0 Task 004 Completion Report

**Date:** 2026-07-19
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`
**HEAD baseline:** `eedf3f7` — task modifies working tree only; no commit/push/deploy

## Task ID

**MM-P0-04** — Correct sitemap inventory completeness

## Objective

Include every eligible published (verified) property URL per locale without
unbounded memory/query behavior. Pagination/chunking must be bounded; draft,
unverified, and admin URLs must stay excluded; SEO tests must prove completeness.

## Files modified

1. `src/lib/seo/sitemap-inventory.ts` — **new** pure helpers: bounded page size
   (`500`), max pages (`40`), paging continuation predicate, and localized
   property URL expansion (`entries.length === slugs × locales`).
2. `src/lib/data/properties.ts` — added
   `listPublishedPropertySlugsForSitemap()`: lightweight `slug`-only select,
   `status=published` + `is_verified_listing=true`, deterministic
   `order(slug asc)`, PostgREST `.range()` paging under the 1000-row default cap.
3. `src/app/sitemap.ts` — replaced uncapped `listPublishedProperties` with the
   paged slug inventory + localized URL builder.
4. `scripts/test-seo-performance.mjs` — SEO completeness proofs for paging and
   EN/ZH/TH expansion past the historical ~1000/locale cap.
5. `scripts/test-route-metadata-contracts.mjs` — sitemap contract updated to the
   paged inventory API.
6. `package.json` — `test:seo-performance` runs with `--experimental-strip-types`
   so the pure inventory module can be imported.

No schema changes, no database mutations, no runtime/Windows01 work.

## Sitemap inventory verification

| Check | Result |
| --- | --- |
| Eligible set | published + verified listings only (`status`, `is_verified_listing`) |
| Locale coverage | EN / ZH / TH via `buildLocalizedPropertySitemapEntries` |
| Completeness math | fixture of 1,318 slugs → **3,954** property URLs (1318 × 3) |
| Past PostgREST cap | paging collects full 1,318 with page size 500 (requires ≥3 pages) |
| Boundedness | page size `500` (< 1000); hard ceiling `40` pages (20,000 rows max) |
| Determinism | slug ascending order; pure URL expansion is order-stable |
| Exclusions | no `/admin`, `/leads/`, `/search`, or draft paths in sitemap wiring |
| Uncapped path removed | sitemap no longer calls `listPublishedProperties(` |

## Verification results

**PASS** — SEO suite and route-metadata sitemap contracts green; aggregate suite
includes both.

## Typecheck result

**PASS** — `npm run typecheck` exit 0

## Lint result

**PASS** — `npm run lint` exit 0

## Test result

**PASS** — `npm test` exit 0 (includes updated `test:seo-performance` and
`test:route-metadata`)

## Build result

**PASS** — `npm run build` exit 0

Note: pre-existing Turbopack NFT warning via `src/lib/knowledge/glossary.ts`
remains; not introduced by this task and not fatal.

## Remaining P0 tasks

From `MACMINI_EXECUTION_BACKLOG.md` (not started):

1. **MM-P0-05** — Correct locale document-language semantics

## Stop

MM-P0-04 complete. No additional P0 tasks implemented. No commit. No push. No deploy.
