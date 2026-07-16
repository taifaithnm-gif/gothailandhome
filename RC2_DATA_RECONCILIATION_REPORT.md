# RC2_DATA_RECONCILIATION_REPORT

**Date:** 2026-07-16  
**Mode:** Read-only investigation — **no mutations**  
**HEAD:** `e3a5a9a`

## Package baseline (integrity gate)

`npm run test:listing-integrity` → **PASS**

| Source | Count |
|--------|------:|
| PropertyHub | 617 |
| LivingInsider | 316 |
| DotProperty | 192 |
| FazWaz | 190 |
| **Total** | **1315** |

`baseline_sha256`: `f0eb4b0ab5381dd47bc60bff0f6fed68d98346cb85cc3993df11f9477d78872c`  
`row_identity_sha256`: `27b71874f3643be844021b72f081ce200e638cefb17805e5d75cfe42c552a984`

| Entity | Packages | Live DB |
|--------|---------:|--------:|
| Developers (master packages) | 20 | 23 total (`is_published` includes 3 seed stubs) |
| Projects | 50 published packages | 50 published · 52 total (+2 draft seeds) |
| Verified published properties | — | **1318** |

## 1315 vs 1318 — exact three additional records

Live query (2026-07-16): published properties = **1318**; packaged source total = **1315**.

The **three** published rows **not** present in `content/projects/**/listings*.json` (matched by `external_ref` / `listing_url` / `slug`):

| # | UUID | Slug | Source casing | external_ref | Price (THB) | Created (UTC) |
|---|------|------|---------------|--------------|------------:|---------------|
| 1 | `e3fa171c-6161-4f10-98b3-e3b6cfbb8d5f` | `the-livin-ramkhamhaeng-rent-propertyhub-5329310` | `PropertyHub` | `propertyhub-5329310` | 14,000 | 2026-07-14T11:24:39Z |
| 2 | `98371f79-f537-44a6-8744-5c4316cb8633` | `the-livin-ramkhamhaeng-rent-propertyhub-5813509` | `PropertyHub` | `propertyhub-5813509` | 10,000 | 2026-07-14T11:24:39Z |
| 3 | `aff1d41d-ab08-43fc-90c2-edb02539a412` | `the-livin-ramkhamhaeng-rent-propertyhub-5886141` | `PropertyHub` | `propertyhub-5886141` | 18,000 | 2026-07-14T11:24:39Z |

### Classification

- All three are **The Livin Ramkhamhaeng** rent units from PropertyHub.  
- Listing IDs **5329310 / 5813509 / 5886141** are **absent** from `content/projects/the-livin-ramkhamhaeng/` packages.  
- Source string uses capital **`PropertyHub`** (unlike lowercase `propertyhub` on the 617 packaged imports), which also explains why naive `.eq("source","propertyhub")` counts miss them while UI totals include them.  
- **RC2 action:** document only — **do not delete, merge, or rewrite** these rows in this gate.

## Related non-listing surplus (unchanged)

| Entity | Extra rows | Slugs | Status |
|--------|------------|-------|--------|
| Developers | +3 vs packages | `sathorn-living`, `andaman-homes`, `northern-estate` | Still `is_published=true` (hidden from homepage by code filter) |
| Projects | +2 vs packages | `river-horizon`, `lagoon-leaf` | `draft` |

## Mutations this gate

| Action | Done? |
|--------|-------|
| Harvest | No |
| Delete / unpublish the +3 | No |
| Schema change | No |
| Package rewrite | No |
