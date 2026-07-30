# Content Sprint C — Area Implementation

Complete landing content was implemented for the four target cities, rendered by the upgraded `/[lang]/cities/[slug]` route.

## City content packages (new)

- `content/cities/bangkok.json`
- `content/cities/pattaya.json`
- `content/cities/phuket.json`
- `content/cities/chiang-mai.json`

Each package is trilingual and contains: summary, overview, lifestyle, transportation, schools, hospitals, shopping, investment_summary, rental_summary, faq, knowledge_links, image_slots, and verified sources.

## Rendering (reused framework)

- New loader `src/lib/cities/package.ts` mirrors the district package pattern (reuses `normalizeAmenities` / `normalizeSources` exported from `src/lib/districts/package.ts`).
- `src/app/[lang]/cities/[slug]/page.tsx` now renders, conditionally on content: Overview, Districts, Projects, Listings, Lifestyle, Transportation, Schools, Hospitals, Shopping, Investment/Rental summary, FAQ, and Guides & Sources sections.
- JSON-LD: `City` schema + `BreadcrumbList` + `FAQPage` (when FAQs exist).
- Section labels added to all three dictionaries (`cities.*` keys in en/zh/th).

## Section coverage per requirement

| Required section | Implementation |
| --- | --- |
| Overview | `overview` paragraphs |
| Lifestyle | `lifestyle` paragraphs |
| Transportation | amenity cards with source notes |
| Schools | amenity cards with source notes |
| Hospitals | amenity cards with source notes |
| Shopping | amenity cards with source notes |
| Investment | `investment_summary` card (framework language, no yield promises) |
| Rental Market | `rental_summary` card |
| FAQ | city FAQ + shared area FAQ library |
| Internal Links | `knowledge_links` to knowledge articles + district/project grids |
| SEO | unique title/description via `buildPageMetadata`, canonical + hreflang |
| Schema | City, BreadcrumbList, FAQPage |
| Suggested image slots | `image_slots` array (id, description, suggested dimensions) reserved for future local media |
