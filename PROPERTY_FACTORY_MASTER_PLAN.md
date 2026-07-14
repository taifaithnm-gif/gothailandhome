# Property Factory Master Plan

**Project:** GoThailandHome  
**Phase:** 6 — Property Factory  
**Status:** Design only — no code implementation in this deliverable  
**Stance:** Extend current architecture only. No redesign. No AI. No CRM. No Payment. No Marketplace implementation.

---

## 1. Mission

Build a **Thailand Property Content Factory** that scales verified real-estate inventory into Supabase and public SEO surfaces:

| Factory           | Target                          | Output entity                       |
| ----------------- | ------------------------------- | ----------------------------------- |
| Developer Factory | **100** developers              | `developers` + SEO pages            |
| Project Factory   | **500** real projects           | `property_projects` + SEO pages     |
| Listing Factory   | **10,000** verified listings    | `properties` + history              |
| Area Factory      | All **Bangkok districts** first | `districts` (+ city hubs) SEO       |
| Content Factory   | EN / ZH / TH structured copy    | multilingual fields on all entities |

The factory produces **data packages** and **import jobs**, not new product surfaces. Existing `/[lang]/…` routes and import patterns remain the delivery channel.

---

## 2. Principles

1. **Real data only** — no fabricated prices, availability, coordinates, or project specs.
2. **Provenance always** — every listing stores `source`, `listing_url` (source URL), update/capture date, verification status.
3. **Idempotent upserts** — re-running imports updates; never doubles inventory (`slug`, `external_ref`, `listing_url`).
4. **Compatible schema** — additive columns/tables only; keep Phase 3–5 tables.
5. **Pipeline over CMS** — content arrives via packages + Import Pipeline V2, not a public CMS.
6. **Human gate for publish** — scraped drafts can stage; public `status = published` requires verification rules.
7. **Locale trinity** — every public text block has `en` / `zh` / `th` (or explicit `pending` flag — see DATA_STANDARD).
8. **Marketplace V2 deferred** — roles, billing, co-agent, payments stay in `PLATFORM_ARCHITECTURE_V2.md` and are out of Phase 6 scope.

---

## 3. Relationship to current platform

```text
Existing foundation
├─ developers / property_projects / properties
├─ cities / districts / locations
├─ inquiries (+ UTM)
├─ condo-import (v1) → content/projects/<slug>/
└─ public SEO pages (projects, cities, districts, listings)

Phase 6 Property Factory (design)
├─ package layout at scale (developers / projects / districts / listings)
├─ Import Pipeline V2 (batch, resume, history)
├─ Content Factory (structured multilingual fill rules)
├─ verification + listing history
└─ Bangkok Area Factory priority queue
```

Current single-project package (`content/projects/the-livin-ramkhamhaeng/`) is the **reference specimen** for quality bars.

---

## 4. Factory overview

### 4.1 Developer Factory (100)

Each developer record must support:

| Field group | Examples                                                    |
| ----------- | ----------------------------------------------------------- |
| Profile     | legal + brand names EN/ZH/TH, description                   |
| Assets      | logo URL / storage path                                     |
| Links       | official website, Facebook, Google Maps (HQ or brand place) |
| SEO         | title + description EN/ZH/TH                                |
| Relations   | published `property_projects`                               |

**Sources (allowed):** official site, official Facebook, Google Maps, public portals naming the developer, press only when corroborated.

**Output package (design):** `content/developers/<developer-slug>/manifest.json`

### 4.2 Project Factory (500)

Each project must support:

| Field group    | Required                                                      |
| -------------- | ------------------------------------------------------------- |
| Developer      | FK / slug                                                     |
| Geography      | city + district                                               |
| Links          | Google Maps, Facebook, official website                       |
| Media          | image set (cover + gallery) — sourced URLs or Storage mirrors |
| Facilities     | structured zones/items                                        |
| Transportation | named nodes + distances when sourced                          |
| Nearby         | schools, hospitals (malls optional but preferred)             |
| FAQ            | sourced or standard templates only when marked as boilerplate |
| SEO            | title + description EN/ZH/TH                                  |

**Output package:** extends v1 `content/projects/<project-slug>/manifest.json` (+ media manifest).

### 4.3 Listing Factory (10,000)

**Allowed listing sources:**

- PropertyHub
- DDproperty
- LivingInsider
- FazWaz
- Official developers (sales list / booking price sheets that are public)

Each listing must keep:

| Field               | Notes                                            |
| ------------------- | ------------------------------------------------ |
| `source`            | Portal / developer site name                     |
| `listing_url`       | Canonical source URL                             |
| `source_updated_at` | Portal update date, else capture date + note     |
| Verification status | `unverified` → `verified` → `stale` / `delisted` |
| `listing_type`      | `sale` / `rent`                                  |
| History             | append-only price & status snapshots             |

**Output package:** `content/listings/batches/<batch-id>.json` or per-project `listings.json` (both supported in V2).

