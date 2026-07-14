# Data Standard

**Phase:** 6 — Property Factory  
**Status:** Design only  
**Purpose:** Single contract for packages, Import Pipeline V2, and Content Pipeline  
**Compatibility:** Aligns with existing Supabase catalog (`developers`, `property_projects`, `properties`, `cities`, `districts`, …)

---

## 1. Global rules

1. **THB** for all money fields (`price_thb` numeric). No FX in Phase 6.
2. **Metric** only (`area_sqm`, distances as string with unit when sourced, e.g. `"350 m"`).
3. **Slugs:** `kebab-case`, ASCII, stable; never reuse a slug for a different entity.
4. **Locales:** objects `{ "en", "zh", "th" }` for human text.
5. **Timestamps:** ISO-8601 dates; date-only allowed as `YYYY-MM-DD` (stored as timestamptz midnight UTC on import).
6. **No fabrication:** omit field rather than invent.
7. **Sources array** preferred on factual blocks: `{ "type", "name", "url" }`.
8. **Boolean publish flags:** `publish_ready` on packages; DB `status` remains source of truth after import.

---

## 2. Source allow-list

| `source` code         | Display name                      | Use                                         |
| --------------------- | --------------------------------- | ------------------------------------------- |
| `propertyhub`         | PropertyHub                       | Listings + project pages                    |
| `ddproperty`          | DDproperty                        | Listings + project pages                    |
| `livinginsider`       | LivingInsider                     | Listings                                    |
| `fazwaz`              | FazWaz                            | Listings                                    |
| `official_developer`  | Official developer / project site | Specs, media, prices if public              |
| `facebook`            | Official Facebook                 | Profile links only (not prices)             |
| `google_maps`         | Google Maps                       | Coordinates / place URL                     |
| `other_public_portal` | Named portal                      | Allowed only if documented in batch `notes` |

Listing `source` field should use the **code** above (or exact brand string consistent with existing `PropertyHub` rows — V2 normalizes to code on write).

---

## 3. Geographic standard

### Cities (fixed Phase 6 spine)

| slug         | EN         |
| ------------ | ---------- |
| `bangkok`    | Bangkok    |
| `pattaya`    | Pattaya    |
| `phuket`     | Phuket     |
| `chiang-mai` | Chiang Mai |
| `rayong`     | Rayong     |
| `hua-hin`    | Hua Hin    |

### Districts

- Bangkok wave: one package per district under `content/areas/bangkok/districts/`.
- `district.slug` unique globally (existing schema).
- Always include `city_slug`.

### Location rows

`locations.slug` may remain neighborhood-grain (e.g. `hua-mak-bang-kapi-bangkok`) while `city_id` / `district_id` attach for filtering.

---

## 4. Developer package schema

`content/developers/<slug>/manifest.json`

```json
{
  "slug": "risland-thailand",
  "collected_at": "2026-07-14",
  "publish_ready": true,
  "sources": [{ "type": "official_developer", "name": "", "url": "" }],
  "name": { "en": "", "zh": "", "th": "" },
  "legal_name": { "en": "", "zh": "", "th": "" },
  "description": { "en": "", "zh": "", "th": "" },
  "website": "https://",
  "facebook_url": "https://facebook.com/...",
  "google_maps_url": "https://maps.google.com/...",
  "logo_url": "https://... or null",
  "phone": null,
  "email": null,
  "seo": {
    "title": { "en": "", "zh": "", "th": "" },
    "description": { "en": "", "zh": "", "th": "" }
  },
  "locale_status": { "en": "complete", "zh": "complete", "th": "complete" }
}
```

**Required for publish_ready:** `slug`, `name.*`, `website` or `facebook_url`, `seo.title.*`, `seo.description.*`, ≥1 source.

---

## 5. Project package schema

Extends v1 `manifest.json`:

```json
{
  "slug": "the-livin-ramkhamhaeng",
  "collected_at": "2026-07-14",
  "publish_ready": true,
  "sources": [],
  "developer": {
    "slug": "risland-thailand",
    "name": { "en": "", "zh": "", "th": "" }
  },
  "location": {
    "slug": "hua-mak-bang-kapi-bangkok",
    "city_slug": "bangkok",
    "district_slug": "bang-kapi",
    "name": { "en": "", "zh": "", "th": "" },
    "city": { "en": "", "zh": "", "th": "" },
    "province": { "en": "", "zh": "", "th": "" },
    "country_code": "TH"
  },
  "project": {
    "name": { "en": "", "zh": "", "th": "" },
    "description": { "en": "", "zh": "", "th": "" },
    "address": { "en": "", "zh": "", "th": "" },
    "postal_code": "10240",
    "latitude": 13.763,
    "longitude": 100.647,
    "google_maps_url": "https://",
    "official_website": "https://",
    "facebook_url": "https://",
    "completion_year": 2024,
    "total_floors": 42,
    "total_units": 1938,
    "building_count": 1,
    "land_area_rai": "8-3-33",
    "parking_spaces": 755,
    "transit_tags": ["mrt", "mrt-orange", "mrt-yellow"],
    "unit_types": [
      {
        "code": "32",
        "area_sqm": 32,
        "label": { "en": "", "zh": "", "th": "" },
        "source": "https://"
      }
    ],
    "facilities": [
      {
        "zone": { "en": "", "zh": "", "th": "" },
        "items": [{ "en": "", "zh": "", "th": "" }],
        "source": "https://"
      }
    ],
    "transportation": [
      {
        "name": { "en": "", "zh": "", "th": "" },
        "distance": "350 m",
        "source": "https://"
      }
    ],
    "nearby_schools": [
      {
        "name": { "en": "", "zh": "", "th": "" },
        "distance": "1.2 km",
        "source": "https://"
      }
    ],
    "nearby_hospitals": [
      {
        "name": { "en": "", "zh": "", "th": "" },
        "distance": "1.4 km",
        "source": "https://"
      }
    ],
    "nearby_malls": [
      {
        "name": { "en": "", "zh": "", "th": "" },
        "distance": "950 m",
        "source": "https://"
      }
    ],
    "faq": [
      {
        "question": { "en": "", "zh": "", "th": "" },
        "answer": { "en": "", "zh": "", "th": "" },
        "kind": "sourced"
      }
    ],
    "seo": {
      "title": { "en": "", "zh": "", "th": "" },
      "description": { "en": "", "zh": "", "th": "" }
    },
    "og_image_path": "/og/projects/<slug>.svg",
    "hero_image_path": "/projects/<slug>/hero.jpg"
  },
  "media": {
    "items": [
      {
        "url": "https://",
        "role": "cover",
        "source": "https://",
        "rights_note": "hotlink or mirrored"
      }
    ]
  }
}
```

