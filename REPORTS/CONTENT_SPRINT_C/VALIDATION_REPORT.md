# Content Sprint C — Validation Report

Date: 2026-07-26

## Automated suites (all PASS)

| Suite | Focus | Result |
| --- | --- | --- |
| test:knowledge-articles | Routes, approved-only index, 404 enforcement, evidence, metadata, sitemap | PASS |
| test:content-loader | Schema validation, fail-closed drafts, directory scoping | PASS |
| test:content-editorial | Editorial policy checks P1–28 (no invented yields/forecasts) | PASS |
| test:content-seo | Article schema, FAQ schema mirrors visible questions, sitemap families | PASS |
| test:internal-links | Route existence, nav links, related-link resolution, dictionary keys | PASS |
| test:knowledge-center | Hub routes, glossary integrity, no invented yields | PASS |
| test:route-metadata | 23 metadata/schema/robots/sitemap contracts | PASS |
| Full `npm run test` | Entire repository suite | PASS, 0 failures |

## Route validation

- All new content renders via existing dynamic routes; production build compiled every route family without error.
- Knowledge INDEX (21 entries) round-trips through `listKnowledgeArticles()` — every row parses, validates as `approved`, and slug-matches its file.

## Broken link scan

- Component-level: `test:internal-links` verifies related-link targets resolve to real pages.
- Content-level: custom scan validated every `related_links` path (20 articles) and `knowledge_links` path (4 city packages) against the route inventory and article slug set. Result after one fix: **0 broken links**.

## Schema validation

- FAQPage emitted only when visible FAQs exist; questions mirror rendered content (contract-tested).
- JSON-LD payloads escape `<`, `>`, `&`.
- Organization, WebSite, BreadcrumbList, City, District+Place, ApartmentComplex+Residence+ImageObject, Article, FAQPage all emitted from the shared builder module.

## SEO validation

- Unique per-page titles/descriptions from per-locale content.
- Canonical + hreflang emitted by the shared metadata helper on every new page.
- Robots disallows private paths in bare and locale-prefixed forms; sitemap includes all 21 knowledge articles × 3 locales plus city/district/developer/project/property families.

## Residual notes (no action required this sprint)

- 4 pre-existing lint warnings in `scripts/rotate-staging-secrets.mjs` (unused vars) predate this sprint.
- City `image_slots` are data-only until licensed imagery is acquired (per the no-download constraint).
