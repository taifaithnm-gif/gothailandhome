# Import Pipeline V2

**Phase:** 6 — Property Factory  
**Status:** Design only  
**Extends:** `pipelines/condo-import` (v1)  
**Does not replace:** v1 single-project import remains valid for specimens

---

## 1. Why V2

v1 successfully imports one project package (`manifest.json` + `listings.json`).  
Factory scale needs:

- batch developers / districts / listings
- resume + reporting
- listing history
- verification states
- multi-source portals (PropertyHub, DDproperty, LivingInsider, FazWaz, official)

V2 is an **orchestration + contract upgrade**, still upserting into the same Supabase catalog.

---

## 2. Compatibility

| v1                                          | v2                                |
| ------------------------------------------- | --------------------------------- |
| `content/projects/<slug>/`                  | still supported                   |
| `npm run content:import -- <path>`          | becomes one mode of V2 CLI        |
| Upsert by slug / external_ref / listing_url | retained                          |
| Provenance fields                           | retained + verification + history |
| Dry-run flag                                | retained                          |

Marketplace tables from Architecture V2 are **not** written by this pipeline.

---

## 3. Package layout (V2)

```text
content/
  glossary/
    terms.json
    districts-bangkok.json
  developers/
    <developer-slug>/
      manifest.json
      logo.bin?                 # or remote URL only
  projects/
    <project-slug>/
      manifest.json             # v1-compatible + city/district/transit
      listings.json             # optional if listings live in batches
      media.json                # image URL list + rights notes
  areas/
    bangkok/
      districts/
        <district-slug>.json
  listings/
    batches/
      <YYYYMMDD>-<source>-<n>.json
  _raw/                         # optional captures (gitignored in prod)
    <hash>/meta.json
```

### Entity manifests (logical)

- **Developer manifest** — profile, logo, website, facebook, google_maps, seo, `project_slugs[]` optional
- **Project manifest** — v1 fields + `city_slug`, `district_slug`, media refs
- **District package** — names, summaries, seo, `city_slug`
- **Listing batch** — array of listing records with provenance

---

## 4. Pipeline stages

```text
validate → resolve → dry-run plan → apply → history → report
```

### 4.1 Validate

- JSON schema checks (`DATA_STANDARD`)
- Required provenance on listings
- Source allow-list:
  - `propertyhub`
  - `ddproperty`
  - `livinginsider`
  - `fazwaz`
  - `official_developer`
  - (optional) other portals only if added to allow-list file

### 4.2 Resolve

Map string slugs → UUIDs:

- `city_slug` → `cities.id`
- `district_slug` → `districts.id`
- `developer_slug` → `developers.id` (create if upsert mode)

Fail closed if Bangkok wave district missing.

### 4.3 Dry-run plan

Emit:

- inserts / updates / unchanged counts
- conflicting price vs last history row
- missing media warnings

### 4.4 Apply (ordered)

1. Developers
2. Districts / area enrichment
3. Projects
4. Media (Storage mirror optional)
5. Listings
6. Listing history rows (on price or status change)

### 4.5 History

On listing upsert, if `price_thb` or `listing_type` or verification/status changed vs DB:

```text
insert listing_price_history (
  property_id, price_thb, listing_type,
  source, listing_url, observed_at, batch_id
)
```

### 4.6 Report

Write `import_batches` summary:

- batch_id, started_at, finished_at, operator
- counters, error list, package paths

---

## 5. CLI surface (design)

```bash
# Validate one package
property-factory validate content/projects/<slug>

# Dry-run
property-factory import content/listings/batches/<file>.json --dry-run

# Apply batch
property-factory import content/listings/batches/<file>.json --apply

# Full wave
property-factory import-wave bangkok-w1 --apply

# Resume failed batch
property-factory resume <batch_id>
```

v1 alias retained:

```bash
npm run content:import -- content/projects/<slug>
# → property-factory import <path> --mode=v1-project
```

---

## 6. Listing identity & dedupe

Primary keys for upsert:

1. `external_ref` (preferred) — stable portal id / code
2. else `listing_url`
3. else reject (no anonymous listings)

Cross-portal duplicates (same unit, different portals):

- Phase 6 **keeps both** with distinct `external_ref` / URLs
- Optional later: `listing_matches` table (not required to hit 10k)

---

## 7. Verification workflow

| Status       | Meaning                                         |
| ------------ | ----------------------------------------------- |
| `unverified` | Harvested; not shown publicly (or draft)        |
| `verified`   | Human or rule-checked; eligible for `published` |
| `stale`      | Source unchanged past TTL or portal missing     |
| `delisted`   | Source 404 / removed; unpublish                 |

Rules engine (design):

- Auto-verify only when: source ∈ allow-list AND URL reachable AND price parsed AND project linked
- Else remain `unverified` until operator marks verified
- Public site continues to prefer `is_verified_listing = true` / published + verified

---

## 8. Source adapters (design modules)

```text
pipelines/factory/
  adapters/
    propertyhub.md|js
    ddproperty.md|js
    livinginsider.md|js
    fazwaz.md|js
    official.md|js
  import-v2.mjs
  validate.mjs
  report.mjs
```

Each adapter outputs **normalized listing DTOs** (DATA_STANDARD), never portal-specific columns into Supabase.

---

## 9. Rate, ethics, and ops constraints

- Respect robots / ToS; prefer official export partnerships when available.
- Capture timestamps for every harvest.
- Store raw HTML/JSON only in `_raw/` with retention policy (not required in git).
- No credential stuffing or private account scraping in factory design.
- Failures quarantine items; batch continues when `--continue-on-error`.

---

## 10. Idempotency & safety

- Transactions per entity or savepoints per item
- No deletes by default (`--prune-missing` explicitly required later)
- Never overwrite a verified price with empty/null
- Never clear `listing_url`

---

## 11. Observability

| Signal          | Storage                                                |
| --------------- | ------------------------------------------------------ |
| Batch run       | `import_batches`                                       |
| Per item        | `import_batch_items` (entity_type, key, action, error) |
| Listing changes | `listing_price_history`                                |
| Operator notes  | package `notes.md` optional                            |

---

## 12. Migration from v1

1. Keep Livin specimen on v1 path.
2. Implement V2 validators against DATA_STANDARD.
3. Dual-run dry-run for one Bangkok project.
4. Switch batch listings to V2.
5. Developer/district wave uses V2 only.

---

## 13. Non-goals

- No payment hooks
- No CRM sync
- No AI enrichers
- No public user publishing (marketplace)
- No UI redesign
