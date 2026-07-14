# Field Dictionary V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only  
**Convention:** Each field lists Field Name · Description · Type · Required · Validation · Example · Translation · Source · Editable · Searchable · Indexable

**Legend**

| Column      | Values                                                                |
| ----------- | --------------------------------------------------------------------- |
| Required    | `Y` hard · `C` conditional · `N` optional                             |
| Translation | `i18n` (en/zh/th object) · `none` · `glossary`                        |
| Source      | `required` · `optional` · `derived` · `system`                        |
| Editable    | who may edit in future ops: `admin` · `publisher` · `system` · `none` |
| Searchable  | full-text / keyword query                                             |
| Indexable   | facet/filter/sort index                                               |

Types: `string`, `text`, `i18n_string`, `i18n_text`, `int`, `decimal`, `bool`, `enum`, `url`, `email`, `phone`, `slug`, `uuid`, `datetime`, `date`, `json`, `string[]`, `geo_point`, `money_thb`

---

## 1. City

| Field Name              | Description             | Type        | Required | Validation                  | Example                   | Translation | Source                 | Editable | Searchable | Indexable |
| ----------------------- | ----------------------- | ----------- | -------- | --------------------------- | ------------------------- | ----------- | ---------------------- | -------- | ---------- | --------- |
| `id`                    | Internal UUID           | uuid        | Y        | uuid v4                     | `…`                       | none        | system                 | none     | N          | Y         |
| `slug`                  | URL key                 | slug        | Y        | kebab ASCII unique          | `bangkok`                 | none        | required               | admin    | Y          | Y         |
| `name`                  | Display name            | i18n_string | Y        | 1–80 chars/locale           | Bangkok / 曼谷 / กรุงเทพฯ | i18n        | required               | admin    | Y          | Y         |
| `summary`               | Short intro             | i18n_text   | C        | ≤600 chars                  | …                         | i18n        | optional               | admin    | Y          | N         |
| `population`            | Latest cited population | int         | N        | ≥0                          | `5500000`                 | none        | optional               | admin    | N          | Y         |
| `population_as_of`      | Stat year/date          | date        | C        | required if population set  | `2023-01-01`              | none        | optional               | admin    | N          | N         |
| `population_source_url` | Citation                | url         | C        | http(s)                     | `https://…`               | none        | required if population | admin    | N          | N         |
| `centroid`              | Map center              | geo_point   | N        | lat∈[-90,90] lng∈[-180,180] | `13.7563,100.5018`        | none        | optional               | admin    | N          | Y         |
| `google_maps_url`       | Maps place/viewport     | url         | N        | http(s)                     | `https://maps…`           | none        | optional               | admin    | N          | N         |
| `seo_title`             | Meta title              | i18n_string | Y        | 20–70 soft                  | …                         | i18n        | derived/optional       | admin    | N          | N         |
| `seo_description`       | Meta description        | i18n_text   | Y        | 70–170 soft                 | …                         | i18n        | derived/optional       | admin    | N          | N         |
| `is_active`             | Public hub              | bool        | Y        |                             | `true`                    | none        | system                 | admin    | N          | Y         |
| `sort_order`            | Nav order               | int         | N        | ≥0                          | `1`                       | none        | system                 | admin    | N          | Y         |
| `locale_status`         | Completeness            | json        | N        | en/zh/th enums              | `{en:complete}`           | none        | system                 | system   | N          | N         |
| `updated_at`            | Last change             | datetime    | Y        | ISO-8601                    |                           | none        | system                 | none     | N          | Y         |

---

## 2. District

