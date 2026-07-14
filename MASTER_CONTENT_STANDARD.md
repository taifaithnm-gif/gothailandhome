# Master Content Standard V1.0

**Product:** GoThailandHome — Thailand Property Platform  
**Version:** 1.0  
**Status:** Design specification (architecture only — no code)  
**Authority:** Permanent merged content contract. All future imports, partner feeds, and publishers must comply.  
**Scale:** Designed for ≥ 1,000,000 property listings (Zillow / Rightmove / PropertyGuru / Realtor.com class).

---

## Document map

| #   | Document                                                   | Role                                                                                                                 |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | [CONTENT_STANDARD.md](./CONTENT_STANDARD.md)               | Entity catalog, principles, compliance levels L0–L4                                                                  |
| 2   | [FIELD_DICTIONARY.md](./FIELD_DICTIONARY.md)               | Field-level Name / Type / Required / Validation / Example / Translation / Source / Editable / Searchable / Indexable |
| 3   | [MEDIA_STANDARD.md](./MEDIA_STANDARD.md)                   | Images, video, floor plans, brochures, VT, Street View, Maps, naming, sizes, watermark, compression, thumbs          |
| 4   | [SEO_STANDARD.md](./SEO_STANDARD.md)                       | URL, slug, title, description, OG, Schema.org, canonical, internal links, breadcrumb, FAQ schema                     |
| 5   | [PROPERTY_DATA_STANDARD.md](./PROPERTY_DATA_STANDARD.md)   | Full listing field set (sale/rent through verification & media)                                                      |
| 6   | [PROJECT_STANDARD.md](./PROJECT_STANDARD.md)               | Project: masterplan, progress, facilities, transit, nearby, investment, FAQ                                          |
| 7   | [DEVELOPER_STANDARD.md](./DEVELOPER_STANDARD.md)           | Developer profile, history, projects, financials, stock, social, awards                                              |
| 8   | [AREA_STANDARD.md](./AREA_STANDARD.md)                     | City, district, subdistrict, marketing area                                                                          |
| 9   | [CONTENT_REVIEW_STANDARD.md](./CONTENT_REVIEW_STANDARD.md) | Quality score, photos, dupes, fake detection, price/source, AI+human, approval                                       |
| 10  | **This file**                                              | Single entry point — merged norm                                                                                     |

Related (not superseded): `DATA_STANDARD.md`, `PROPERTY_FACTORY_MASTER_PLAN.md`, `IMPORT_PIPELINE_V2.md`, `PLATFORM_ARCHITECTURE_V2.md`.

---

## 1. Executive contract

1. **No claim without source** (or explicit `derived` / `editorial` / `modeled` label).
2. **Locales:** public text faces `en` / `zh` / `th`. Slugs are ASCII kebab-case only.
3. **Money:** THB primary; positive sale/rent by listing type.
4. **Listings floor:** public verified inventory = **L3** (see §3).
5. **Identity:** `(source, source_listing_id)` unique; soft-delete over erase.
6. **Media rights** required on every public asset (`hotlink` \| `mirrored` \| `licensed`).
7. **SEO** follows locale-prefixed URLs; Schema/OG only for published truths.
8. **Review** gates apply before indexation; AI assists but never invents prices/yields/availability.
9. **This V1.0** is additive-compatible: new optional fields may appear in V1.x; renames need a version bump.

---

## 2. Entity graph (normative)

```text
City
 └── District
      └── Subdistrict (optional)
Area (marketing) ──spans──> Districts

Developer ──owns──> Project ──contains──> Property Listing
Company ──employs──> Agent
Owner ──may own──> Listing (PII private)
Listing ──media──> Media
Project/Area/Listing ──may──> FAQ, Investment, Transportation, School, Hospital, Facilities, Nearby Places
Advertisement ──targets──> facets (city/district/type)
SEO + Review ──overlay──> all public entities
```

---

## 3. Compliance levels (normative)

