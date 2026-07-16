# SEO_REPORT

**Milestone:** Phase 9 M5 — SEO + Performance Polish  
**Date:** 2026-07-16  
**Scope:** Homepage · Search · Listing (properties index + detail) · Project · Developer · District  
**Policy:** Titles, meta, OG, canonical, and schema derived only from real sourced fields. No invented facts, yields, or logos.

## Surface checklist

| Surface | Title | Meta | Canonical + hreflang | Open Graph | Schema.org JSON-LD | Images |
|---------|-------|------|----------------------|------------|--------------------|--------|
| Homepage `/[lang]` | ✅ dict | ✅ dict | ✅ | ✅ default `/og/default.svg` | ✅ `Organization` + `WebSite` (+ SearchAction → `/properties`) | Default OG card |
| Search `/[lang]/search` | ✅ | ✅ (updated copy) | ✅ | ✅ default OG | — (redirect helper) | N/A |
| Listings `/[lang]/properties` | ✅ | ✅ | ✅ (base path; filters not in canonical) | ✅ default OG | ✅ `CollectionPage` | Card media reserved aspect |
| Listing detail `/[lang]/properties/[id]` | ✅ template | ✅ summary | ✅ | ✅ cover when present, else default | ✅ `RealEstateListing` + type + `BreadcrumbList` | Cover → OG; gallery LCP priority |
| Project `/[lang]/projects/[slug]` | ✅ seoTitle | ✅ seoDescription | ✅ | ✅ project OG / placeholder | ✅ `ApartmentComplex` + `BreadcrumbList` + `FAQPage` when FAQ exists | Hero `priority` + `sizes` |
| Developer `/[lang]/developers/[slug]` | ✅ seoTitle | ✅ seoDescription | ✅ | ✅ logo when present, else default | ✅ `Organization` + `BreadcrumbList` | Logo only if real URL |
| District `/[lang]/districts/[slug]` | ✅ seoTitle | ✅ seoDescription | ✅ | ✅ default OG | ✅ `AdministrativeArea` + `BreadcrumbList` | No invented district imagery |

## What changed in M5

1. **`buildPageMetadata`** always emits OG + Twitter images (default branded `/og/default.svg`; optional `image` override).
2. **JSON-LD** via `JsonLd` + `src/lib/seo/schema.ts` on the six in-scope surfaces (Search excluded as noindex redirect).
3. **Search** marked `robots: noindex, follow` and removed from sitemap; canonical results remain `/properties`.
4. **`robots.txt`** disallows `/admin`; admin layout metadata is `noindex`.
5. **Listing OG** uses `coverUrl` when available.
6. **Search meta copy** no longer says “placeholder listings”.

## Still honest gaps (RC2 prep)

| Gap | Status |
|-----|--------|
| Root `<html lang>` defaults to `en` (client + wrapper `lang` patch for locales) | Known; avoided `headers()` in root layout to preserve ISR caching |
| Sitemap listing coverage still capped by PostgREST page size (~1000 / locale) | Unchanged from RC1 |
| Many listings still lack licence-clean cover media → OG falls back to default card | Expected under media freeze |
| Project OG often `/og/projects/placeholder.svg` until official hero media | Unchanged policy |
| Keywords meta not added | Avoided keyword stuffing; tokens remain in titles/descriptions |

## Verification

- `npm run test:seo-performance` — structural guards for schema builders, JsonLd wiring, OG default, robots/admin, LCP attrs.
- Manual crawl of live HTML recommended in RC2 for Google Rich Results validation.

## RC2 readiness note

M5 closes the P1 structured-data / default-OG / admin-robots holes called out in `SEO_TECHNICAL_AUDIT_REPORT.md` for the Alpha surfaces above. Remaining SEO work for RC2 is operational (sitemap pagination, real media, `html lang` without dynamic root) rather than missing page metadata.
