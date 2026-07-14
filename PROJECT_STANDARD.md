# Project Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only

A **Project** is a named residential (or mixed-use) development. Listings attach to projects when unit identity is known. Public projects target **L2+**; with inventory ideally **L3** linkage.

---

## 1. Core identity

| Field            | Description | Type        | Req | Validation                                        | Example                  | Translation | Source   | Editable | Searchable | Indexable |
| ---------------- | ----------- | ----------- | --- | ------------------------------------------------- | ------------------------ | ----------- | -------- | -------- | ---------- | --------- |
| `id`             | UUID        | uuid        | Y   |                                                   |                          | none        | system   | none     | N          | Y         |
| `slug`           | URL key     | slug        | Y   | unique                                            | `the-livin-ramkhamhaeng` | none        | required | admin    | Y          | Y         |
| `name`           | Brand name  | i18n_string | Y   |                                                   | The Livin Ramkhamhaeng   | i18n        | required | admin    | Y          | Y         |
| `description`    | Overview    | i18n_text   | C   | L2+                                               |                          | i18n        | optional | admin    | Y          | N         |
| `developer_slug` | Developer   | slug        | Y   | must exist                                        | `risland-thailand`       | none        | required | admin    | Y          | Y         |
| `status`         | Publish     | enum        | Y   | draft\|published\|archived                        | published                | none        | system   | admin    | N          | Y         |
| `project_status` | Lifecycle   | enum        | N   | pre_sales\|under_construction\|completed\|unknown | completed                | none        | optional | admin    | Y          | Y         |
| `sources`        | Provenance  | json        | Y   | ≥1 URL                                            |                          | none        | required | admin    | N          | N         |

---

## 2. Location

| Field              | Description     | Type      | Req | Validation        | Example            | Translation | Source    | Editable | Searchable | Indexable |
| ------------------ | --------------- | --------- | --- | ----------------- | ------------------ | ----------- | --------- | -------- | ---------- | --------- |
| `city_slug`        | City            | slug      | Y   |                   | bangkok            | none        | required  | admin    | Y          | Y         |
| `district_slug`    | District        | slug      | Y*  | Bangkok L2+ hard  | bang-kapi          | none        | required* | admin    | Y          | Y         |
| `subdistrict_slug` | Subdistrict     | slug      | N   |                   | hua-mak            | none        | optional  | admin    | Y          | Y         |
| `area_slugs`       | Marketing areas | string[]  | N   |                   | `["ramkhamhaeng"]` | none        | optional  | admin    | Y          | Y         |
| `address`          | Street address  | i18n_text | Y   |                   |                    | i18n        | required  | admin    | Y          | Y         |
| `postal_code`      |                 | string    | N   |                   | 10240              | none        | optional  | admin    | N          | Y         |
| `latitude`         |                 | decimal   | C   | with lng          | 13.763             | none        | optional  | admin    | N          | Y         |
| `longitude`        |                 | decimal   | C   | with lat          | 100.647            | none        | optional  | admin    | N          | Y         |
| `google_maps_url`  |                 | url       | C   | ≥1 of maps/coords |                    | none        | optional  | admin    | N          | N         |

---

## 3. Developer linkage

- Exactly one primary `developer_slug`.
- Optional `co_developers[]` for JV (display only; primary drives SEO parent).
- Project page must link to developer hub.

---

## 4. Masterplan

| Field                   | Description   | Type    | Req | Validation             | Example | Translation | Source   | Editable | Searchable | Indexable |
| ----------------------- | ------------- | ------- | --- | ---------------------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `masterplan`            | Block         | json    | N   | MEDIA roles            |         | alt i18n    | optional | admin    | N          | N         |
| `masterplan_url`        | Primary asset | url     | N   | MEDIA_STANDARD         |         | none        | optional | admin    | N          | N         |
| `masterplan_source_url` | Origin        | url     | C   | if mirrored            |         | none        | optional | admin    | N          | N         |
| `site_area_sqm`         | Land plot     | decimal | N   | ≥0 + source if claimed |         | none        | optional | admin    | N          | Y         |
| `tower_count`           | Buildings     | int     | N   |                        | 2       | none        | optional | admin    | N          | Y         |

Masterplan images follow floorplan/masterplan compression rules; labels must remain legible.

---

## 5. Construction progress & completion

| Field                              | Description    | Type    | Req | Validation       | Example    | Translation | Source   | Editable | Searchable | Indexable |
| ---------------------------------- | -------------- | ------- | --- | ---------------- | ---------- | ----------- | -------- | -------- | ---------- | --------- |
| `completion_year`                  | Year           | int     | N   | 1990–2100        | 2024       | none        | optional | admin    | Y          | Y         |
| `completion_date`                  | Exact if known | date    | N   |                  | 2024-06-01 | none        | optional | admin    | N          | Y         |
| `construction_progress_pct`        | 0–100          | decimal | N   |                  | 100        | none        | optional | admin    | N          | Y         |
| `construction_progress_as_of`      | Snapshot date  | date    | C   | if pct set       |            | none        | optional | admin    | N          | N         |
| `construction_progress_source_url` | Evidence       | url     | C   | if pct set       |            | none        | optional | admin    | N          | N         |
| `construction_updates`             | Timeline       | json[]  | N   | date+text+source |            | i18n        | optional | admin    | Y          | N         |