| Field Name               | Description           | Type                  | Required | Validation                | Example       | Translation   | Source               | Editable | Searchable | Indexable |
| ------------------------ | --------------------- | --------------------- | -------- | ------------------------- | ------------- | ------------- | -------------------- | -------- | ---------- | --------- |
| `id`                     | UUID                  | uuid                  | Y        |                           |               | none          | system               | none     | N          | Y         |
| `city_id` / `city_slug`  | Parent city           | uuid/slug             | Y        | must exist                | `bangkok`     | none          | required             | admin    | Y          | Y         |
| `slug`                   | Unique slug           | slug                  | Y        | unique global             | `bang-kapi`   | none          | required             | admin    | Y          | Y         |
| `name`                   | District name         | i18n_string           | Y        |                           | Bang Kapi     | i18n/glossary | required             | admin    | Y          | Y         |
| `summary`                | Lifestyle/orientation | i18n_text             | C        | no fake inventory claims  |               | i18n          | optional             | admin    | Y          | N         |
| `population`             | Official population   | int                   | N        | ≥0 + source               |               | none          | optional             | admin    | N          | Y         |
| `lifestyle`              | Lifestyle tags/copy   | i18n_text or string[] | N        |                           | urban, family | i18n          | optional             | admin    | Y          | Y         |
| `transportation_summary` | Transit overview      | i18n_text             | N        |                           | MRT Yellow…   | i18n          | optional             | admin    | Y          | N         |
| `investment_summary`     | Market note           | i18n_text             | N        | labeled sourced/editorial |               | i18n          | optional             | admin    | Y          | N         |
| `rental_summary`         | Rental note           | i18n_text             | N        |                           |               | i18n          | optional             | admin    | Y          | N         |
| `google_maps_url`        | Maps                  | url                   | N        |                           |               | none          | optional             | admin    | N          | N         |
| `centroid`               | geo                   | geo_point             | N        |                           |               | none          | optional             | admin    | N          | Y         |
| `seo_title`              | SEO                   | i18n_string           | Y        |                           |               | i18n          | derived              | admin    | N          | N         |
| `seo_description`        | SEO                   | i18n_text             | Y        |                           |               | i18n          | derived              | admin    | N          | N         |
| `is_active`              |                       | bool                  | Y        |                           | true          | none          | system               | admin    | N          | Y         |
| `sort_order`             |                       | int                   | N        |                           |               | none          | system               | admin    | N          | Y         |
| `sources`                | Provenance list       | json                  | C        | ≥1 if stats claimed       |               | none          | required when claims | admin    | N          | N         |
| `updated_at`             |                       | datetime              | Y        |                           |               | none          | system               | none     | N          | Y         |

---

## 3. Area (marketing geography)

| Field Name               | Description                | Type        | Required | Validation             | Example                      | Translation | Source   | Editable | Searchable | Indexable |
| ------------------------ | -------------------------- | ----------- | -------- | ---------------------- | ---------------------------- | ----------- | -------- | -------- | ---------- | --------- |
| `id`                     | UUID                       | uuid        | Y        |                        |                              | none        | system   | none     | N          | Y         |
| `slug`                   | Area key                   | slug        | Y        | unique                 | `sukhumvit`                  | none        | required | admin    | Y          | Y         |
| `name`                   | Area brand name            | i18n_string | Y        |                        | Sukhumvit                    | i18n        | required | admin    | Y          | Y         |
| `city_slug`              | Parent city                | slug        | Y        |                        | bangkok                      | none        | required | admin    | Y          | Y         |
| `district_slugs`         | Contained districts        | string[]    | C        | known districts        | `["watthana","khlong-toei"]` | none        | optional | admin    | Y          | Y         |
| `summary`                | Intro                      | i18n_text   | C        |                        |                              | i18n        | optional | admin    | Y          | N         |
| `lifestyle`              |                            | i18n_text   | N        |                        |                              | i18n        | optional | admin    | Y          | Y         |
| `transportation_summary` |                            | i18n_text   | N        |                        |                              | i18n        | optional | admin    | Y          | N         |
| `investment_summary`     |                            | i18n_text   | N        | sourced/editorial flag |                              | i18n        | optional | admin    | Y          | N         |
| `rental_summary`         |                            | i18n_text   | N        |                        |                              | i18n        | optional | admin    | Y          | N         |
| `google_maps_url`        | Viewport                   | url         | N        |                        |                              | none        | optional | admin    | N          | N         |
| `bounds`                 | Optional polygon/bbox json | json        | N        | GeoJSON                |                              | none        | optional | admin    | N          | Y         |
| `seo_title`              |                            | i18n_string | Y        |                        |                              | i18n        | derived  | admin    | N          | N         |
| `seo_description`        |                            | i18n_text   | Y        |                        |                              | i18n        | derived  | admin    | N          | N         |
| `is_active`              |                            | bool        | Y        |                        |                              | none        | system   | admin    | N          | Y         |

---

## 4. Subdistrict (optional hierarchy)

