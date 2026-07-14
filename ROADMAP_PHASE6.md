# Roadmap — Phase 6 Property Factory

**Project:** GoThailandHome  
**Status:** Planning only — no implementation in this document set  
**Exclusions:** UI redesign · AI · CRM · Payment · Marketplace build  
**Related:** `PROPERTY_FACTORY_MASTER_PLAN.md` · `CONTENT_PIPELINE.md` · `IMPORT_PIPELINE_V2.md` · `DATA_STANDARD.md`

---

## 1. Phase outcome

By end of Phase 6 implementation (future work):

| KPI               | Target                                             |
| ----------------- | -------------------------------------------------- |
| Developers        | 100                                                |
| Real projects     | 500                                                |
| Verified listings | 10,000                                             |
| Bangkok districts | 100% SEO packages imported                         |
| Locales           | EN / ZH / TH structured fields on factory entities |

North-star quality: **every public listing has source + URL + update/capture date + verification state**.

---

## 2. Principles for sequencing

1. Standards and validators before volume.
2. Bangkok districts before non-Bangkok district depth.
3. Developers + projects before mass listings (listings need parent projects).
4. History + verification before aggressive publish.
5. v1 pipeline stays online until V2 dual-run passes.

---

## 3. Milestone plan

### M0 — Factory blueprint (this delivery)

**Done when docs exist:**

- [x] `PROPERTY_FACTORY_MASTER_PLAN.md`
- [x] `CONTENT_PIPELINE.md`
- [x] `IMPORT_PIPELINE_V2.md`
- [x] `DATA_STANDARD.md`
- [x] `ROADMAP_PHASE6.md`

**No code.**

---

### M1 — Schema + validators (implementation start)

**Build:**

- Additive DB: listing verification enum/column, `listing_price_history`, `import_batches`, `import_batch_items`
- JSON schemas + `property-factory validate`
- Glossary files for Bangkok districts + facility/transit terms

**Exit:** dry-run validate on Livin specimen + 1 new Bangkok district package.

---

### M2 — Area Factory: Bangkok districts

**Build:**

- Complete `content/areas/bangkok/districts/*` for all districts
- Content Pipeline templates for district SEO EN/ZH/TH
- Import districts via V2
- Confirm existing `/[lang]/districts/[slug]` renders without redesign

**Exit:** all Bangkok districts present with `publish_ready` SEO fields.

---

### M3 — Import Pipeline V2 core

**Build:**

- CLI: validate / dry-run / apply / resume
- Ordered upsert: developers → districts → projects → listings → history
- Adapter stubs for PropertyHub (first), then DDproperty, LivingInsider, FazWaz, official

**Exit:** dual-run v1 vs V2 on Livin package with identical public counts.

---

### M4 — Developer Factory wave 1 (n→20)

**Build:**

- Developer package template + importer
- Logo / website / Facebook / Maps / SEO fields filled from allowed sources
- Link developers to imported projects

**Exit:** 20 published developers with ≥1 linked project each preferred (not hard-required).

---

### M5 — Project Factory wave 1 (n→50 Bangkok)

**Build:**

- Project packages with city/district, Maps, facilities, transport, nearby, FAQ, media manifest
- Content Factory SEO assembly
- Public project pages remain as-is

**Exit:** 50 Bangkok projects published; each with provenance sources array.

---

### M6 — Listing Factory wave 1 (n→500)

**Build:**

- PropertyHub batch harvest → normalize → verify rules
- History rows on price change
- Public properties filters continue to use verified listings

**Exit:** 500 verified listings; zero listings without URL/source.

---

### M7 — Scale developers 20→100 & projects 50→200

**Ops-heavy:** parallel collection pods by brand / corridor (Sukhumvit, Rama 9, Riviera, etc.).

**Exit:** 100 developers staged/published; 200 projects published (Bangkok-majority).

---

### M8 — Listing scale 500→3,000

**Build:**

- Multi-adapter batches (DDproperty, LivingInsider, FazWaz)
- Stale detection job (design: periodic URL check)
- Quarantine queue for conflicts

**Exit:** 3,000 verified or explicitly `unverified` staging rows; public shows verified only.

---

### M9 — Project scale 200→500 & listings 3,000→10,000

**National expand** using same packages:

- Attach Pattaya / Phuket / Chiang Mai / Rayong / Hua Hin city shells (districts as needed)
- Listing batches tagged by `city_slug`

**Exit:** KPI targets met or documented shortfall with quality rationale (never fabricate to hit numbers).

---

### M10 — Hardening

- Import dashboards (admin-only, no redesign of public site)
- Retention for `_raw/` captures
- Runbooks: delist, reverify, district rename
- Freeze DATA_STANDARD v1.0

**Exit:** Phase 6 factory declared operational.

---

## 4. Workstream ownership (suggested)

| Stream    | Focus                              |
| --------- | ---------------------------------- |
| Standards | DATA_STANDARD, schemas             |
| Areas     | Bangkok districts                  |
| Catalog   | Developers + projects              |
| Listings  | Portal adapters + history          |
| Content   | Glossary + SEO templates           |
| Platform  | Additive migrations, admin reports |

---

## 5. Dependency graph

```text
M0 docs
  └─ M1 schema/validators
       ├─ M2 Bangkok districts
       └─ M3 Import V2
            ├─ M4 Developers
            ├─ M5 Projects ← needs M2 for district FKs
            └─ M6 Listings ← needs M5 parents
                 └─ M7–M9 volume
                      └─ M10 hardening
```

---

## 6. Risk register

| Risk                           | Mitigation                                            |
| ------------------------------ | ----------------------------------------------------- |
| Portal ToS / blocking          | Prefer official sources; rate-limit; partnership path |
| Duplicate units across portals | Keep both in Phase 6; history per URL                 |
| Locale gaps                    | Content Pipeline completeness gates                   |
| Pressure to fabricate volume   | Hard reject in validators; KPI may slip               |
| Breaking public pages          | Additive schema; dry-run; verified-only public filter |
| Scope creep into marketplace   | Explicit exclusion; refer to Architecture V2          |

---

## 7. Definition of done (Phase 6)

- [ ] 100 developer profiles importable & navigable via existing developer routes
- [ ] 500 projects with required factory fields
- [ ] 10,000 listings with source + URL + update date + verification
- [ ] Listing history recorded on changes
- [ ] All Bangkok district SEO packages live
- [ ] EN/ZH/TH structured content gates enforced
- [ ] Import Pipeline V2 operational with dry-run/apply/resume
- [ ] No AI / CRM / payment / marketplace features shipped under Phase 6 label

---

## 8. Immediate next action (when implementation approved)

Start **M1** only: additive migrations + JSON validators + Bangkok district glossary — still no redesign, no marketplace.
