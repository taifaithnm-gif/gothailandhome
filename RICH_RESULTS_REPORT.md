# RICH_RESULTS_REPORT

**Milestone:** Phase 11 — Google Readiness  
**Date:** 2026-07-16  
**Scope:** Structural JSON-LD validation on crawled pages (not Google Rich Results Test API bulk)

## Summary

| Metric | Value |
|--------|------:|
| Pages with JSON-LD checked | 640 |
| Parse failures | 0 |
| Structural issue pages | 0 |
| Blocking rich-result issues | 0 |
| Warning flags | 682 |

## Eligible types observed

- **BreadcrumbList**: 579 pages
- **RealEstateListing**: 330 pages
- **Apartment**: 330 pages
- **ApartmentComplex**: 100 pages
- **AdministrativeArea**: 96 pages
- **FAQPage**: 63 pages
- **Organization**: 56 pages
- **WebSite**: 3 pages
- **CollectionPage**: 3 pages

## Template expectations

| Page kind | Expected types | Live result |
|-----------|----------------|-------------|
| Home | Organization, WebSite (+ SearchAction) | Organization, WebSite |
| Properties index | CollectionPage | CollectionPage |
| Listing detail | RealEstateListing (+ subtype), BreadcrumbList | RealEstateListing, Apartment, BreadcrumbList |
| Project detail | ApartmentComplex, BreadcrumbList (+ optional FAQPage) | ApartmentComplex, BreadcrumbList |
| Developer detail | Organization, BreadcrumbList | Organization, BreadcrumbList |
| District detail | AdministrativeArea, BreadcrumbList | AdministrativeArea, BreadcrumbList |

## Notable warnings

- `og_image_svg_may_be_ignored_by_some_networks` × 640
- `missing_description` × 42

## Sample failures

- None

## Notes

- Google does not guarantee rich appearance for RealEstateListing / ApartmentComplex; treat as structured-data completeness, not SERP enhancement commitment.
- Default OG image is SVG (`/og/default.svg`) — fine for site branding, weak for some social crawlers; not a JSON-LD blocker.
- FAQPage emitted only when project FAQ content exists.