| Field Name        | Description | Type        | Required | Validation | Example     | Translation   | Source   | Editable | Searchable | Indexable |
| ----------------- | ----------- | ----------- | -------- | ---------- | ----------- | ------------- | -------- | -------- | ---------- | --------- |
| `id`              | UUID        | uuid        | Y        |            |             | none          | system   | none     | N          | Y         |
| `district_slug`   | Parent      | slug        | Y        |            | `bang-kapi` | none          | required | admin    | Y          | Y         |
| `slug`            |             | slug        | Y        | unique     | `hua-mak`   | none          | required | admin    | Y          | Y         |
| `name`            |             | i18n_string | Y        |            | Hua Mak     | i18n/glossary | required | admin    | Y          | Y         |
| `google_maps_url` |             | url         | N        |            |             | none          | optional | admin    | N          | N         |
| `seo_title`       |             | i18n_string | N        |            |             | i18n          | optional | admin    | N          | N         |
| `seo_description` |             | i18n_text   | N        |            |             | i18n          | optional | admin    | N          | N         |

---

## 5. Developer

| Field Name              | Description           | Type        | Required | Validation                      | Example                      | Translation   | Source           | Editable        | Searchable | Indexable |
| ----------------------- | --------------------- | ----------- | -------- | ------------------------------- | ---------------------------- | ------------- | ---------------- | --------------- | ---------- | --------- |
| `id`                    | UUID                  | uuid        | Y        |                                 |                              | none          | system           | none            | N          | Y         |
| `slug`                  |                       | slug        | Y        | unique                          | `risland-thailand`           | none          | required         | admin           | Y          | Y         |
| `name`                  | Brand name            | i18n_string | Y        |                                 | RISLAND Thailand             | i18n          | required         | admin/publisher | Y          | Y         |
| `legal_name`            | Registered name       | i18n_string | C        |                                 | RISLAND (Thailand) Co., Ltd. | i18n          | optional         | admin           | Y          | Y         |
| `description`           | Profile body          | i18n_text   | C        |                                 |                              | i18n          | optional         | admin/publisher | Y          | N         |
| `history`               | Company history       | i18n_text   | N        | dated claims need source        |                              | i18n          | optional         | admin           | Y          | N         |
| `website`               | Official site         | url         | C        | http(s); ≥1 of website/facebook |                              | none          | required*        | admin/publisher | Y          | N         |
| `facebook_url`          | Official FB           | url         | C        |                                 |                              | none          | optional         | admin/publisher | N          | N         |
| `google_maps_url`       | HQ/brand place        | url         | N        |                                 |                              | none          | optional         | admin           | N          | N         |
| `logo_url`              | Logo asset            | url         | C        | media rules                     |                              | none          | optional         | admin/publisher | N          | N         |
| `phone`                 |                       | phone       | N        | E.164 preferred                 | `+6620266888`                | none          | optional         | admin           | N          | N         |
| `email`                 |                       | email       | N        |                                 |                              | none          | optional         | admin           | N          | N         |
| `stock_exchange`        | Exchange code         | enum/string | N        | e.g. SET                        | `SET`                        | none          | optional         | admin           | Y          | Y         |
| `stock_ticker`          | Ticker                | string      | C        | if exchange set                 | `PS`                         | none          | optional         | admin           | Y          | Y         |
| `financial_status_note` | Public financial note | i18n_text   | N        | must cite filing URL            |                              | i18n          | optional         | admin           | N          | N         |
| `financial_source_url`  | Filing/IR URL         | url         | C        | if financial note               |                              | none          | required if note | admin           | N          | N         |
| `awards`                | Awards list           | json        | N        | year+name+source                |                              | i18n in items | optional         | admin           | Y          | N         |
| `seo_title`             |                       | i18n_string | Y        |                                 |                              | i18n          | derived          | admin           | N          | N         |
| `seo_description`       |                       | i18n_text   | Y        |                                 |                              | i18n          | derived          | admin           | N          | N         |
| `is_published`          | Public                | bool        | Y        |                                 | true                         | none          | system           | admin           | N          | Y         |
| `sources`               |                       | json        | Y        | ≥1                              |                              | none          | required         | admin           | N          | N         |
| `updated_at`            |                       | datetime    | Y        |                                 |                              | none          | system           | none            | N          | Y         |

---

## 6. Company

