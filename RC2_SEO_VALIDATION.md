# RC2_SEO_VALIDATION

**Date:** 2026-07-16  
**Server:** `http://127.0.0.1:3040`  
**HEAD:** `e3a5a9a` (includes Phase 9 M5)

## Checklist (scoped Alpha surfaces)

| Surface | Title | Meta | Canonical | Hreflang | OG | Twitter | JSON-LD |
|---------|-------|------|-----------|----------|----|---------|---------|
| Homepage | PASS | PASS | PASS www | PASS | PASS default SVG | PASS | Organization + WebSite |
| Search | PASS* | PASS* | — (redirect) | — | — | — | N/A (noindex redirect) |
| Properties index | PASS | PASS | PASS (base path) | PASS | PASS | PASS | CollectionPage |
| Listing detail | PASS | PASS | PASS | PASS | PASS (cover or default) | PASS | RealEstateListing + BreadcrumbList |
| Project detail | PASS | PASS | PASS | PASS | PASS (project/placeholder) | PASS | ApartmentComplex (+ FAQ) + BreadcrumbList |
| Developer detail | PASS | PASS | PASS | PASS | PASS | PASS | Organization + BreadcrumbList |
| District detail | PASS | PASS | PASS | PASS | PASS | PASS | AdministrativeArea + BreadcrumbList |

\*Search metadata exists for the brief window before redirect; robots `noindex,follow`; removed from sitemap.

## Robots

```
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Host: www.gothailandhome.com
Sitemap: https://www.gothailandhome.com/sitemap.xml
```

Admin layout: `robots: noindex,nofollow`.

## Sitemap

| Metric | Observed @ RC2 |
|--------|----------------|
| HTTP | 200 |
| Approx `<loc>` count | **3456** |
| `/en/properties/*` URLs | **~1000** (PostgREST / list cap) |
| Marketplace / knowledge / buy / rent | Present |
| `/search` | Absent (intentional) |

**Gap (P1):** Paginate sitemap listing generation so all ~1318 published URLs are covered per locale.

## HTML lang

| Layer | Status |
|-------|--------|
| Root `<html lang>` | Defaults to `en` |
| Locale wrapper `lang` + client patch | Present (`zh-CN` / `th` observed on `/zh`) |

**Gap (P1):** True per-locale root `html[lang]` without forcing full-tree dynamic rendering.

## Structural tests

`npm run test:seo-performance` → **PASS**