Do not invent progress percentages. Prefer “completed” from official materials over fake % precision.

---

## 6. Building facts

| Field                    | Description     | Type     | Req | Validation            | Example     | Translation | Source   | Editable | Searchable | Indexable |
| ------------------------ | --------------- | -------- | --- | --------------------- | ----------- | ----------- | -------- | -------- | ---------- | --------- |
| `total_units`            | Unit count      | int      | N   | ≥0 + source preferred | 1938        | none        | optional | admin    | N          | Y         |
| `total_floors`           |                 | int      | N   |                       | 42          | none        | optional | admin    | N          | Y         |
| `buildings`              | Per-tower facts | json     | N   |                       |             | i18n names  | optional | admin    | Y          | N         |
| `property_types_offered` |                 | string[] | N   | condo, etc.           | `["condo"]` | none        | optional | admin    | Y          | Y         |

---

## 7. Facilities

Structured list (preferred) or zones:

```json
{
  "zones": [
    {
      "name": { "en": "Indoor", "zh": "室内", "th": "ในอาคาร" },
      "items": [
        {
          "name": { "en": "Fitness", "zh": "健身", "th": "ฟิตเนส" },
          "source_url": "…"
        }
      ]
    }
  ]
}
```

| Field                | Req | Notes                                  |
| -------------------- | --- | -------------------------------------- |
| `facilities`         | N   | Controlled facility keys + i18n labels |
| `facilities_summary` | N   | Short i18n prose                       |

Index popular facility keys for filters (`pool`, `gym`, `coworking`, etc.).

---

## 8. Nearby transit

### 8.1 Nearby BTS / MRT / Expressway

Use Transportation POI shape from FIELD_DICTIONARY.

| Field                        | Description                         | Req |
| ---------------------------- | ----------------------------------- | --- |
| `nearby_bts`                 | BTS stations                        | N   |
| `nearby_mrt`                 | MRT stations                        | N   |
| `nearby_expressway`          | Expressway access                   | N   |
| `nearby_arl` / `nearby_boat` | Optional modes                      | N   |
| `transit_tags`               | Facet tags `bts` `mrt` `expressway` | N   |
| `transportation_summary`     | i18n overview                       | N   |

Each station item: `name` (i18n), `mode`, `distance` / `distance_meters`, `walk_minutes`, `line_tags`, `source_url`, optional lat/lng.

**Validation:** Do not claim “3 minutes to BTS” without source or measured distance method note.

---

## 9. Nearby schools, hospitals, shopping

| Field                                   | Category   | Req |
| --------------------------------------- | ---------- | --- |
| `nearby_schools`                        | school     | N   |
| `nearby_hospitals`                      | hospital   | N   |
| `nearby_shopping_mall` / `nearby_malls` | mall       | N   |
| `nearby_places`                         | other POIs | N   |

Same POI schema. Prefer official names; use glossary for bilingual station/school names.

---

## 10. Investment

Embed Investment block:

| Field                         | Req | Rule                              |
| ----------------------------- | --- | --------------------------------- |
| `investment.rental_yield_pct` | N   | Method + disclaimer if set        |
| `investment.occupancy_pct`    | N   | as_of + source                    |
| `investment.narrative`        | N   | No guaranteed-return language     |
| `investment.disclaimer`       | C   | Required if yield/occupancy shown |

Public copy must label **sourced** vs **editorial estimate**.

---

## 11. FAQ

| Field | Req                                       |
| ----- | ----------------------------------------- |
| `faq` | N — array of FAQ items (FIELD_DICTIONARY) |

Recommend 4–10 questions: ownership, pet policy building-level, nearest transit, facilities, developer.

`schema_eligible` true only when answers are factual and on-page.

---

## 12. Media pack

| Role                 | L2 recommend | L3 with listings      |
| -------------------- | ------------ | --------------------- |
| cover                | Y            | Y                     |
| gallery              | ≥3           | ≥6                    |
| masterplan           | optional     | preferred             |
| brochure             | optional     | preferred if licensed |
| video / virtual_tour | optional     | optional              |

Alt text required for public images.

---

## 13. SEO

| Field             | Req                                 |
| ----------------- | ----------------------------------- |
| `seo_title`       | Y                                   |
| `seo_description` | Y                                   |
| `og_image_url`    | C                                   |
| Internal links    | developer, district, city, listings |

Follow SEO_STANDARD templates.

---

## 14. Quality checklist (project)

- [ ] Developer + city + district set
- [ ] Address + maps/coords
- [ ] ≥1 source URL
- [ ] No invented yield/progress
- [ ] Facilities/transit claims cited when specific
- [ ] EN/ZH/TH name present (description locale_status tracked)
- [ ] Cover image rights OK

---

_End of Project Standard V1.0_
