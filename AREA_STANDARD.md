# Area Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only

Defines geography content: **City**, **District**, **Subdistrict**, and optional marketing **Area**. These power SEO hubs and filters at 1M+ listing scale.

Official Thai hierarchy preferred: City/Province → District (khet/amphoe) → Subdistrict (khwaeng/tambon). Marketing areas (e.g. Sukhumvit) may span districts.

---

## 1. City

| Field                                       | Description     | Type           | Req | Validation                         | Example   | Translation | Source          | Editable | Searchable | Indexable |
| ------------------------------------------- | --------------- | -------------- | --- | ---------------------------------- | --------- | ----------- | --------------- | -------- | ---------- | --------- |
| `slug`                                      |                 | slug           | Y   | unique                             | `bangkok` | none        | required        | admin    | Y          | Y         |
| `name`                                      |                 | i18n_string    | Y   |                                    | Bangkok   | i18n        | required        | admin    | Y          | Y         |
| `summary`                                   | Intro           | i18n_text      | C   | lifestyle ok; no fake stock counts |           | i18n        | optional        | admin    | Y          | N         |
| `population`                                |                 | int            | N   | + source                           |           | none        | optional        | admin    | N          | Y         |
| `population_as_of`                          |                 | date           | C   | if population                      |           | none        | optional        | admin    | N          | N         |
| `population_source_url`                     |                 | url            | C   | if population                      |           | none        | required if pop | admin    | N          | N         |
| `lifestyle`                                 |                 | i18n_text      | N   |                                    |           | i18n        | optional        | admin    | Y          | N         |
| `transportation` / `transportation_summary` |                 | i18n_text/json | N   |                                    |           | i18n        | optional        | admin    | Y          | N         |
| `investment` / `investment_summary`         |                 | i18n_text/json | N   | disclaimer if yield                |           | i18n        | optional        | admin    | Y          | N         |
| `rental` / `rental_summary`                 |                 | i18n_text      | N   |                                    |           | i18n        | optional        | admin    | Y          | N         |
| `projects`                                  | Linked          | derived        | N   | from inventory                     |           | none        | derived         | system   | Y          | Y         |
| `schools` / `hospitals` / `shopping`        | City-level POIs | json           | N   | curated short lists                |           | i18n        | optional        | admin    | Y          | Y         |
| `google_maps_url`                           |                 | url            | N   |                                    |           | none        | optional        | admin    | N          | N         |
| `centroid`                                  |                 | geo_point      | N   |                                    |           | none        | optional        | admin    | N          | Y         |
| `seo_title` / `seo_description`             |                 | i18n_*         | Y   |                                    |           | i18n        | derived         | admin    | N          | N         |
| `is_active`                                 |                 | bool           | Y   |                                    | true      | none        | system          | admin    | N          | Y         |
| `sources`                                   |                 | json           | C   | if stats                           |           | none        | optional*       | admin    | N          | N         |

---

## 2. District

| Field                           | Description     | Type             | Req | Validation                     | Example     | Translation | Source    | Editable | Searchable | Indexable |
| ------------------------------- | --------------- | ---------------- | --- | ------------------------------ | ----------- | ----------- | --------- | -------- | ---------- | --------- |
| `slug`                          |                 | slug             | Y   | unique                         | `bang-kapi` | none        | required  | admin    | Y          | Y         |
| `city_slug`                     | Parent          | slug             | Y   |                                | bangkok     | none        | required  | admin    | Y          | Y         |
| `name`                          |                 | i18n_string      | Y   | glossary                       | Bang Kapi   | i18n        | required  | admin    | Y          | Y         |
| `summary`                       |                 | i18n_text        | C   |                                |             | i18n        | optional  | admin    | Y          | N         |
| `population`                    |                 | int              | N   | + source                       |             | none        | optional  | admin    | N          | Y         |
| `lifestyle`                     |                 | i18n_text / tags | N   |                                |             | i18n        | optional  | admin    | Y          | Y         |
| `transportation`                | Overview + POIs | i18n_text/json   | N   |                                |             | i18n        | optional  | admin    | Y          | Y         |
| `investment`                    | Market note     | i18n_text/json   | N   | sourced/editorial flag         |             | i18n        | optional  | admin    | Y          | N         |
| `rental`                        | Rental note     | i18n_text        | N   |                                |             | i18n        | optional  | admin    | Y          | N         |
| `projects`                      |                 | derived          | N   | published projects in district |             | none        | derived   | system   | Y          | Y         |
| `schools`                       |                 | json             | N   |                                |             | i18n        | optional  | admin    | Y          | Y         |
| `hospitals`                     |                 | json             | N   |                                |             | i18n        | optional  | admin    | Y          | Y         |
| `shopping`                      |                 | json             | N   | malls/retail                   |             | i18n        | optional  | admin    | Y          | Y         |
| `google_maps_url`               |                 | url              | N   |                                |             | none        | optional  | admin    | N          | N         |
| `centroid`                      |                 | geo_point        | N   |                                |             | none        | optional  | admin    | N          | Y         |
| `seo_title` / `seo_description` |                 | i18n_*           | Y   |                                |             | i18n        | derived   | admin    | N          | N         |
| `is_active`                     |                 | bool             | Y   |                                |             | none        | system    | admin    | N          | Y         |
| `sort_order`                    |                 | int              | N   |                                |             | none        | system    | admin    | N          | Y         |
| `sources`                       |                 | json             | C   |                                |             | none        | optional* | admin    | N          | N         |

Bangkok districts are first-class SEO and filter keys for L3 listings.

---