| Field Name        | Description    | Type        | Required | Validation                                 | Example                  | Translation | Source   | Editable        | Searchable | Indexable |
| ----------------- | -------------- | ----------- | -------- | ------------------------------------------ | ------------------------ | ----------- | -------- | --------------- | ---------- | --------- |
| `id`              | UUID           | uuid        | Y        |                                            |                          | none        | system   | none            | N          | Y         |
| `slug`            |                | slug        | Y        | unique                                     | `monday-property-agency` | none        | required | admin           | Y          | Y         |
| `type`            | org type       | enum        | Y        | `agency\|developer_company\|broker\|other` | `agency`                 | none        | required | admin           | Y          | Y         |
| `name`            | Brand          | i18n_string | Y        |                                            |                          | i18n        | required | admin/publisher | Y          | Y         |
| `legal_name`      |                | i18n_string | N        |                                            |                          | i18n        | optional | admin           | Y          | Y         |
| `tax_id`          | Tax ID         | string      | N        | country format                             |                          | none        | optional | admin           | N          | Y         |
| `website`         |                | url         | N        |                                            |                          | none        | optional | admin           | Y          | N         |
| `logo_url`        |                | url         | N        |                                            |                          | none        | optional | admin           | N          | N         |
| `phone`           |                | phone       | N        |                                            |                          | none        | optional | admin           | N          | N         |
| `email`           |                | email       | N        |                                            |                          | none        | optional | admin           | N          | N         |
| `address`         | Office address | i18n_text   | N        |                                            |                          | i18n        | optional | admin           | Y          | N         |
| `google_maps_url` |                | url         | N        |                                            |                          | none        | optional | admin           | N          | N         |
| `seo_title`       |                | i18n_string | N        |                                            |                          | i18n        | optional | admin           | N          | N         |
| `seo_description` |                | i18n_text   | N        |                                            |                          | i18n        | optional | admin           | N          | N         |
| `is_active`       |                | bool        | Y        |                                            |                          | none        | system   | admin           | N          | Y         |

---

## 7. Agent

| Field Name               | Description    | Type        | Required | Validation         | Example            | Translation | Source   | Editable        | Searchable | Indexable |
| ------------------------ | -------------- | ----------- | -------- | ------------------ | ------------------ | ----------- | -------- | --------------- | ---------- | --------- |
| `id`                     | UUID           | uuid        | Y        |                    |                    | none        | system   | none            | N          | Y         |
| `slug`                   |                | slug        | Y        | unique             | `somchai-property` | none        | required | admin           | Y          | Y         |
| `name`                   | Display name   | i18n_string | Y        |                    |                    | i18n        | required | admin/publisher | Y          | Y         |
| `company_id`             | Agency company | uuid        | N        |                    |                    | none        | optional | admin           | Y          | Y         |
| `license_number`         | License        | string      | N        |                    |                    | none        | optional | admin           | Y          | Y         |
| `bio`                    | Bio            | i18n_text   | N        |                    |                    | i18n        | optional | publisher       | Y          | N         |
| `email`                  |                | email       | C        |                    |                    | none        | optional | publisher       | N          | N         |
| `phone`                  |                | phone       | C        | ≥1 contact         |                    | none        | optional | publisher       | N          | N         |
| `avatar_url`             |                | url         | N        | MEDIA avatar sizes |                    | none        | optional | publisher       | N          | N         |
| `service_city_slugs`     | Service cities | string[]    | N        | known cities       |                    | none        | optional | publisher       | Y          | Y         |
| `service_district_slugs` |                | string[]    | N        |                    |                    | none        | optional | publisher       | Y          | Y         |
| `is_verified_agent`      | Badge          | bool        | Y        | default false      |                    | none        | system   | admin           | N          | Y         |
| `is_active`              |                | bool        | Y        |                    |                    | none        | system   | admin           | N          | Y         |
| `seo_title`              |                | i18n_string | N        |                    |                    | i18n        | optional | admin           | N          | N         |
| `seo_description`        |                | i18n_text   | N        |                    |                    | i18n        | optional | admin           | N          | N         |
| `updated_at`             |                | datetime    | Y        |                    |                    | none        | system   | none            | N          | Y         |

---

## 8. Owner

