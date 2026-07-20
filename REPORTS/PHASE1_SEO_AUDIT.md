# Phase 1 SEO Audit

**Date:** 2026-07-20  
**Evidence:** `test:content-seo`, `test:route-metadata`, `test:seo-performance`, `test:internal-links`

---

## 1. Titles & descriptions

All audited public routes use `buildPageMetadata` with dictionary `meta.*` keys across EN/ZH/TH — **PASS**.

## 2. Canonical / hreflang / OG

| Signal | Status |
| --- | --- |
| Absolute canonical | Pass |
| hreflang en / zh-CN / th / x-default | Pass |
| Open Graph + Twitter | Pass |
| Default OG fallback | `/og/default.svg` |

## 3. Structured data

| Surface | Schema | Status |
| --- | --- | --- |
| Knowledge / blog detail | Article | Pass — mirrors visible |
| FAQ hub | FAQPage | Pass — question parity |
| Guides | Metadata + breadcrumb schema | Pass |
| Listings / projects | Existing schema builders | Pass (route-metadata) |

## 4. Sitemap & robots

| Rule | Status |
| --- | --- |
| Approved content families only | Pass |
| No `/leads/` in sitemap | Pass |
| Property inventory bounded | Pass |
| robots disallow admin + leads | Pass (RC: leads added) |
| Favorites in sitemap | Intentional feature landing |

## 5. Internal links & breadcrumbs

| Check | Status |
| --- | --- |
| No orphan Phase 1 public routes | Pass (`test:internal-links`) |
| Knowledge/blog/guides wire related links | Pass |
| Breadcrumb visible ↔ schema | Pass on content surfaces |

## 6. Knowledge / blog / guides / FAQ

| Surface | Indexable when approved | Drafts excluded |
| --- | --- | --- |
| Knowledge articles | Yes | Yes |
| Blog | Yes | Yes |
| Investment / legal guides | Yes | Loader-enforced |
| FAQ | Yes | Yes |

## 7. Issues

| ID | Severity | Issue |
| --- | --- | --- |
| SEO-1 | P2 | Favorites is sitemap-listed while largely client-state (accepted Phase 1 product choice) |
| SEO-2 | P3 | Default OG is SVG brand card — adequate for RC, richer per-entity OG optional later |

## 8. Verdict

**PASS** — SEO contracts for Phase 1 content and catalog discovery meet RC bar.
