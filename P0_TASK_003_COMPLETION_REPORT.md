# P0 Task 003 Completion Report

**Date:** 2026-07-18
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`
**HEAD baseline:** `eedf3f7` — task modifies working tree only; no commit/push/deploy

## Task ID

**MM-P0-03** — Add regression coverage for current route and metadata contracts

## Objective

Protect home, property, project, developer, district, lead result, metadata,
canonical, OG, JSON-LD, robots, and sitemap contracts at current Alpha scope
with deterministic non-production tests. Failures must name the exact
route/contract. No live data source may be contacted.

## Files modified

Test-only / package wiring. No runtime, route, content, media, or production
data changes.

1. `scripts/test-route-metadata-contracts.mjs` — **new** deterministic regression suite
2. `package.json` — added `test:route-metadata` and included it in the aggregate `test` chain after `test:seo-performance`

## Regression scope

The new suite asserts 20 contracts covering:

| Surface | Contracts checked |
| --- | --- |
| Home `/[lang]` | `generateMetadata`, `buildPageMetadata`, `JsonLd`, `organizationSchema`, `websiteSchema` |
| Properties collection | canonical `/properties`, `collectionPageSchema` |
| Property detail | canonical `/properties/{slug}`, `listingSchema`, breadcrumbs |
| Project detail | metadata + `projectSchema` + breadcrumbs |
| Developer detail | canonical `/developers/{slug}`, `developerSchema` |
| District detail | canonical `/districts/{slug}`, `districtSchema` |
| Lead success/error | canonical paths, `robots.index: false`, result panels |
| Search | noindex + redirect helper |
| Admin | noindex |
| Metadata helper | canonical, hreflang (`en`/`zh-CN`/`th`/`x-default`), OG default image, Twitter card, locale OpenGraph |
| JSON-LD emitter | `application/ld+json` stringify contract |
| Schema builders | all Alpha exporters + key `@type` values |
| Robots | disallow `/admin`, sitemap URL, host |
| Sitemap | full static inventory, verified property/project/developer/district families; excludes admin/leads/search |
| Content fixtures | 50 project + 20 developer manifests |
| Dictionaries | required `meta.*` keys for EN/ZH/TH |
| Local route smoke scripts | Alpha URL shapes + inventory expectations |

Failures are labeled as `route:<path> contract:<name>` or `contract:<name>`.
Site/locale constants are loaded locally via strip-types from `src/config/*`
only — no network and no database.

## Verification results

**PASS**

- `npm run test:route-metadata` — 20/20 checks PASS
- Aggregate `npm test` includes the new suite and remains green

## Typecheck result

**PASS** — `npm run typecheck` exit 0

## Lint result

**PASS** — `npm run lint` exit 0 (0 errors / 0 warnings)

## Test result

**PASS** — `npm test` exit 0 (all prior suites + `test:route-metadata`)

## Build result

**PASS** — `npm run build` exit 0

Note: pre-existing Turbopack NFT warning via `src/lib/knowledge/glossary.ts`
remains; not introduced by this task and not fatal.

## Remaining P0 tasks

From `MACMINI_EXECUTION_BACKLOG.md` (not started):

1. **MM-P0-04** — Correct sitemap inventory completeness
2. **MM-P0-05** — Correct locale document-language semantics

## Stop

MM-P0-03 complete. No additional P0 tasks implemented. No commit. No push. No deploy.