| Field Name            | Description           | Type   | Required | Validation                       | Example   | Translation | Source   | Editable    | Searchable | Indexable |
| --------------------- | --------------------- | ------ | -------- | -------------------------------- | --------- | ----------- | -------- | ----------- | ---------- | --------- |
| `id`                  | UUID                  | uuid   | Y        |                                  |           | none        | system   | none        | N          | Y         |
| `display_name`        | Public or masked name | string | C        | privacy rules                    | `Owner A` | none        | optional | admin/owner | N          | N         |
| `owner_type`          |                       | enum   | Y        | `individual\|corporate`          |           | none        | required | admin       | N          | Y         |
| `company_id`          | If corporate          | uuid   | C        |                                  |           | none        | optional | admin       | N          | Y         |
| `email`               | Private               | email  | N        | PII protected                    |           | none        | optional | owner       | N          | N         |
| `phone`               | Private               | phone  | N        | PII                              |           | none        | optional | owner       | N          | N         |
| `verification_status` | KYC-ish content flag  | enum   | Y        | `unverified\|verified\|rejected` |           | none        | system   | admin       | N          | Y         |
| `notes_internal`      | Staff only            | text   | N        | never public                     |           | none        | optional | admin       | N          | N         |

Public pages never expose private owner PII.

---

## 9. Project (summary — full in PROJECT_STANDARD)

| Field Name                            | Description     | Type        | Required | Validation          | Example                  | Translation   | Source    | Editable | Searchable | Indexable |
| ------------------------------------- | --------------- | ----------- | -------- | ------------------- | ------------------------ | ------------- | --------- | -------- | ---------- | --------- |
| `slug`                                |                 | slug        | Y        | unique              | `the-livin-ramkhamhaeng` | none          | required  | admin    | Y          | Y         |
| `developer_slug`                      |                 | slug        | Y        | exists              |                          | none          | required  | admin    | Y          | Y         |
| `name`                                |                 | i18n_string | Y        |                     |                          | i18n          | required  | admin    | Y          | Y         |
| `description`                         |                 | i18n_text   | C        |                     |                          | i18n          | optional  | admin    | Y          | N         |
| `city_slug`                           |                 | slug        | Y        |                     | bangkok                  | none          | required  | admin    | Y          | Y         |
| `district_slug`                       |                 | slug        | Y*       | *Bangkok-first hard | bang-kapi                | none          | required* | admin    | Y          | Y         |
| `subdistrict_slug`                    |                 | slug        | N        |                     | hua-mak                  | none          | optional  | admin    | Y          | Y         |
| `address`                             |                 | i18n_text   | Y        |                     |                          | i18n          | required  | admin    | Y          | Y         |
| `postal_code`                         |                 | string      | N        |                     | 10240                    | none          | optional  | admin    | N          | Y         |
| `latitude`                            |                 | decimal     | C        | with lng            | 13.763                   | none          | optional  | admin    | N          | Y         |
| `longitude`                           |                 | decimal     | C        | with lat            | 100.647                  | none          | optional  | admin    | N          | Y         |
| `google_maps_url`                     |                 | url         | C        | ≥1 maps/coords      |                          | none          | optional  | admin    | N          | N         |
| `official_website`                    |                 | url         | N        |                     |                          | none          | optional  | admin    | Y          | N         |
| `facebook_url`                        |                 | url         | N        |                     |                          | none          | optional  | admin    | N          | N         |
| `completion_year` / `completion_date` |                 | int/date    | N        |                     | 2024                     | none          | optional  | admin    | Y          | Y         |
| `construction_progress_pct`           | 0–100           | decimal     | N        |                     | 100                      | none          | optional  | admin    | N          | Y         |
| `masterplan_url`                      | Media           | url         | N        |                     |                          | none          | optional  | admin    | N          | N         |
| `total_units`                         |                 | int         | N        | ≥0                  | 1938                     | none          | optional  | admin    | N          | Y         |
| `total_floors`                        |                 | int         | N        |                     | 42                       | none          | optional  | admin    | N          | Y         |
| `facilities`                          | Structured list | json        | N        | MEDIA/POI shapes    |                          | i18n in items | optional  | admin    | Y          | Y         |
| `transportation`                      |                 | json        | N        |                     |                          | i18n          | optional  | admin    | Y          | Y         |
| `nearby_schools`                      |                 | json        | N        |                     |                          | i18n          | optional  | admin    | Y          | Y         |
| `nearby_hospitals`                    |                 | json        | N        |                     |                          | i18n          | optional  | admin    | Y          | Y         |
| `nearby_malls`                        |                 | json        | N        |                     |                          | i18n          | optional  | admin    | Y          | Y         |
| `transit_tags`                        |                 | string[]    | N        | controlled vocab    | `["mrt"]`                | none          | optional  | admin    | Y          | Y         |
| `investment`                          | Block           | json        | N        | see Investment      |                          | i18n          | optional  | admin    | Y          | N         |
| `faq`                                 |                 | json        | N        |                     |                          | i18n          | optional  | admin    | Y          | N         |
| `seo_title` / `seo_description`       |                 | i18n_*      | Y        |                     |                          | i18n          | derived   | admin    | N          | N         |
| `status`                              | draft/published | enum        | Y        |                     | published                | none          | system    | admin    | N          | Y         |
| `sources`                             |                 | json        | Y        | ≥1                  |                          | none          | required  | admin    | N          | N         |

