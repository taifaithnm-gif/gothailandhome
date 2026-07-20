# Phase 1 Next.js Quality Audit

**Date:** 2026-07-20  
**Stack:** Next.js 16 App Router (Turbopack build)

---

## 1. App Router structure

| Item | Status |
| --- | --- |
| Locale segment `[lang]` | Present; `generateStaticParams` for en/zh/th |
| Locale root layout owns `<html lang>` | Yes — server-rendered BCP-47 |
| `loading.tsx` / `error.tsx` | `src/app/[lang]/loading.tsx`, `error.tsx` |
| `not-found.tsx` | Locale + root |
| Admin / auth layouts | Isolated from public chrome |

## 2. Metadata stack

| Capability | Implementation | Status |
| --- | --- | --- |
| Titles / descriptions | `buildPageMetadata` + dictionary `meta.*` | Pass |
| Canonical | `alternates.canonical` absolute URL | Pass |
| hreflang | `alternates.languages` en / zh-CN / th / x-default | Pass |
| Open Graph | title, description, url, locale, images | Pass |
| Twitter card | `summary_large_image` | Pass |
| Robots overrides | search/compare/leads noindex; admin noindex | Pass |
| Default OG image | `/og/default.svg` | Pass |

Evidence: `scripts/test-route-metadata-contracts.mjs` — **PASS**.

## 3. robots / sitemap

| Item | Status |
| --- | --- |
| `src/app/robots.ts` | Allow `/`; disallow `/admin`, `/leads` (RC fix) |
| `src/app/sitemap.ts` | Deterministic static + bounded property inventory + content families |
| Drafts / leads excluded from sitemap | Pass |
| Compare excluded (device-state) | Pass |
| Favorites included as feature landing | Intentional (P1-16) |

## 4. JSON-LD / structured data

| Type | Where | Status |
| --- | --- | --- |
| Emitter | `src/components/seo/json-ld.tsx` | Server-safe |
| Builders | `src/lib/seo/schema.ts` | Article, FAQ, breadcrumbs, listing/project types |
| Content parity | `test:content-seo` | Pass — FAQ/article mirror visible content |

## 5. Dynamic vs static

| Pattern | Examples |
| --- | --- |
| SSG locales | about, contact, faq, blog index, guides |
| Dynamic | properties, projects/[slug], properties/[id], search redirect |
| Force-dynamic | `/[lang]/search` (redirect helper) |

## 6. Issues

| ID | Severity | Issue | Action |
| --- | --- | --- | --- |
| NX-1 | P2 | Turbopack NFT warning via content loader ↔ sitemap import trace | Accepted residual |
| NX-2 | P3 | Breadcrumb landmark `aria-label` remains English string | Document only |
| NX-3 | P2 | Lead success/error noindex via metadata; robots now also disallow `/leads` | Fixed robots |

## 7. Verdict

**PASS** — App Router SEO/metadata/boundary contracts meet Phase 1 RC expectations.
