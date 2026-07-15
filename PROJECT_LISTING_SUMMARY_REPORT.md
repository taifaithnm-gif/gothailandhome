# PROJECT_LISTING_SUMMARY_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.5 — Project Detail Alpha

## Behavior

- Listings loaded with `listPublishedPropertiesPaged({ projectSlug, listingType, verifiedOnly: true, pageSize: 3 })`
- Sale and rent sections are separate, each with count + “view all” link:
  - `/[lang]/properties?project={slug}&listing_type=sale|rent`
- Listing prices are disclosed as **current published listing data**, not developer official project prices
- Price summary min/max requires `MIN_PRICE_SUMMARY_SAMPLE = 3` verified listings; otherwise “insufficient sample”

## First-HTML bounds (measured 2026-07-16, `next start` :3020)

| Project | HTML bytes | Listing cards in HTML |
|---------|------------|------------------------|
| ashton-asoke (dense) | 182,117 | 6 (≤3 sale + ≤3 rent) |
| the-livin-ramkhamhaeng | 185,661 | 6 |
| 168-sukhothai-residences (sparse) | 99,591 | 0 |

Route-check aggregate: min 99,591 · max 185,661 · avg ~149,909 bytes across 50 projects.

## Integrity

Full-catalog listing serialization **not** used on project detail. Package source counts unchanged (see PROJECT_DATA_INTEGRITY_REPORT).

## Overall

# PASS — Bounded listing summary
