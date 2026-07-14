# Property Data Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only  
**Scale target:** 1,000,000+ listings

Full column dictionary conventions: [FIELD_DICTIONARY.md](./FIELD_DICTIONARY.md)

---

## 1. Listing object overview

A **Property Listing** is a market offer to **sale** or **rent** a residential (or later commercial) unit. It may attach to a Project and Developer. Every public listing must carry **source + URL + timestamps + verification state**.

**Compliance floor for public verified listings: L3** (see CONTENT_STANDARD).

---

## 2. Field catalog

### 2.1 Identity & routing

| Field          | Description       | Type        | Req | Validation                  | Example                   | i18n | Source   | Editable  | Search | Index |
| -------------- | ----------------- | ----------- | --- | --------------------------- | ------------------------- | ---- | -------- | --------- | ------ | ----- |
| `id`           | UUID              | uuid        | Y   |                             |                           | none | system   | none      | N      | Y     |
| `slug`         | Public slug       | slug        | Y   | unique, kebab               | `sale-1br-livin-rk-45sqm` | none | required | admin     | Y      | Y     |
| `external_ref` | Partner key       | string      | Y*  | unique per `source`         | `propertyhub:5640526`     | none | required | system    | Y      | Y     |
| `title`        | Card/detail title | i18n_string | Y   | ≤120 chars                  | Sale 1BR…                 | i18n | required | publisher | Y      | N     |
| `summary`      | Short blurb       | i18n_text   | C   | ≤400                        |                           | i18n | optional | publisher | Y      | N     |
| `description`  | Long body         | i18n_text   | C   | ≤8000; no fabricated claims |                           | i18n | optional | publisher | Y      | N     |

\*Required for imported; optional for first-party future.

### 2.2 Sale / Rent

| Field              | Description      | Type      | Req | Validation               | Example   | i18n | Source   | Editable  | Search | Index |
| ------------------ | ---------------- | --------- | --- | ------------------------ | --------- | ---- | -------- | --------- | ------ | ----- |
| `listing_type`     | Offer mode       | enum      | Y   | `sale` \| `rent`         | `sale`    | none | required | publisher | Y      | Y     |
| `price_thb`        | Ask / sale price | money_thb | C   | >0; **required if sale** | `2750000` | none | required | publisher | Y      | Y     |
| `rent_thb`         | Monthly rent     | money_thb | C   | >0; **required if rent** | `18000`   | none | required | publisher | Y      | Y     |
| `price_period`     | Rent period      | enum      | C   | `month` default          | `month`   | none | optional | publisher | N      | Y     |
| `price_negotiable` |                  | bool      | N   |                          | false     | none | optional | publisher | N      | Y     |
| `currency`         | Always THB V1    | enum      | Y   | `THB`                    | `THB`     | none | system   | none      | N      | Y     |

Do not store USD as primary in V1. Fx display is presentation-only later.

### 2.3 Developer / Project / Unit

| Field            | Description | Type   | Req | Validation                                | Example                  | i18n               | Source   | Editable  | Search | Index |
| ---------------- | ----------- | ------ | --- | ----------------------------------------- | ------------------------ | ------------------ | -------- | --------- | ------ | ----- |
| `developer_slug` | Developer   | slug   | C   | exists if set                             | `risland-thailand`       | none               | optional | admin     | Y      | Y     |
| `project_slug`   | Project     | slug   | C   | exists if set                             | `the-livin-ramkhamhaeng` | none               | optional | admin     | Y      | Y     |
| `property_type`  | Asset class | enum   | Y   | condo\|house\|townhouse\|land\|apt\|other | `condo`                  | none               | required | publisher | Y      | Y     |
| `unit_number`    | Unit ID     | string | N   | do not invent                             | `A/1234`                 | none               | optional | publisher | Y      | Y     |
| `building_name`  | Tower/wing  | string | N   |                                           | Tower A                  | none/i18n optional | optional | publisher | Y      | Y     |

### 2.4 Size & rooms