---

## 10. Property Listing (summary — full in PROPERTY_DATA_STANDARD)

Core identity & commerce-facing fields (all dictionary columns apply):

| Field Name                      | Type             | Required | Searchable | Indexable |
| ------------------------------- | ---------------- | -------- | ---------- | --------- |
| `slug`                          | slug             | Y        | Y          | Y         |
| `listing_type`                  | enum sale\|rent  | Y        | Y          | Y         |
| `property_type`                 | enum             | Y        | Y          | Y         |
| `project_slug`                  | slug             | C        | Y          | Y         |
| `developer_slug`                | slug             | C        | Y          | Y         |
| `unit_number`                   | string           | N        | Y          | Y         |
| `bedrooms`                      | int              | C        | Y          | Y         |
| `bathrooms`                     | decimal          | C        | Y          | Y         |
| `area_sqm`                      | decimal          | C        | Y          | Y         |
| `price_thb`                     | money_thb        | Y        | Y          | Y         |
| `rent_thb`                      | money_thb        | C        | Y          | Y         |
| `commission_*`                  | see property doc | N        | N          | Y         |
| `co_agent_*`                    | json/relations   | N        | N          | Y         |
| `ownership_type`                | enum             | N        | Y          | Y         |
| `transfer_fee_note`             | i18n_text        | N        | N          | N         |
| `furniture_status`              | enum             | N        | Y          | Y         |
| `pets_allowed`                  | bool/enum        | N        | Y          | Y         |
| `parking_spaces`                | int              | N        | Y          | Y         |
| `floor_label`                   | string           | N        | Y          | Y         |
| `view_type`                     | string/enum      | N        | Y          | Y         |
| `direction`                     | enum             | N        | Y          | Y         |
| `availability_status`           | enum             | Y        | Y          | Y         |
| `source`                        | string           | Y        | Y          | Y         |
| `listing_url`                   | url              | Y        | N          | Y         |
| `verification_status`           | enum             | Y        | Y          | Y         |
| `source_updated_at`             | datetime         | Y        | N          | Y         |
| `latitude`/`longitude`          | decimal          | N        | N          | Y         |
| `google_maps_url`               | url              | N        | N          | N         |
| `title`/`summary`/`description` | i18n_*           | Y/C      | Y          | N         |
| `media`                         | refs             | C        | N          | N         |

---

## 11. Advertisement

| Field Name              | Description  | Type        | Required | Validation                              | Example                 | Translation | Source   | Editable | Searchable | Indexable |
| ----------------------- | ------------ | ----------- | -------- | --------------------------------------- | ----------------------- | ----------- | -------- | -------- | ---------- | --------- |
| `id`                    | UUID         | uuid        | Y        |                                         |                         | none        | system   | none     | N          | Y         |
| `code` / `slug`         | Campaign key | slug        | Y        | unique                                  | `home-spotlight-2026q3` | none        | required | admin    | Y          | Y         |
| `product_type`          | Placement    | enum        | Y        | banner\|spotlight\|sponsored_listing\|… |                         | none        | required | admin    | Y          | Y         |
| `advertiser_company_id` | Payer        | uuid        | C        |                                         |                         | none        | optional | admin    | Y          | Y         |
| `headline`              |              | i18n_string | Y        |                                         |                         | i18n        | required | admin    | Y          | N         |
| `body`                  |              | i18n_text   | N        |                                         |                         | i18n        | optional | admin    | Y          | N         |
| `cta_url`               | Landing      | url         | Y        | http(s)                                 |                         | none        | required | admin    | N          | N         |
| `creative_media`        | Assets       | json        | Y        | MEDIA_STANDARD                          |                         | none        | required | admin    | N          | N         |
| `targeting`             | Facets       | json        | N        | city/district/type                      |                         | none        | optional | admin    | N          | Y         |
| `starts_at` / `ends_at` | Schedule     | datetime    | Y        | end>start                               |                         | none        | required | admin    | N          | Y         |
| `moderation_status`     |              | enum        | Y        | pending\|approved\|rejected             |                         | none        | system   | admin    | N          | Y         |
| `status`                |              | enum        | Y        | draft\|active\|paused\|ended            |                         | none        | system   | admin    | N          | Y         |

