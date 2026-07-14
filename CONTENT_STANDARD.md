# Content Standard V1.0

**Product:** GoThailandHome — Thailand Property Platform  
**Version:** 1.0  
**Status:** Design specification (no implementation)  
**Authority:** Permanent content contract for all future imports and publishing  
**Scale target:** ≥ 1,000,000 property listings  
**Peers:** Field depth inspired by Zillow, Rightmove, PropertyGuru, Realtor.com practices

**Related documents:**  
`FIELD_DICTIONARY.md` · `MEDIA_STANDARD.md` · `SEO_STANDARD.md` · `PROPERTY_DATA_STANDARD.md` · `PROJECT_STANDARD.md` · `DEVELOPER_STANDARD.md` · `AREA_STANDARD.md` · `CONTENT_REVIEW_STANDARD.md` · `MASTER_CONTENT_STANDARD.md`

---

## 1. Purpose

This standard defines **what content must exist**, at what quality, for every entity in the GoThailandHome graph. Import pipelines, CMS forms, partner feeds, and future marketplace publishers must comply.

It does **not** implement code, migrations, or page redesigns.

---

## 2. Design principles

1. **Source before claim** — every factual attribute carries provenance or is marked derived.
2. **Locale trinity** — public text supports `en` / `zh` / `th` (see field-level Translation rules).
3. **Stable identity** — slugs and external refs never recycle for different real-world entities.
4. **Separation of catalog vs commerce** — commission / co-agent / ownership fields are first-class content, even if commerce workflows ship later.
5. **Indexability** — searchable/indexable flags guide Elasticsearch/OpenSearch/Postgres FTS design later.
6. **Idempotent enrichment** — re-imports update fields; history tables record material changes.
7. **Human + automated review** — see CONTENT_REVIEW_STANDARD (AI review = process slot; product AI features remain out of Phase 6 build).

---

## 3. Entity catalog (required field groups)

### 3.1 Developer

Must support: legal/brand profile, multilingual names & descriptions, logo, website, Facebook, Google Maps, SEO block, awards, history narrative, financial/status disclosures (when public), stock exchange tickers (when listed), linked projects.

→ Details: `DEVELOPER_STANDARD.md`, `FIELD_DICTIONARY.md` § Developer

### 3.2 Project

Must support: developer link, city/district/subdistrict, masterplan, construction progress, completion, facilities, transportation (BTS/MRT/expressway), nearby schools/hospitals/malls, investment/rental yield/occupancy (when sourced), FAQ, media, SEO, Maps/social/official URLs.

→ `PROJECT_STANDARD.md`

### 3.3 Property Listing

Must support sale & rent modes: unit identity, beds/baths/area, price/rent, floor/view/direction, furniture/pets/parking, availability, ownership/transfer fee, commission/co-agent hooks, source/verification/last update, media, lat/lng/Maps, SEO, history.

→ `PROPERTY_DATA_STANDARD.md`

### 3.4 Area (composite)

Logical marketing “area” (corridor, neighborhood brand, e.g. “Sukhumvit”, “Riverside”) — may span multiple districts.

Must support: name locales, parent city, contained districts, lifestyle copy, transport summary, investment/rental narrative, linked project counts (derived), Maps viewport, SEO.

→ `AREA_STANDARD.md` § Area

### 3.5 District

Administrative or platform district under a city (Bangkok districts first).

Must support: city FK, names, population (official stats when cited), lifestyle, transportation, investment/rental copy, projects index (derived), schools/hospitals/shopping hubs, Maps, SEO.

→ `AREA_STANDARD.md` § District

### 3.6 City

Platform city hub (Bangkok, Pattaya, Phuket, Chiang Mai, Rayong, Hua Hin, …).

Must support: names, summaries, SEO, district index, Maps centroid/viewport, market one-liners (sourced or clearly labeled editorial).

→ `AREA_STANDARD.md` § City · `FIELD_DICTIONARY.md` § City

### 3.7 Agent

Public agent profile: identity, agency/company, license refs, bio locales, contacts, avatar, service areas, listings (derived), SEO, verification badge fields.

