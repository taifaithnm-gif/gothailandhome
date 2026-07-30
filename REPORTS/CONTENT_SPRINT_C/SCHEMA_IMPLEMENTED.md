# Content Sprint C — Schema Implementation

All structured data flows through the shared utilities in `src/lib/seo/schema.ts` and the `JsonLd` emitter — no duplicated schema logic.

## New / extended builders

| Builder | Change |
| --- | --- |
| `citySchema` | NEW — `City` type for city landing pages |
| `imageObjectSchema` | NEW — `ImageObject` with url/caption/width/height |
| `districtSchema` | Extended with `containsPlace` mapping amenities to `School`, `Hospital`, `ShoppingCenter`, `TrainStation` Place subtypes |
| `projectSchema` | Extended with `additionalType: schema.org/Residence` and `photo` as `ImageObject` |
| `platformFaqSchema` | Reused for knowledge articles, districts, developers, cities |

## Coverage by requirement

| Required type | Where emitted |
| --- | --- |
| FAQPage | Knowledge articles, district pages, developer pages, city pages (when FAQs exist) |
| BreadcrumbList | All detail routes (existing + new city/knowledge pages) |
| Residence | Project pages via `additionalType` on ApartmentComplex |
| Apartment / ApartmentComplex | Project pages (existing, retained) |
| ImageObject | Project `photo` property + `imageObjectSchema` utility |
| Place | District `containsPlace` amenity entries |
| Organization | Homepage (existing, retained) |
| WebSite | Homepage (existing, retained) |

## Safety

- `src/components/seo/json-ld.tsx` now escapes `<`, `>`, `&` in serialized JSON-LD, preventing HTML/script-context injection from content strings.
- FAQPage schema mirrors visible questions only (contract-tested).
