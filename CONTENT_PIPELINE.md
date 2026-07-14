# Content Pipeline

**Phase:** 6 — Property Factory  
**Status:** Design only  
**Scope:** Structured multilingual content (EN / ZH / TH) for developers, projects, districts, and listings  
**Out of scope:** Generative AI products, redesign, marketplace copy systems

---

## 1. Goal

Automatically prepare **structured** locale fields so every public entity can render on `/en`, `/zh`, `/th` without ad-hoc editing — while remaining faithful to sourced facts.

“Automatically” in Phase 6 means:

- Field templates
- Glossary / translation memory
- Deterministic SEO assemblers
- Completeness validators

Not: opaque LLM rewrite of facts.

---

## 2. Locale policy

| Locale  | Code | Audience                               |
| ------- | ---- | -------------------------------------- |
| English | `en` | International default / x-default      |
| Chinese | `zh` | Simplified Chinese for site dictionary |
| Thai    | `th` | Local market                           |

Rules:

1. Factual numbers (price, sqm, floor, distance) are **locale-invariant**; only labels change.
2. Proper nouns (project brand, developer legal name) keep official Romanization in `en`; Chinese/Thai names only when sourced or in glossary.
3. Prefer official Thai name from developer site / Department of Business Development / portal when available.
4. Never invent distances or prices in any language.

---

## 3. Content objects

| Object    | Package root                           | Multilingual blocks                                                                         |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Developer | `content/developers/<slug>/`           | name, legal_name, description, seo.title, seo.description                                   |
| Project   | `content/projects/<slug>/`             | name, description, address, facilities labels, transportation names, nearby names, FAQ, seo |
| District  | `content/areas/<city>/<district>.json` | name, summary, seo.title, seo.description                                                   |
| Listing   | `listings.json` / batch files          | title, summary, description                                                                 |

Completeness flags (design):

```json
"locale_status": {
  "en": "complete",
  "zh": "complete",
  "th": "partial",
  "notes": "th description pending glossary"
}
```

Publish gate: `en` + `zh` + `th` must be `complete` for SEO title/description on districts, developers, projects. Listings may publish with `partial` body if title+summary complete in all three.

---

## 4. Pipeline stages

```text
1. Ingest facts (source-backed)
2. Normalize (DATA_STANDARD)
3. Assemble skeletons (required keys)
4. Apply glossary (names, districts, transit)
5. Fill templates (SEO, FAQ boilerplate where allowed)
6. Validate completeness
7. Write package files
8. Hand to Import Pipeline V2
```

### Stage detail

**1. Ingest**  
Capture official and portal facts into a `raw/` sidecar (optional) with URL + harvested_at + content hash.

**2. Normalize**  
Slugs, THB integers, sqm decimals, city/district slugs, transit tags.

**3. Assemble skeletons**  
Ensure every required key exists (empty string vs omit — standard prefers explicit empty + `locale_status`).

**4. Glossary**  
Lookup table (design file `content/glossary/terms.json`):

- District name mappings
- Developer brand mappings
- Transit line names (BTS/MRT Orange/Yellow/…)
- Common facility labels

**5. Templates**

Examples (deterministic):

- SEO project title EN: `{Project Name} Condo | {District} {City} | GoThailandHome`
- SEO project title ZH: `{项目名} 公寓｜{区域}{城市}｜GoThailandHome`
- SEO project title TH: `คอนโด{ชื่อโครงการ} | {เขต} {จังหวัด} | GoThailandHome`
- Listing summary EN: `Public {sale|rent} listing: {beds}BR · {sqm} sqm · {price} THB{ /mo}` sourced from `{source}`.

FAQ: only use **boilerplate** FAQs when marked `"kind": "boilerplate"` (e.g. “Are prices guaranteed?”). Fact FAQs must cite sources.

**6. Validate**  
See validators list below.

**7–8. Write + import**  
Content Factory never writes directly to Supabase; Import Pipeline V2 is the only mutation path for production.

---

## 5. Field ownership

| Field class             | Owner                               | Translation approach                                                                   |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Legal / brand names     | Source + glossary                   | Fixed mapping                                                                          |
| Addresses               | Source                              | Keep postal format; translate district labels via glossary                             |
| Specs / numbers         | Source                              | No translation                                                                         |
| Facilities list         | Source names + glossary labels      | Map known English/Thai facility terms                                                  |
| Nearby POIs             | Official distances tables preferred | Translate POI type labels; keep place names per glossary                               |
| Listing marketing prose | Portal text                         | Store EN as harvested; ZH/TH via structured summary templates first (not free rewrite) |
| SEO title/description   | Templates                           | Always generated from facts                                                            |

Phase 6 listing body copy policy: **prefer structured summaries** over full portal prose translation to avoid uncontrolled rewriting.

---

## 6. Validators (Content Factory)

| Check                                          | Level                    |
| ---------------------------------------------- | ------------------------ |
| All required keys present                      | error                    |
| SEO title length 20–70 (soft)                  | warn                     |
| SEO description length 70–160 (soft)           | warn                     |
| Any price in text without matching `price_thb` | error                    |
| Locale missing for required entity             | error if `publish_ready` |
| Glossary miss for district slug                | warn                     |
| Boilerplate FAQ without `kind`                 | error                    |

---

## 7. Operator workflow

1. Collector creates/updates raw facts for developer/project/listings/district.
2. Run Content Factory job (design CLI later): `content:prepare --entity project --slug …`
3. Review diff of generated ZH/TH structured fields.
4. Set `publish_ready=true` when gates pass.
5. Run Import Pipeline V2 dry-run → apply.

---

## 8. Bangkok Area Factory content rules

For each Bangkok district package:

1. `name` EN/ZH/TH from standard district glossary (align with official district names).
2. `summary` 1–2 sentences: location orientation only — no fake inventory claims.
3. `seo.title` / `seo.description` via templates including “Bangkok” / “曼谷” / “กรุงเทพฯ”.
4. Dynamic sections on public pages (projects/listings counts) come from DB at render time — not hard-coded into district JSON.

---

## 9. Non-goals

- No AI rewriting of listings
- No automated social posting
- No marketplace sales copy engines
- No redesign of page templates — Content Factory feeds existing fields only

---

## 10. Handoff

Outputs become inputs to `IMPORT_PIPELINE_V2.md`.  
Field shapes must match `DATA_STANDARD.md`.