| Level  | Name           | Listing public?                   |
| ------ | -------------- | --------------------------------- |
| L0     | Draft          | No                                |
| L1     | Structured     | No / thin noindex                 |
| L2     | Localized hubs | Projects/devs/areas may index     |
| **L3** | **Verified**   | **Yes — verified listings floor** |
| L4     | Featured       | Yes — spotlight                   |

Full definitions: CONTENT_STANDARD §5 · enforcement: CONTENT_REVIEW_STANDARD.

---

## 4. Merged required field groups

### 4.1 Developer

Profile, legal/brand names (i18n), history, projects (derived), financial status (cited), stock exchange/ticker, website, Facebook, Google Maps, awards (cited), logo, SEO, sources.  
→ DEVELOPER_STANDARD · FIELD_DICTIONARY § Developer

### 4.2 Project

Developer, location (city/district/subdistrict/address/geo/Maps), masterplan, construction progress, completion, facilities, nearby BTS/MRT/expressway, schools, hospitals, shopping, investment (yield/occupancy + method/disclaimer), FAQ, media, SEO, sources.  
→ PROJECT_STANDARD

### 4.3 Property Listing

`listing_type` sale|rent, developer, project, unit number, bedrooms, bathrooms, area, price_thb / rent_thb, commission, co-agent, ownership, transfer fee, furniture, pets, parking, floor, view, direction, availability, source, verification, last update, images, videos, latitude, longitude, Google Maps, SEO, features.  
→ PROPERTY_DATA_STANDARD

### 4.4 Area / District / City

Names (i18n), population (cited), lifestyle, transportation, investment, rental, projects (derived), schools, hospitals, shopping, Google Maps, SEO. Subdistrict optional. Marketing Area may span districts.  
→ AREA_STANDARD

### 4.5 Agent / Owner / Company

Agent: profile, company, license, contacts, avatar, service geos, verification.  
Owner: private; verification_status; never leak PII publicly.  
Company: type, legal/brand, tax id, website, contacts, Maps, SEO.  
→ FIELD_DICTIONARY

### 4.6 Advertisement

Product type, advertiser, headline/body i18n, CTA, creatives, targeting, schedule, moderation + status.  
→ FIELD_DICTIONARY § Advertisement

### 4.7 SEO / Media / FAQ / Investment / POIs

Cross-cutting blocks per FIELD_DICTIONARY + MEDIA_STANDARD + SEO_STANDARD.

---

## 5. Field dictionary norm

Every persisted content field in V1.0 MUST be describable with:

| Attribute   | Purpose                                   |
| ----------- | ----------------------------------------- |
| Field Name  | Stable machine key                        |
| Description | Business meaning                          |
| Type        | string, i18n_*, money_thb, enum, geo, …   |
| Required    | Y / C / N                                 |
| Validation  | Constraints                               |
| Example     | Concrete sample                           |
| Translation | i18n \| none \| glossary                  |
| Source      | required \| optional \| derived \| system |
| Editable    | admin \| publisher \| system \| none      |
| Searchable  | Full-text participation                   |
| Indexable   | Facet/filter/sort                         |

Canonical tables: FIELD_DICTIONARY.md (entity sections) + deep lists in PROPERTY / PROJECT / DEVELOPER / AREA docs.

---

## 6. Media norm (summary)

- **Classes:** images, videos, floor plans, brochures, virtual tour, Street View, Maps.
- **Naming:** `{entity}/{slug}/{role}/{yyyy}/{mm}/{slug}-{role}-{nn}.{ext}`
- **Sizes:** thumb 320 · card 640 · gallery 1600 · hero 2400 · og 1200×630.
- **Listing L3:** ≥5 images meeting min long-edge (or hotlink policy).
- **Watermark:** optional on mirrored licensed assets; never on hotlinks; never obscure plan labels.
- **Compression:** WebP/JPEG quality bands; strip public EXIF GPS by default.
- **Rights:** mandatory on public assets.

→ MEDIA_STANDARD.md

---

## 7. SEO norm (summary)