---

## 12. SEO block (embeddable)

| Field Name        | Description         | Type        | Required | Validation      | Example            | Translation | Source   | Editable | Searchable | Indexable |
| ----------------- | ------------------- | ----------- | -------- | --------------- | ------------------ | ----------- | -------- | -------- | ---------- | --------- |
| `seo_title`       | Document title      | i18n_string | Y        | soft len        |                    | i18n        | derived  | admin    | N          | N         |
| `seo_description` | Meta description    | i18n_text   | Y        | soft len        |                    | i18n        | derived  | admin    | N          | N         |
| `canonical_path`  | Path without domain | string      | Y        | starts with `/` | `/en/projects/…`   | none        | derived  | system   | N          | Y         |
| `og_image_url`    | OG image            | url         | C        | MEDIA og size   |                    | none        | optional | admin    | N          | N         |
| `schema_type`     | Schema.org @type    | string      | N        | allow-list      | `ApartmentComplex` | none        | derived  | system   | N          | N         |
| `noindex`         | Robots              | bool        | Y        | default false   |                    | none        | system   | admin    | N          | Y         |

---

## 13. Media item

| Field Name          | Description   | Type        | Required | Validation                                          | Example    | Translation | Source   | Editable  | Searchable | Indexable |
| ------------------- | ------------- | ----------- | -------- | --------------------------------------------------- | ---------- | ----------- | -------- | --------- | ---------- | --------- |
| `id`                |               | uuid        | Y        |                                                     |            | none        | system   | none      | N          | Y         |
| `entity_type`       | Owner entity  | enum        | Y        | project\|listing\|developer\|ad\|…                  |            | none        | required | system    | N          | Y         |
| `entity_id`         |               | uuid        | Y        |                                                     |            | none        | required | system    | N          | Y         |
| `role`              |               | enum        | Y        | cover\|gallery\|floorplan\|brochure\|video\|tour\|… |            | none        | required | publisher | N          | Y         |
| `url`               | Asset URL     | url         | Y        |                                                     |            | none        | required | publisher | N          | N         |
| `mime_type`         |               | string      | C        |                                                     | image/jpeg | none        | derived  | system    | N          | Y         |
| `width` / `height`  | px            | int         | C        |                                                     | 1600/1200  | none        | derived  | system    | N          | N         |
| `alt`               | Accessibility | i18n_string | C        | required for images public                          |            | i18n        | optional | publisher | Y          | N         |
| `sort_order`        |               | int         | Y        | ≥0                                                  | 0          | none        | system   | publisher | N          | Y         |
| `source_url`        | Provenance    | url         | C        |                                                     |            | none        | optional | publisher | N          | N         |
| `rights_note`       |               | enum/text   | Y        | hotlink\|mirrored\|licensed\|unknown                |            | none        | required | publisher | N          | N         |
| `watermark_applied` |               | bool        | Y        | default false                                       |            | none        | system   | system    | N          | N         |

---

## 14. FAQ item

| Field Name        | Description | Type        | Required | Validation                      | Example | Translation | Source              | Editable | Searchable | Indexable |
| ----------------- | ----------- | ----------- | -------- | ------------------------------- | ------- | ----------- | ------------------- | -------- | ---------- | --------- |
| `question`        |             | i18n_string | Y        |                                 |         | i18n        | required            | admin    | Y          | N         |
| `answer`          |             | i18n_text   | Y        |                                 |         | i18n        | required            | admin    | Y          | N         |
| `kind`            |             | enum        | Y        | sourced\|boilerplate\|editorial | sourced | none        | required            | admin    | N          | Y         |
| `sort_order`      |             | int         | Y        |                                 | 1       | none        | system              | admin    | N          | Y         |
| `source_url`      |             | url         | C        | if kind=sourced                 |         | none        | required if sourced | admin    | N          | N         |
| `schema_eligible` | FAQPage     | bool        | Y        | default true if public          |         | none        | system              | admin    | N          | N         |