| Field       | Description     | Type    | Req | Validation          | Example | i18n | Source    | Editable  | Search | Index |
| ----------- | --------------- | ------- | --- | ------------------- | ------- | ---- | --------- | --------- | ------ | ----- |
| `bedrooms`  | Bed count       | int     | C   | ≥0; studio=`0`      | `1`     | none | preferred | publisher | Y      | Y     |
| `bathrooms` | Bath count      | decimal | C   | ≥0 step 0.5         | `1`     | none | preferred | publisher | Y      | Y     |
| `area_sqm`  | Usable/interior | decimal | C   | >0                  | `45.5`  | none | preferred | publisher | Y      | Y     |
| `area_type` | What area means | enum    | N   | net\|gross\|unknown | `net`   | none | optional  | publisher | N      | Y     |
| `land_sqm`  | Land size       | decimal | N   | houses/land         |         | none | optional  | publisher | Y      | Y     |

### 2.5 Commission & co-agent

| Field                   | Description                | Type      | Req | Validation                         | Example   | i18n | Source   | Editable | Search | Index |
| ----------------------- | -------------------------- | --------- | --- | ---------------------------------- | --------- | ---- | -------- | -------- | ------ | ----- |
| `commission_type`       | Model                      | enum      | N   | `%` \| `fixed` \| `unknown`        | `%`       | none | optional | admin    | N      | Y     |
| `commission_pct`        | Percent                    | decimal   | C   | 0–100                              | `3`       | none | optional | admin    | N      | Y     |
| `commission_amount_thb` | Fixed                      | money_thb | C   | ≥0                                 |           | none | optional | admin    | N      | Y     |
| `commission_notes`      | Private/public policy note | i18n_text | N   |                                    |           | i18n | optional | admin    | N      | N     |
| `commission_visibility` | Who sees                   | enum      | Y   | `private` \| `partner` \| `public` | `private` | none | system   | admin    | N      | Y     |
| `co_agent_enabled`      | Split deal                 | bool      | N   |                                    | false     | none | optional | admin    | N      | Y     |
| `co_agent`              | Structure                  | json      | C   | agent ids + split % sum≤100        |           | none | optional | admin    | N      | Y     |

`co_agent` example shape:

```json
{
  "primary_agent_id": "…",
  "partners": [{ "agent_id": "…", "split_pct": 50 }],
  "notes": "internal"
}
```

Commission fields are **not** required for public marketplace browse; default private.

### 2.6 Ownership & transfer

| Field               | Description       | Type      | Req | Validation                            | Example                         | i18n | Source   | Editable  | Search | Index |
| ------------------- | ----------------- | --------- | --- | ------------------------------------- | ------------------------------- | ---- | -------- | --------- | ------ | ----- |
| `ownership_type`    | Tenure            | enum      | N   | freehold\|leasehold\|company\|unknown | `foreign_quota`/`thai` TBD enum | none | optional | publisher | Y      | Y     |
| `ownership_notes`   |                   | i18n_text | N   | no legal advice tone                  |                                 | i18n | optional | publisher | N      | N     |
| `transfer_fee_note` | Who pays transfer | i18n_text | N   | sourced if specific % claimed         |                                 | i18n | optional | publisher | N      | N     |
| `transfer_fee_pct`  | If numeric claim  | decimal   | N   | 0–100 + source                        |                                 | none | optional | publisher | N      | Y     |

Enum V1 recommend: `thai_freehold` \| `foreign_quota` \| `leasehold` \| `company_shares` \| `unknown`.

### 2.7 Furnishing, pets, parking, floor, view, direction