- URLs: `/{lang}/{entity}/{slug}` with `en`|`zh`|`th`.
- Slugs: `[a-z0-9-]{3,80}`, immortal with redirects on change.
- Titles/descriptions: templated, factual, soft length caps.
- OG + Twitter large image; hreflang + `x-default`→en.
- Schema.org: RealEstateListing / ApartmentComplex / Place / FAQPage / BreadcrumbList — no fake ratings.
- Canonical absolute; thin/facet pages noindex policy.
- Internal links: listing→project→developer→district→city.

→ SEO_STANDARD.md

---

## 8. Review norm (summary)

- **Quality score** 0–100 (completeness, media, provenance, consistency, freshness, locale).
- **Duplicates:** hard on `(source, id)`; soft clusters with one primary index URL.
- **Fake detection:** hard block vs soft flag matrix.
- **Price / source validation:** required fields, bands, staleness.
- **AI review:** assist only; no invented facts.
- **Human review:** queues for flags, L4, ads, yields.
- **Workflow:** draft → validate → score → (AI) → pending → approved/rejected → published → stale/archive.

→ CONTENT_REVIEW_STANDARD.md

---

## 9. Indexing architecture (1M+)

**Listing facet key (conceptual):**  
`(listing_type, city_slug, district_slug, property_type, price_or_rent, bedrooms, area_sqm, availability_status, verification, project_slug, transit_tags)`

**Uniques:** listing slug; `(source, source_listing_id)`; entity slugs per type.  
**Geo:** lat/lng (+ future PostGIS).  
**FTS:** locale-aware title/description/project name.  
**Sitemaps:** split by entity; only approved published !noindex.

---

## 10. Import compliance gate (normative checklist)

A package may be marked **Content Standard V1.0 compliant** only if:

- [ ] Entity type identified and fields map to dictionary keys
- [ ] Required/conditional matrices satisfied for target L-level
- [ ] Provenance (`sources` / listing_url / timestamps) present
- [ ] Media rights + naming/size policy for public assets
- [ ] SEO titles/descriptions/slugs valid
- [ ] Investment/population/progress claims cited or omitted
- [ ] Quality score computed; hard review gates pass
- [ ] No fabricated availability, prices, or yields
- [ ] Locales present per L2+ targets
- [ ] Duplicate keys respected (upsert not fork)

---

## 11. Non-goals (this phase)

- No application code, page changes, or database migrations in the Phase 6 design drop.
- No commitment to a specific search engine vendor.
- No live payment, CRM, or ad-serving implementation (fields reserved).
- No guarantee of third-party portal Terms — ops must respect crawl/license rules.

---

## 12. Versioning & ownership

| Item             | Rule                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Standard version | Semver on this master + child docs in lockstep for breaking changes                                                |
| Owners           | Content architecture + platform eng (future RACI)                                                                  |
| Conflicts        | Prefer this Master + child specialty doc over older `DATA_STANDARD.md` notes; update legacy docs when implementing |
| Amendments       | Additive fields = V1.x; renames/removals = V2 proposal                                                             |

---

## 13. Quick reference — listing L3 minimum

| Must have                                                    | Notes              |
| ------------------------------------------------------------ | ------------------ |
| `slug`, `listing_type`, `property_type`                      |                    |
| `price_thb` or `rent_thb`                                    | By type            |
| `city_slug`, `district_slug`                                 | Bangkok-first hard |
| `source`, `listing_url`, `source_updated_at`, `collected_at` |                    |
| Verification = verified path                                 | Per review         |
| ≥5 images + cover rules                                      | MEDIA              |
| `seo_title`, `seo_description`                               | SEO                |
| Approval → published                                         | REVIEW             |

---

## 14. Quick reference — project L2 minimum

Developer slug · city · district · address · ≥1 maps/coords · ≥1 source · i18n name · SEO · cover · no invented yield/progress.

---

## 15. Adoption statement

> GoThailandHome Content Standard V1.0 is the permanent specification for catalog content.  
> Everything imported in the future must comply with this master and its child standards.  
> Implementation happens in later phases; this document set is **design only**.

---

_End of Master Content Standard V1.0_
