# Content Sprint C — FAQ Implementation

## Reusable FAQ libraries (new)

- `content/areas/faq-library.json` — 5 templated Q&As with `{area}` / `{city}` placeholders (foreign ownership, verified listings, pre-purchase checks, financing, taxes).
- `content/developers/faq-library.json` — 5 templated Q&As with `{developer}` placeholder (verification, affiliation, buying process, foreign buyers, inventory completeness).

Both are loaded through the new `src/lib/content/shared-faq.ts` module, which localizes and interpolates entity names via the existing `fillTemplate` utility.

## Attachment points

| Page type | FAQ source | Schema |
| --- | --- | --- |
| District pages (`/districts/[slug]`) | Area FAQ library, area/city name interpolated | FAQPage |
| Developer pages (`/developers/[slug]`) | Developer FAQ library, developer name interpolated | FAQPage |
| City pages (`/cities/[slug]`) | Per-city FAQ in city package | FAQPage |
| Knowledge articles (`/knowledge/articles/[slug]`) | Per-article FAQ in article JSON | FAQPage |
| Project pages (`/projects/[slug]`) | Buyer-guide link block to knowledge FAQs (avoids duplicate FAQ blocks per building) | — |

## Duplicate avoidance

- Templated libraries mean one canonical wording per question; entity names are interpolated, so no near-duplicate FAQ files exist per area/developer.
- City FAQ content is city-specific (written per city), while district pages use the shared area library — the two sets do not overlap in wording.
- Project pages intentionally link to knowledge articles instead of embedding a repeated FAQ block on hundreds of project pages.
- FAQPage JSON-LD mirrors only visible questions (verified by `test:content-seo`).