| Field                            | Description     | Type        | Req | Validation                                  | Example      | i18n          | Source   | Editable  | Search | Index |
| -------------------------------- | --------------- | ----------- | --- | ------------------------------------------- | ------------ | ------------- | -------- | --------- | ------ | ----- |
| `furniture` / `furniture_status` |                 | enum        | N   | unfurnished\|partial\|furnished\|unknown    | `furnished`  | none          | optional | publisher | Y      | Y     |
| `pets` / `pets_allowed`          |                 | enum/bool   | N   | yes\|no\|negotiable\|unknown                | `no`         | none          | optional | publisher | Y      | Y     |
| `parking` / `parking_spaces`     | Spaces          | int         | N   | ≥0                                          | `1`          | none          | optional | publisher | Y      | Y     |
| `parking_type`                   |                 | enum        | N   | covered\|open\|unknown                      |              | none          | optional | publisher | Y      | Y     |
| `floor` / `floor_label`          | Floor           | string/int  | N   |                                             | `12` / `12A` | none          | optional | publisher | Y      | Y     |
| `total_floors`                   | Building floors | int         | N   |                                             | `42`         | none          | optional | publisher | N      | Y     |
| `view` / `view_type`             |                 | string/enum | N   | city\|garden\|pool\|river\|blocked\|unknown | `city`       | i18n optional | optional | publisher | Y      | Y     |
| `direction`                      | Facing          | enum        | N   | N\|NE\|E\|SE\|S\|SW\|W\|NW\|unknown         | `NE`         | none          | optional | publisher | Y      | Y     |

### 2.8 Availability

| Field                                  | Description  | Type | Req | Validation                                             | Example      | i18n | Source   | Editable  | Search | Index |
| -------------------------------------- | ------------ | ---- | --- | ------------------------------------------------------ | ------------ | ---- | -------- | --------- | ------ | ----- |
| `availability` / `availability_status` | Market state | enum | Y   | available\|reserved\|sold\|rented\|off_market\|unknown | `available`  | none | required | publisher | Y      | Y     |
| `available_from`                       | Date         | date | N   |                                                        | `2026-08-01` | none | optional | publisher | N      | Y     |
| `min_lease_months`                     | Rent         | int  | N   | ≥1                                                     | `12`         | none | optional | publisher | N      | Y     |

### 2.9 Source, verification, freshness

| Field                                                          | Description           | Type      | Req | Validation                            | Example                           | i18n | Source          | Editable | Search | Index |
| -------------------------------------------------------------- | --------------------- | --------- | --- | ------------------------------------- | --------------------------------- | ---- | --------------- | -------- | ------ | ----- |
| `source`                                                       | Channel name          | string    | Y   | controlled list preferred             | `PropertyHub`                     | none | required        | system   | Y      | Y     |
| `listing_url`                                                  | Canonical source page | url       | Y   | http(s)                               | `https://www.propertyhub.in.th/…` | none | required        | system   | N      | Y     |
| `source_listing_id`                                            | Remote id             | string    | C   |                                       | `5640526`                         | none | required import | system   | Y      | Y     |
| `verification` / `verification_status` / `is_verified_listing` | Trust                 | enum/bool | Y   | verified\|unverified\|rejected\|stale | verified                          | none | system          | admin    | Y      | Y     |
| `last_update` / `source_updated_at`                            | Source freshness      | datetime  | Y   | ISO                                   |                                   | none | required        | system   | N      | Y     |
| `collected_at`                                                 | Harvest               | datetime  | Y   |                                       |                                   | none | required        | system   | N      | Y     |
| `platform_updated_at`                                          | Our row update        | datetime  | Y   |                                       |                                   | none | system          | none     | N      | Y     |
| `stale_after_days`                                             | Policy                | int       | N   | default 45–90 by class                | `60`                              | none | system          | admin    | N      | N     |

### 2.10 Geo & maps

| Field             | Description | Type      | Req | Validation          | Example     | i18n | Source    | Editable  | Search | Index |
| ----------------- | ----------- | --------- | --- | ------------------- | ----------- | ---- | --------- | --------- | ------ | ----- |
| `city_slug`       |             | slug      | Y*  | *or inherit project | `bangkok`   | none | required  | admin     | Y      | Y     |
| `district_slug`   |             | slug      | Y*  | Bangkok L3          | `bang-kapi` | none | required* | admin     | Y      | Y     |
| `address`         |             | i18n_text | C   |                     |             | i18n | optional  | publisher | Y      | N     |
| `latitude`        |             | decimal   | N   | with lng            | `13.763`    | none | optional  | publisher | N      | Y     |
| `longitude`       |             | decimal   | N   | with lat            | `100.647`   | none | optional  | publisher | N      | Y     |
| `google_maps_url` |             | url       | N   |                     |             | none | optional  | publisher | N      | N     |