→ `FIELD_DICTIONARY.md` § Agent

### 3.8 Owner

Property owner (private individual or corporate). Content standard covers profile minimal fields for attribution — not a public CMS identity product until marketplace ships.

→ `FIELD_DICTIONARY.md` § Owner

### 3.9 Company

Agency / developer company / brokerage shell (may wrap Developer or Agent org).

Must support: legal name, brand, tax id (when collected), website, contacts, logo, members (relational), SEO.

→ `FIELD_DICTIONARY.md` § Company

### 3.10 Advertisement

Sponsored placement content: product type, creative assets, headlines locales, CTA URL, targeting facets, schedule, moderation status. Serving UI later; content contract now.

→ `FIELD_DICTIONARY.md` § Advertisement

### 3.11 SEO (cross-cutting)

Every public entity exposes: slug, canonical path, title, description, OG image, hreflang, optional Schema.org type. Rules in `SEO_STANDARD.md`.

### 3.12 Media (cross-cutting)

Images, videos, floor plans, brochures, virtual tour, Street View, Maps embeds — `MEDIA_STANDARD.md`.

### 3.13 FAQ (cross-cutting)

Question/answer locales, kind (`sourced` | `boilerplate` | `editorial`), sort order, optional FAQ schema eligibility.

→ `FIELD_DICTIONARY.md` § FAQ

### 3.14 Investment (cross-cutting / project & area)

Yield estimates, rent comps narrative, occupancy — **only when sourced or labeled modeled**. Never invent ROI.

→ `FIELD_DICTIONARY.md` § Investment · `PROJECT_STANDARD.md`

### 3.15 Transportation

Named node, mode (BTS/MRT/expressway/boat/ARL/bus), distance, walk minutes (if sourced), line tags.

### 3.16 School / Hospital / Facilities / Nearby Places

POI blocks with name locales, category, distance, source URL.

---

## 4. Common content blocks

Every major entity SHOULD include where applicable:

| Block           | Description                                 |
| --------------- | ------------------------------------------- |
| `identity`      | slug, external_ids, status                  |
| `i18n`          | en/zh/th text faces                         |
| `geo`           | city/district/lat/lng/maps_url              |
| `media`         | cover + gallery refs                        |
| `seo`           | title/description/og                        |
| `provenance`    | sources[], collected_at, updated_at         |
| `review`        | quality_score, verification, approval_state |
| `locale_status` | completeness per language                   |

---

## 5. Compliance levels

| Level             | Meaning                                                                                   | Typical public use                     |
| ----------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| **L0 Draft**      | Harvested; may miss locales; not public                                                   | Hidden                                 |
| **L1 Structured** | Required hard fields + provenance; editorial geography OK                                 | `noindex` or guide-only                |
| **L2 Localized**  | EN+ZH+TH for titles/SEO; cover image; project/developer hubs                              | Indexable hubs                         |
| **L3 Verified**   | L2 + MEDIA minima (≥5 images for listings) + source URL + fresh timestamps + review gates | **Floor for public verified listings** |
| **L4 Featured**   | L3 + human featured review, richer media (floor plan/VT preferred), highest quality band  | Home/spotlight                         |

Imports targeting production verified inventory must reach **L3**. Featured surfaces require **L4**.

---

## 6. Scale notes (≥ 1M listings)

- Prefer integer cents or `numeric(14,2)` THB; never float in prose as source of truth.
- External refs namespaced: `{portal}:{id}`.
- Soft-delete / `delisted` over hard delete for SEO/history.
- Partition history by month; keep “current” row denormalized on listing.
- Facets (city, district, beds, price buckets, transit tags) must be indexable.

---

## 7. Non-goals of this standard set

- Implementing migrations or parsers
- Redesigning UI
- Turning on payments, CRM, or marketplace workflows
- Guaranteeing AI-generated marketing copy (AI appears only as optional review assist in CONTENT_REVIEW_STANDARD)

---

## 8. Change control

Breaking field renames require Content Standard minor/major bump and migration notes. Additive optional fields may ship as V1.x without invalidating V1.0 packages that omit them.
