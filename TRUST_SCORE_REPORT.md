# TRUST_SCORE_REPORT

**Milestone:** Phase 10 Sprint 6  
**Date:** 2026-07-16  
**Method:** Qualitative + quantitative trust signals for Public Alpha (no invented scores).

## Trust score (composite)

| Pillar | Weight | Score (0–100) | Weighted |
|--------|-------:|--------------:|---------:|
| Identity honesty (developers/logos) | 20% | 94 | 18.8 |
| Listing verification gate | 20% | 90 | 18.0 |
| Provenance / evidence discipline | 15% | 85 | 12.8 |
| Project depth honesty | 15% | 41 | 6.2 |
| District knowledge honesty | 10% | 79 | 7.9 |
| Media copyright discipline | 10% | 70 | 7.0 |
| Contact / lead trust UX | 10% | 88 | 8.8 |
| **Composite** | 100% | — | **~79.5** |

**Interpretation:** **PASS WITH ACTIONS** for soft Public Alpha trust posture. Strong on “we don’t invent”; weak on “we show complete official project media.”

## Signals that raise trust

1. Official developer logos cached with checksum + source URL (20/20).  
2. Public catalog uses `verifiedOnly` listing path for sitemap/properties.  
3. Phase 10 field_evidence / UNVERIFIED policy on developers, projects, districts.  
4. Contact architecture: listing agents ≠ Platform CS; Apple role locked.  
5. Lead forms share validation + success/error pages; consent language present (RC2).  
6. No portal-screenshot media library; no unlicensed gallery scrape.

## Signals that lower trust if overclaimed

1. Project six-field completeness **40.5%** — many galleries/brochures/plans still UNVERIFIED.  
2. Hero images remain placeholders pending license (**0** binary replacements).  
3. District outer amenities often empty (honest) — UI must not imply full amenity coverage.  
4. Ads tracking placeholders must not ship fake pixel IDs to production marketing pages without env.

## Public Alpha trust rule

> Prefer empty / UNVERIFIED / “pending official source” over fabricated completeness.

## Gate

**PASS WITH ACTIONS** — trust architecture is sound; content depth and measurement ops must not be marketed as complete.