## 3. Subdistrict

| Field                           | Description | Type        | Req | Validation | Example   | Translation   | Source   | Editable | Searchable | Indexable |
| ------------------------------- | ----------- | ----------- | --- | ---------- | --------- | ------------- | -------- | -------- | ---------- | --------- |
| `slug`                          |             | slug        | Y   | unique     | `hua-mak` | none          | required | admin    | Y          | Y         |
| `district_slug`                 | Parent      | slug        | Y   |            | bang-kapi | none          | required | admin    | Y          | Y         |
| `name`                          |             | i18n_string | Y   |            | Hua Mak   | i18n/glossary | required | admin    | Y          | Y         |
| `summary`                       |             | i18n_text   | N   |            |           | i18n          | optional | admin    | Y          | N         |
| `google_maps_url`               |             | url         | N   |            |           | none          | optional | admin    | N          | N         |
| `seo_title` / `seo_description` |             | i18n_*      | N   |            |           | i18n          | optional | admin    | N          | N         |

Use when address precision helps projects (e.g. Hua Mak). Optional for listings if district is enough.

---

## 4. Marketing Area

| Field                                | Description | Type           | Req | Validation                          | Example     | Translation | Source   | Editable | Searchable | Indexable |
| ------------------------------------ | ----------- | -------------- | --- | ----------------------------------- | ----------- | ----------- | -------- | -------- | ---------- | --------- |
| `slug`                               |             | slug           | Y   | unique                              | `sukhumvit` | none        | required | admin    | Y          | Y         |
| `name`                               |             | i18n_string    | Y   |                                     | Sukhumvit   | i18n        | required | admin    | Y          | Y         |
| `city_slug`                          |             | slug           | Y   |                                     | bangkok     | none        | required | admin    | Y          | Y         |
| `district_slugs`                     | Members     | string[]       | C   | known districts                     |             | none        | optional | admin    | Y          | Y         |
| `summary`                            |             | i18n_text      | C   |                                     |             | i18n        | optional | admin    | Y          | N         |
| `lifestyle`                          |             | i18n_text      | N   |                                     |             | i18n        | optional | admin    | Y          | Y         |
| `transportation`                     |             | i18n_text/json | N   |                                     |             | i18n        | optional | admin    | Y          | Y         |
| `investment`                         |             | i18n_text/json | N   |                                     |             | i18n        | optional | admin    | Y          | N         |
| `rental`                             |             | i18n_text      | N   |                                     |             | i18n        | optional | admin    | Y          | N         |
| `projects`                           |             | derived        | N   | intersection/union rules documented |             | none        | derived  | system   | Y          | Y         |
| `schools` / `hospitals` / `shopping` |             | json           | N   |                                     |             | i18n        | optional | admin    | Y          | Y         |
| `google_maps_url`                    | Viewport    | url            | N   |                                     |             | none        | optional | admin    | N          | N         |
| `bounds`                             | GeoJSON     | json           | N   |                                     |             | none        | optional | admin    | N          | Y         |
| `seo_title` / `seo_description`      |             | i18n_*         | Y   |                                     |             | i18n        | derived  | admin    | N          | N         |
| `is_active`                          |             | bool           | Y   |                                     |             | none        | system   | admin    | N          | Y         |

**Membership rule:** A project belongs to an area if its `district_slug` ∈ `district_slugs` **or** explicit `area_slugs` on project. Document which rule wins on conflict (prefer explicit project tag).

---

## 5. Population

- Optional on city/district.
- Always pair with `population_as_of` + `population_source_url`.
- Display “as of {year}” in UI copy.

---

## 6. Lifestyle

Editorial i18n prose and/or tags (`family`, `expat`, `nightlife`, `university`). Tags use controlled vocabulary. No implying listing scarcity/abundance without live counts from inventory.

---

## 7. Transportation

Combine summary + optional POI arrays (BTS/MRT/expressway). City pages: network overview. District: nearest lines to that district. Area: lines that define the area brand (e.g. BTS Sukhumvit).

---

## 8. Investment & rental

District/city investment copy:

- Flag `sourced` vs `editorial`.
- Yield/occupancy numbers follow Investment block rules + disclaimer.
- Prefer linking to project-level sourced metrics over inventing district averages.

Live rental/sale stats on hubs should be **computed from published listings** (median price, count) when shown — never hard-coded fake inventory.

---

## 9. Projects / Schools / Hospitals / Shopping

| Content                        | Source preference                                                  |
| ------------------------------ | ------------------------------------------------------------------ |
| Projects                       | Derived from DB by geography                                       |
| Schools / Hospitals / Shopping | Curated POIs with names + optional distance from district centroid |

POI shape = FIELD_DICTIONARY nearby places.

---

## 10. Google Maps

Each geography may have `google_maps_url` and/or `centroid`. Bounds optional for areas. Map pins on hubs use published project coordinates.

---

## 11. SEO & thin-content policy

| State                                               | Policy                           |
| --------------------------------------------------- | -------------------------------- |
| Active city/district with ≥1 project or ≥N listings | index                            |
| Empty shell                                         | `noindex` or keep draft          |
| Editorial L1 only                                   | allowed with clear guide framing |

Follow SEO_STANDARD URL patterns.

---

## 12. Compliance checklist

- [ ] Parent city for every district/area
- [ ] i18n names (glossary for Thai districts)
- [ ] Population/stats cited
- [ ] Investment metrics cited or disclaimed
- [ ] Maps/centroid when used for UX
- [ ] Derived project lists not hand-fake

---

_End of Area Standard V1.0_
