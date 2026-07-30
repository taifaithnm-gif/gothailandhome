# Content Sprint C — SEO Implementation

## Metadata

- All new pages route through the existing `buildPageMetadata` helper: unique title, unique description, canonical URL, hreflang alternates (en/zh/th), OpenGraph, and Twitter Card. Verified by `test:route-metadata` (23 contract checks PASS).
- 20 new knowledge article pages derive metadata from article title/summary per locale — no duplicated titles.
- City pages derive metadata from per-city SEO descriptions in the content packages.

## Robots (`src/app/robots.ts`)

- Disallow list now covers private bases (`/admin`, `/leads`, `/account`, `/auth`, `/partners/app`) in bare, trailing-slash, and locale-prefixed forms (`/en/admin`, `/zh/admin`, `/th/admin`, ...).
- Kept the literal path contract required by `test:route-metadata` (`"/admin"`, `"/admin/"`).
- Sitemap reference and host unchanged.

## Sitemap (`src/app/sitemap.ts`)

- No code change required: knowledge articles are enumerated from the approved-content loader, so all 20 new articles appear automatically across three locales (60 new URLs).
- City and district pages already enumerated per locale.

## Crawlability improvements

- JSON-LD output escaped (`<`, `>`, `&`) preventing script-context breakage on any content.
- FAQ answers are server-rendered inside `<details>` elements — crawlable without JS.
- Every new content page is reachable within 2 clicks from an indexed hub (knowledge index, cities index, developers index).

## hreflang consistency

- All new routes use the shared locale framework; every page emits en/zh/th alternates with matching canonical. All 20 articles ship complete translations (`locale_status: complete` for all three locales), so no fallback-content mismatch.