---

## 15. Investment block

| Field Name         | Description      | Type      | Required | Validation                     | Example | Translation | Source              | Editable | Searchable | Indexable |
| ------------------ | ---------------- | --------- | -------- | ------------------------------ | ------- | ----------- | ------------------- | -------- | ---------- | --------- |
| `rental_yield_pct` | Gross yield      | decimal   | N        | 0–100; needs method            | `5.2`   | none        | optional            | admin    | Y          | Y         |
| `yield_method`     | How computed     | enum/text | C        | `sourced\|modeled\|unknown`    | sourced | none        | required if yield   | admin    | N          | N         |
| `yield_source_url` |                  | url       | C        | if sourced                     |         | none        | required if sourced | admin    | N          | N         |
| `occupancy_pct`    |                  | decimal   | N        | 0–100                          |         | none        | optional            | admin    | Y          | Y         |
| `occupancy_as_of`  |                  | date      | C        |                                |         | none        | optional            | admin    | N          | N         |
| `narrative`        | Investment copy  | i18n_text | N        | no guaranteed returns language |         | i18n        | optional            | admin    | Y          | N         |
| `disclaimer`       | Legal disclaimer | i18n_text | C        | required if yield shown        |         | i18n        | system/optional     | admin    | N          | N         |

---

## 16. Transportation / School / Hospital / Facilities / Nearby Places

Shared POI shape:

| Field Name             | Description      | Type        | Required | Validation                                         | Example          | Translation   | Source           | Editable | Searchable | Indexable |
| ---------------------- | ---------------- | ----------- | -------- | -------------------------------------------------- | ---------------- | ------------- | ---------------- | -------- | ---------- | --------- |
| `name`                 | POI name         | i18n_string | Y        |                                                    | MRT Lam Sali     | i18n/glossary | required         | admin    | Y          | Y         |
| `category`             |                  | enum        | Y        | transport\|school\|hospital\|mall\|facility\|other |                  | none          | required         | admin    | Y          | Y         |
| `mode`                 | Transit mode     | enum        | C        | bts\|mrt\|expressway\|boat\|arl\|bus\|walk         | mrt              | none          | optional         | admin    | Y          | Y         |
| `distance`             | Display distance | string      | C        | include unit                                       | `350 m`          | none          | optional         | admin    | Y          | Y         |
| `distance_meters`      | Normalized       | int         | N        | ≥0                                                 | 350              | none          | derived/optional | system   | N          | Y         |
| `walk_minutes`         |                  | int         | N        | ≥0                                                 | 5                | none          | optional         | admin    | Y          | Y         |
| `line_tags`            |                  | string[]    | N        | controlled                                         | `["mrt-yellow"]` | none          | optional         | admin    | Y          | Y         |
| `source_url`           |                  | url         | C        | required for official tables                       |                  | none          | optional*        | admin    | N          | N         |
| `latitude`/`longitude` | POI point        | decimal     | N        |                                                    |                  | none          | optional         | admin    | N          | Y         |

Facilities may use nested `zone` + `items[]` with same i18n rules.

---

## 17. Cross-cutting system fields

| Field Name       | Description  | Type     | Required | Validation                         | Example               | Translation | Source             | Editable | Searchable | Indexable |
| ---------------- | ------------ | -------- | -------- | ---------------------------------- | --------------------- | ----------- | ------------------ | -------- | ---------- | --------- |
| `quality_score`  | 0–100        | int      | N        | review standard                    | 82                    | none        | system             | system   | N          | Y         |
| `approval_state` |              | enum     | Y        | draft\|pending\|approved\|rejected |                       | none        | system             | admin    | N          | Y         |
| `collected_at`   | Harvest time | datetime | C        | packages                           |                       | none        | required on import | system   | N          | Y         |
| `locale_status`  |              | json     | N        |                                    |                       | none        | system             | system   | N          | N         |
| `external_ref`   | Partner id   | string   | C        | unique per source                  | `propertyhub:5640526` | none        | required listings  | system   | Y          | Y         |

---

_End of Field Dictionary V1.0 — entity-specific deep lists continue in PROPERTY / PROJECT / DEVELOPER / AREA standards._