**Required for publish_ready:** developer slug, city_slug, district_slug (Bangkok wave), name, address, ≥1 of maps/website, seo.*, ≥1 source.

Coordinates: require `google_maps_url` or documented portal geo; precision notes allowed in `coordinate_note`.

---

## 6. Listing record schema

```json
{
  "external_ref": "propertyhub-5640526",
  "listing_type": "sale",
  "property_type": "condo",
  "price_thb": 3510062,
  "bedrooms": 1,
  "bathrooms": 1,
  "area_sqm": 32.94,
  "floor_label": "22",
  "building_label": null,
  "project_slug": "the-livin-ramkhamhaeng",
  "developer_slug": "risland-thailand",
  "city_slug": "bangkok",
  "district_slug": "bang-kapi",
  "transit_tags": ["mrt"],
  "title": { "en": "", "zh": "", "th": "" },
  "summary": { "en": "", "zh": "", "th": "" },
  "description": { "en": "", "zh": "", "th": "" },
  "featured": false,
  "source": "propertyhub",
  "listing_url": "https://propertyhub.in.th/...",
  "source_updated_at": "2026-07-14",
  "source_update_note": "Portal Last Update was '-' ; capture date used.",
  "verification_status": "verified",
  "publish_ready": true,
  "collected_at": "2026-07-14",
  "locale_status": { "en": "complete", "zh": "complete", "th": "complete" }
}
```

### Verification status enum

`unverified` | `verified` | `stale` | `delisted`

### History row (DB)

```text
listing_price_history
  id
  property_id
  price_thb
  listing_type
  verification_status
  source
  listing_url
  observed_at
  batch_id
  note
```

**Required:** `external_ref` or stable id, `listing_type`, `price_thb`, `source`, `listing_url`, `source_updated_at`, `project_slug` (Phase 6: listings should attach to a known project whenever possible; orphan listings allowed only as `unverified` staging).

---

## 7. District package schema

`content/areas/bangkok/districts/<slug>.json`

```json
{
  "city_slug": "bangkok",
  "slug": "bang-kapi",
  "name": { "en": "Bang Kapi", "zh": "挽甲必", "th": "บางกะปิ" },
  "summary": { "en": "", "zh": "", "th": "" },
  "seo": {
    "title": { "en": "", "zh": "", "th": "" },
    "description": { "en": "", "zh": "", "th": "" }
  },
  "publish_ready": true,
  "sources": [
    { "type": "other_public_portal", "name": "official toponymy", "url": "" }
  ],
  "locale_status": { "en": "complete", "zh": "complete", "th": "complete" }
}
```

No project/listing prices inside district packages.

---

## 8. Transit tags

Controlled vocabulary (extend via glossary):

| Tag                 | Meaning            |
| ------------------- | ------------------ |
| `bts`               | Near BTS (generic) |
| `mrt`               | Near MRT (generic) |
| `mrt-orange`        | Orange Line        |
| `mrt-yellow`        | Yellow Line        |
| `mrt-blue`          | Blue Line          |
| `mrt-brown-planned` | Brown Line planned |
| `arl`               | Airport Rail Link  |
| `boat`              | Pier / boat        |

Use specific line tags when official distance tables justify them; otherwise `bts` / `mrt` only.

---

## 9. Media standard

| Role        | Notes           |
| ----------- | --------------- |
| `cover`     | One per project |
| `gallery`   | Ordered         |
| `floorplan` | Optional        |
| `facility`  | Optional        |

Each item: `url`, `role`, `source`, `rights_note` (`hotlink` | `mirrored_to_storage` | `unknown`).  
Phase 6 may hotlink publicly allowed assets; Storage mirror is optional optimization.

---

## 10. Soft vs hard validation

| Severity                      | Examples                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| **Hard (block import apply)** | missing listing_url; fabricated gate fail; unknown city_slug; invalid listing_type |
| **Soft (warn)**               | SEO length; missing logo; missing Facebook; partial locale on listing body         |

---

## 11. Mapping to Supabase (existing)

| Package field            | Table.column                                                  |
| ------------------------ | ------------------------------------------------------------- |
| developer.*              | `developers.*`                                                |
| project.*                | `property_projects.*`                                         |
| location + city/district | `locations` + FKs; project/property `city_id` / `district_id` |
| listings                 | `properties.*` (+ verification column additive)               |
| media                    | `property_media` or project hero paths under `public/`        |
| district package         | `districts.*`                                                 |

Additive columns only when implementing; until then store verification in package and map to `is_verified_listing` boolean.

---

## 12. Example specimen

Canonical compliant specimen remains:

`content/projects/the-livin-ramkhamhaeng/`

All new packages should match or exceed its provenance discipline.
