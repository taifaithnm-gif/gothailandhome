# Content Sprint C — Knowledge Content Implemented

20 new knowledge articles were implemented under `content/knowledge/articles/`, each fully trilingual (EN/ZH/TH) with title, summary, 5–6 body paragraphs, 2–3 FAQ entries, related links, verified sources, and `publish_ready: true`. The article INDEX was rebuilt to 21 entries (20 new + existing `bts-skytrain-overview`).

## Articles

| Slug | Topic |
| --- | --- |
| thailand-property-buying-guide | Step-by-step buying process for foreigners |
| foreign-ownership-thailand | Legal framework for foreign ownership |
| thailand-condo-guide | Condo quota, fees, inspection checklist |
| freehold-vs-leasehold-thailand | Ownership structure comparison |
| thailand-property-transfer-guide | Land Department transfer process |
| thailand-property-tax-guide | Taxes and fees: buy, hold, sell |
| thailand-land-building-tax | Annual land and building tax |
| thailand-mortgage-guide | Financing options for foreigners |
| thailand-property-investment-basics | Investment evaluation framework (no forecasts) |
| rental-investment-thailand | Rental rules, taxes, management |
| thailand-property-roi-guide | ROI/yield calculation methodology |
| thailand-property-selling-guide | Selling process and fund repatriation |
| thailand-visa-guide | Long-stay visa routes for buyers |
| thailand-retirement-guide | Retirement visas, housing, healthcare, estate |
| thailand-healthcare-guide | Hospital system, insurance planning |
| thailand-education-guide | International schools landscape |
| family-living-thailand | Family relocation and housing framework |
| thailand-luxury-condo-guide | Luxury segment definition and due diligence |
| thailand-developer-guide | Developer due-diligence framework |
| thailand-area-selection-guide | Location selection framework |

## Rendering pipeline extensions

- `src/lib/content/types.ts` / `validate.ts`: added `KnowledgeFaqItem` and `KnowledgeRelatedLink` types with `coerceFaqItems` / `coerceRelatedLinks` validators.
- `src/lib/content/loader.ts`: `renderKnowledgeArticleLocale` now returns localized `faq` and `relatedLinks`.
- `src/app/[lang]/knowledge/articles/[slug]/page.tsx`: renders FAQ accordion + related-links section and emits FAQPage schema when FAQs exist.

## Editorial policy

All articles restrict themselves to statutory facts and process descriptions attributable to official sources (Department of Lands, Revenue Department, Immigration Bureau, BOI, Bank of Thailand, ISAT, DBD, SET). No invented statistics, yields, or price forecasts. Verified dates: 2026-07-26.
