# Glossary

Bangkok terminology foundation for Property Factory (Phase 6 M1).

## Files

| File                     | Purpose                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `districts-bangkok.json` | 50 Bangkok district names EN/ZH/TH + postal context                                                         |
| `terms.json`             | Controlled vocabularies for transit, facilities, schools, hospitals, shopping, property types, source codes |

## `terms.json` sections

- `transit_tags` — BTS / MRT lines / ARL / boat / expressway
- `facilities` — common condo amenities
- `schools` — school category labels
- `hospitals` — hospital / clinic categories
- `shopping` — mall / market / convenience
- `property_types` — condo / house / villa / land / commercial
- `source_codes` — Import Pipeline V2 allow-list codes

## Rules

- Codes are kebab-case ASCII; display names are EN/ZH/TH.
- Do not invent district yields or POI facts in glossary — names only.
- Keep `content/taxonomy/property-types.json` aligned with `terms.json.property_types` codes.