### 4.4 Area Factory (Bangkok first)

1. Seed / complete all **Bangkok districts** in `districts` under city `bangkok`.
2. Enrich each with SEO + summary EN/ZH/TH + optional landmarks (sourced).
3. Generate/maintain district SEO pages using existing routing (`/[lang]/districts/[slug]`).
4. Later cities (Pattaya, Phuket, …) reuse the same district package format.

**Output package:** `content/areas/bangkok/districts/<district-slug>.json`

### 4.5 Content Factory

Automated **structured** preparation of EN/ZH/TH fields for:

- developers
- projects
- districts
- listings

Automation means **deterministic templates + field mapping + translation memory / glossary**, not generative AI products (out of scope for Phase 6). Gaps remain flagged until human or glossary-backed fill.

See `CONTENT_PIPELINE.md`.

---

## 5. System architecture (logical)

```text
┌─────────────────────────────────────────────────────────┐
│  Collection layer                                       │
│  portals / official sites / Maps / Facebook (manual or  │
│  assisted harvest) → RAW captures (URL, timestamp, hash)│
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Normalize layer (Data Standard)                        │
│  slugs, money THB, sqm, floors, transit tags, locales   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Content Factory                                        │
│  EN/ZH/TH field completion + SEO assembly               │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Package store (git / object storage)                   │
│  content/developers|projects|areas|listings             │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Import Pipeline V2                                     │
│  validate → dry-run → upsert → history → report         │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Supabase (compatible schema + additive tables)         │
│  → existing public pages / admin tools                  │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Target volume plan

| Wave               | Developers  | Projects      | Listings | Areas                           |
| ------------------ | ----------- | ------------- | -------- | ------------------------------- |
| W0 Specimen        | 1 (Risland) | 1 (Livin Ram) | 5        | Bang Kapi sample                |
| W1 Bangkok spine   | 20          | 50            | 500      | All Bangkok districts SEO shell |
| W2 Bangkok depth   | 50          | 200           | 3,000    | District enrichment             |
| W3 National expand | 100         | 500           | 10,000   | + Pattaya / Phuket / CM shells  |

Targets are **ceilings by Phase 6 completion**, not overnight loads. Quality gates overrule volume.

---

## 7. Database extension (additive — design)

Keep existing tables. Additions planned for implementation later:

| Addition                                                        | Purpose                            |
| --------------------------------------------------------------- | ---------------------------------- |
| `listing_verification_status` enum + column on `properties`     | verified / stale / delisted        |
| `listing_price_history`                                         | append-only price & type snapshots |
| `import_batches` / `import_batch_items`                         | V2 job tracking                    |
| `content_locales_status` jsonb (optional)                       | track EN/ZH/TH completeness        |
| `developers.google_maps_url` (if missing)                       | Maps link parity with projects     |
| District enrichment columns already largely present via Phase 5 | Area Factory fills rows            |

No marketplace / billing / AI tables in Phase 6 factory build.

---

## 8. Quality gates (ship blockers)

A package may not publish if:

- Missing `listing_url` / `source` on any listing
- Price present without source URL
- Coordinates without Maps or portal geo evidence
- Project without `city_slug` + `district_slug` (Bangkok wave)
- Any of EN/ZH/TH required SEO titles empty when `publish_ready=true`
- Duplicate `listing_url` across packages with conflicting prices without history entry

---

## 9. Document set

| Document                          | Role                                          |
| --------------------------------- | --------------------------------------------- |
| `PROPERTY_FACTORY_MASTER_PLAN.md` | This overview                                 |
| `CONTENT_PIPELINE.md`             | Multilingual content factory rules            |
| `IMPORT_PIPELINE_V2.md`           | Batch import architecture                     |
| `DATA_STANDARD.md`                | Field contracts and norms                     |
| `ROADMAP_PHASE6.md`               | Sequencing and milestones                     |
| `PLATFORM_ARCHITECTURE_V2.md`     | Marketplace (explicitly out of Phase 6 build) |

---

## 10. Explicit exclusions

| Excluded                                   | Reason                               |
| ------------------------------------------ | ------------------------------------ |
| UI redesign                                | Existing pages only extended by data |
| AI generation / recommendation             | Out of Phase 6                       |
| CRM                                        | Architecture V2 only                 |
| Payment / membership billing               | Architecture V2 only                 |
| Marketplace roles / co-agent / commissions | Architecture V2 only                 |

---

## 11. Success definition

Phase 6 factory is successful when operators can:

1. Add a developer package and land a SEO developer page.
2. Add a project package linked to city/district with facilities/transport/nearby/FAQ.
3. Ingest verified listings at batch scale with history and provenance.
4. Maintain Bangkok district SEO pages with EN/ZH/TH.
5. Re-run imports safely (idempotent) and report diffs.

Volume targets (100 / 500 / 10,000) are the scale north-star under those rules.
