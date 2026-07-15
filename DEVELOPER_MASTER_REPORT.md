# DEVELOPER_MASTER_REPORT

**Phase:** 7 — Developer Master  
**Date:** 2026-07-15  
**Product:** GoThailandHome  
**Universe:** 20 verified developer packages in `content/developers/*/manifest.json`  
**Rule:** Official developer websites only for OFFICIAL field values. Never invent.  

Companion matrix: `DEVELOPER_COMPLETENESS_MATRIX.md`  
JSON: `pipelines/factory/developer-master/completeness_matrix.json`

---

## Overall result

**PASS WITH ACTIONS (partial Developer Master completion)**

All 20 verified developers keep official name + official website. Logos remain **placeholders** (no rights-cleared official logo URL harvested). Established year / street-level headquarters / website-sourced company profile were upgraded only where literal official-site (or official Sansiri domain) evidence was confirmed this phase. Completed/active project lists are populated from linked factory project packages; only MQDC entries confirmed on `mqdc.com/about` milestones are marked OFFICIAL.

---

## Fields in scope

| Field | Definition used |
|-------|-----------------|
| Official name | `name.en` (+ i18n package) |
| Logo source | `logo_source` object (`path`, `status`, `official_logo_url`) |
| Official website | `website` |
| Company profile | `company_profile` / `description` |
| Established year | `established_year` — OFFICIAL only if official website (or official developer annual/sustainability asset) states it |
| Headquarters | `headquarters` — prefer street-level official address |
| Completed projects | `completed_projects[]` |
| Active projects | `active_projects[]` |

---

## Rules applied

1. Use **official developer websites** (and official developer IR/sustainability assets on the developer’s own domains) for OFFICIAL facts.  
2. SET factsheet alone is **not** enough for Phase 7 OFFICIAL established-year (tagged `SET_OR_CATALOG` when still only catalog/SET).  
3. Do **not** invent years, HQ streets, logos, or portfolio rows.  
4. Do **not** download/replace trademark logos without rights clearance.  
5. Factory-linked completed/active lists are labeled `factory_project_package_status` unless confirmed on an official About/portfolio page.

---

## Official-website enrichments this phase

### `mqdc` — https://mqdc.com/about (+ address page on mqdc.com)

| Field | Value | Evidence |
|-------|--------|----------|
| Established year | **1994** | Milestone **1994** on About page |
| Headquarters | 695, Moo 12, Bang Kaeo, Bang Phli, Samut Prakan 10540 | Address block on MQDC official page |
| Company profile | Replaced with About-page summary | https://mqdc.com/about |
| Completed projects (OFFICIAL) | `whizdom-essence` | Milestone 2016 Whizdom Essence Sukhumvit |
| Active projects (OFFICIAL) | `the-forestias` | Milestone 2021 The Forestias; delivery still ongoing |

### `supalai` — https://www.supalai.com/en/about/history

| Field | Value | Evidence |
|-------|--------|----------|
| Established year | **1989** | “June 26th, 1989 … founded the Supalai Corporation Limited” |
| Company profile | Replaced from History page | same URL |
| Headquarters | unchanged (city-level) | Street HQ not pulled from About History text this pass |

### `sansiri` — official Sansiri domains

| Field | Value | Evidence |
|-------|--------|----------|
| Established year | **1984** | Annual Report 2024: “Establishment Since 1984” on `assets.sansiri.com` |
| Headquarters | 59 Soi Rim Khlong Phra Khanong, Phra Khanong Nuea, Watthana, Bangkok 10110 | Sustainability Report 2019 on `sustainability.sansiri.com` |
| Company profile | Replaced citing official sustainability prose | same |

### All 20 developers

| Action | Detail |
|--------|--------|
| `logo_source` | Status `placeholder`; `official_logo_url: null` |
| `completed_projects` / `active_projects` / `unclassified_projects` | Derived from `project_slugs` × linked project `construction_status` |
| `developer_master` stamp | Phase 7 provenance object |

---

## Aggregate completeness (after Phase 7)

| Field | OFFICIAL | Other non-missing | MISSING / PLACEHOLDER |
|-------|--------:|------------------:|----------------------:|
| Official name | 20 | 0 | 0 |
| Logo source | 0 | 0 | 20 PLACEHOLDER |
| Official website | 20 | 0 | 0 |
| Company profile | 3 | 17 PRESENT | 0 |
| Established year | 3 | 4 SET_OR_CATALOG | 13 |
| Headquarters | 2 | 1 PRESENT + 17 CITY_ONLY | 0 |
| Completed projects | 1 | 15 FACTORY | 4 |
| Active projects | 1 | 0 | 19 |

**Fully OFFICIAL on all 8 fields:** 0 / 20

---

## Explicit gaps (not invented)

| Gap | Why left blank / placeholder |
|-----|------------------------------|
| Official logo URL for all 20 | Current files are placeholder SVGs (`logo.meta.json` status=placeholder) |
| Established year for 13 developers | Not found as a literal year on official website text this pass |
| Street HQ for most developers | Package only has “Bangkok, Thailand” (or SET note) |
| Active projects OFFICIAL for 19 | No official About portfolio confirmation this pass |
| Ananda / AP / LH / Origin years | Remain in package from prior SET/catalog — tagged not official-website-confirmed |

---

## Files touched

| Path | Change |
|------|--------|
| `content/developers/*/manifest.json` (20) | logo_source, completed/active/unclassified, provenance, developer_master; targeted official field updates for mqdc / supalai / sansiri |
| `DEVELOPER_MASTER_REPORT.md` | This report |
| `DEVELOPER_COMPLETENESS_MATRIX.md` | Matrix |
| `pipelines/factory/developer-master/completeness_matrix.json` | Machine-readable matrix |

No listing harvest. No schema migration. No logo binary replacement.

---

## Next actions

1. For each developer, open official **About / History / Contact** page and capture year + street HQ only when literal.  
2. Rights-cleared official logo export → set `logo_source.official_logo_url` and replace placeholder SVG.  
3. Map Ready-to-move vs New project lists from official project directories into `completed_projects` / `active_projects` with official evidence URLs.  
4. Re-run matrix after each batch.

---

## Compliance checklist

| Check | Result |
|-------|--------|
| Verified developers only (20) | YES |
| Official websites only for new OFFICIAL facts | YES |
| No invented years / HQ / logos / portfolio | YES |
| SET-alone years not labeled OFFICIAL | YES |

---

**Status:** PHASE 7 DEVELOPER MASTER — PARTIAL COMPLETE
