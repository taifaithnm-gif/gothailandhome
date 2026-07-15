# SEO Technical Audit Report

**Date:** 2026-07-15  
**Scan host:** `http://127.0.0.1:3456`

## Metadata

| Check | Result |
|-------|--------|
| Titles | Present on public pages scanned |
| Meta description | Present via `buildPageMetadata` |
| Canonical | Absolute `https://www.gothailandhome.com/...` present |
| Hreflang alternates | Present (en / zh-CN / th / x-default) |
| OpenGraph title/description/url | Present |
| Twitter card | summary_large_image via metadata helper |
| JSON-LD / schema.org | **Absent (0)** on scanned pages |
| Viewport | Present |

## Canonical nuances

- `/en/properties?listingType=sale|rent` canonicalizes to `/en/properties` (filter not reflected) — acceptable if intentional, but weak for Buy/Rent SEO landing pages.

## OpenGraph

- Basic website OG OK.
- Project pages support OG images when page renders; crashing projects yield no OG.
- Listing pages lack rich image OG in many cases due to missing media.

## Sitemap

- `/sitemap.xml` returns 200; large (~741KB).
- Includes locale static paths: home, properties, projects, cities, developers, search, about, contact + entities.
- **Missing:** find-my-home, list-your-property, partners/developers, partners/agencies.
- Admin correctly not included.

## Robots

```
User-Agent: *
Allow: /
Host: www.gothailandhome.com
Sitemap: https://www.gothailandhome.com/sitemap.xml
```

**Gap:** `/admin` not disallowed / no `noindex` observed on admin HTML.

## International SEO

- Path-prefix locales work (`/en`, `/zh`, `/th`).
- `<html lang>` server HTML remains `en` (client patch) — SEO risk for locale classifiers.

## Structured data gap (P1)

Needed before public alpha marketing:
- `RealEstateListing` / `Apartment` / `Product` for listings
- `Residence` / `ApartmentComplex` for projects
- `Organization` / `RealEstateAgent` for platform (not as listing owner)
- `BreadcrumbList`

## Lighthouse SEO category

- Home: **100**
- Properties: **100** (despite performance issues)

## Broken / thin URL risks

- Many project URLs in sitemap may 500 → crawl budget / soft damage (P0).
- Knowledge URLs not present.