Inherit project coords when listing lacks them; record `geo_inherited=true`.

### 2.11 Media

| Field             | Description | Type    | Req | Validation                | Example | i18n     | Source       | Editable  | Search | Index |
| ----------------- | ----------- | ------- | --- | ------------------------- | ------- | -------- | ------------ | --------- | ------ | ----- |
| `images`          | Gallery     | media[] | C   | L3 ≥5; cover required L2+ |         | alt i18n | required L2+ | publisher | N      | N     |
| `videos`          |             | media[] | N   | MEDIA_STANDARD            |         | none     | optional     | publisher | N      | N     |
| `cover_image_url` | Denorm      | url     | C   |                           |         | none     | derived      | system    | N      | N     |
| `floor_plans`     |             | media[] | N   |                           |         | none     | optional     | publisher | N      | N     |

### 2.12 People & company ties

| Field        | Description   | Type | Req | Validation    | Example | i18n | Source   | Editable | Search | Index |
| ------------ | ------------- | ---- | --- | ------------- | ------- | ---- | -------- | -------- | ------ | ----- |
| `agent_id`   | Listing agent | uuid | N   |               |         | none | optional | admin    | Y      | Y     |
| `owner_id`   | Owner         | uuid | N   | PII protected |         | none | optional | admin    | N      | Y     |
| `company_id` | Agency        | uuid | N   |               |         | none | optional | admin    | Y      | Y     |

### 2.13 SEO & publish

| Field                     | Description  | Type        | Req | Validation       | Example          | i18n     | Source   | Editable  | Search | Index |
| ------------------------- | ------------ | ----------- | --- | ---------------- | ---------------- | -------- | -------- | --------- | ------ | ----- |
| `seo_title`               |              | i18n_string | Y   | SEO_STANDARD     |                  | i18n     | derived  | admin     | N      | N     |
| `seo_description`         |              | i18n_text   | Y   |                  |                  | i18n     | derived  | admin     | N      | N     |
| `status` / `is_published` |              | enum/bool   | Y   |                  |                  | none     | system   | admin     | N      | Y     |
| `approval_state`          |              | enum        | Y   |                  |                  | none     | system   | admin     | N      | Y     |
| `quality_score`           |              | int         | N   | 0–100            |                  | none     | system   | system    | N      | Y     |
| `features`                | Amenity tags | string[]    | N   | controlled vocab | `["pool","gym"]` | glossary | optional | publisher | Y      | Y     |
| `locale_status`           |              | json        | N   |                  |                  | none     | system   | system    | N      | N     |

---

## 3. Conditional matrices

| If                   | Then required                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `listing_type=sale`  | `price_thb`                                                                                                        |
| `listing_type=rent`  | `rent_thb`                                                                                                         |
| Public L3            | source, listing_url, source_updated_at, city, district, media cover+4, bedrooms or studio flag, area_sqm preferred |
| Commission % claimed | `commission_pct` + visibility                                                                                      |
| Co-agent             | partners array valid                                                                                               |

---

## 4. Anti-fabrication rules

- No invented unit numbers, prices, or “sold in 3 days”.
- If source offline → mark stale/unpublish per review standard — do not guess new price.
- Rent and sale are separate listings even for same unit.

---

## 5. Indexing for 1M+ listings (architecture)

Primary filter indexes (conceptual):  
`(listing_type, city_slug, district_slug, property_type, price_thb|rent_thb, bedrooms, area_sqm, availability_status, is_verified_listing, project_slug)`

Full-text: title + description + project name (locale aware).  
Geo: lat/lng R-tree / PostGIS later.  
Dedup key: `(source, source_listing_id)` unique.

---

_End of Property Data Standard V1.0_
