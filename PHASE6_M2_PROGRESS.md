# PHASE6_M2_PROGRESS

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Root:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`
**Scope guardrails:** Bangkok only · real data only · no UI redesign · no architecture change · no mock/placeholder data · incremental import

## Status: IN PROGRESS — Wave 1 KPIs met, gap-closure bounded by source availability

All figures below are computed directly from the committed package files and the
live Supabase database (read-only counts), not asserted. Verification method for
each is noted.

## Headline numbers

| Entity | Packaged (content/) | Supabase (live) | Verification |
|--------|--------------------:|----------------:|--------------|
| Developers | 20 | 23 | `content/developers/*/manifest.json`; DB `developers` count=exact |
| Bangkok projects | 50 | 52 | `content/projects/*/manifest.json`; DB `property_projects` |
| Verified listings | 617 | 620 | `properties.verification_status=verified` |
| Total properties (DB) | — | 633 | DB `properties` |
| District SEO packages | 50 (`publish_ready`) | 56 districts | `content/areas/bangkok/districts/*.json` |

The DB carries a small surplus over the packaged set (developers +3, projects +2,
verified listings +3) because earlier phases (Phase 3–5) seeded a few entities
directly. No conflict: Wave-1 apply used incremental upsert and did not overwrite
prior verified rows.

## STEP-by-STEP status

| STEP | Deliverable | Status | Notes |
|------|-------------|--------|-------|
| 1 | Developer Packages | ✅ 20/20 | Full field coverage except `established_year` (5/20 — only where sourced; not fabricated) |
| 2 | Project Packages | ✅ 50/50 | 33 fully enriched (GPS + facilities + nearby + FAQ); 17 name/location/developer only |
| 3 | Verified Listings | ✅ 617 | Sale 308 / Rent 309, all with `listing_url`, 0 duplicate external refs |
| 4 | Media Package | ⚠️ Partial | 20 developer logos (SVG) in `public/developers/`; project galleries pending licence-clean sources |
| 5 | SEO Package | ⚠️ Partial | Title/description/slug/FAQ + OpenGraph shipping; **JSON-LD and keywords are gaps** (see `SEO_REPORT.md`) |
| 6 | Validation | ✅ 153/153 | 0 failures, 0 warnings against DATA_STANDARD schemas |
| 7 | Supabase incremental import | ✅ | Batch `bangkok-w1-2026-07-14T14-00-01-004Z` — 120/120 ok, 0 error |
| 8 | Reports | ✅ | This report + 8 companion reports (see below) |

## Priority-district coverage (verified listings)

Priority districts named in the M2 brief and their verified-listing counts:

| Priority district | slug | Verified listings |
|-------------------|------|------------------:|
| Watthana | `watthana` | 100 |
| Huai Khwang | `huai-khwang` | 99 |
| Phra Khanong | `phra-khanong` | 80 |
| Khlong Toei | `khlong-toei` | 40 |
| Bang Kapi | `bang-kapi` | 40 |
| Ratchathewi | `ratchathewi` | 40 |
| Chatuchak | `chatuchak` | 20 |
| Lat Phrao | `lat-phrao` | 20 |
| Pathum Wan | `pathum-wan` | 20 |
| **Sathon** | `sathon` | **0** |

Priority-district total: **459 / 617** verified listings.

**Open gap — Sathon khet (`sathon`) has 0 verified listings.** The two Sathon
project packages (`ascott-embassy-sathorn`, `m-jive-sathorn-lumphini`) returned no
priced listings on PropertyHub this milestone. Sathon-adjacent inventory currently
sits under `yan-nawa` (40) and `khlong-san` (10). Closing the literal Sathon khet
requires a priced source (developer official / DDproperty / Hipflat) — deferred
rather than filled with inferred data.

## Gap register — 17 projects without listings

The following project packages exist (name + developer + district, verified real)
but carry **no** listings, because no priced listing page could be resolved on an
approved source this milestone without risking mis-attribution:

`168-sukhothai-residences`, `ascott-embassy-sathorn`, `aspire-sathorn-taksin`,
`chapter-one-shine-bang-pho`, `condo-u-sukhumvit-62-1`, `ideo-rama-9`,
`knightbridge-collage-ramkhamhaeng`, `lumpini-ville-phahol-saphanmai`,
`m-jive-sathorn-lumphini`, `noble-beat`, `one-bangkok`,
`origin-plug-play-sukhumvit-101`, `samyan-mitrtown`, `singha-complex`,
`the-forestias`, `the-tree-rio-bang-aor`, `vyva-thonglor`

Investigated this milestone: PropertyHub redirects each of these base slugs to a
generic page (no `resultListings`), and its keyword search endpoint returns a fixed
default result set that does not reverse-map project name → slug. Several of these
are mixed-use / serviced / off-plan developments (One Bangkok, The Forestias,
Samyan Mitrtown, Ascott Embassy, Singha Complex) that legitimately have no resale
condo listings on PropertyHub. **No slug was force-matched** — doing so would attach
listings to the wrong project, which the M2 anti-fabrication rule forbids.

## Verification gates this milestone

| Gate | Result | How verified |
|------|--------|--------------|
| Existing Wave-1 data is real (not fabricated) | PASS | Live-fetched PropertyHub detail for `ashton-asoke` listing 4590499 → price/beds/area/floor match package exactly |
| Full package validation | PASS | 153/153 packages, 0 fail / 0 warn via `pipelines/factory/lib/validate.mjs` |
| No duplicate listings | PASS | 617 unique `external_ref`, 0 collisions |
| Live DB reconciles with packages | PASS | Read-only count=exact on `developers`/`property_projects`/`properties` |
| No fabricated slug matches for gaps | PASS | 17 gaps left empty rather than inferred |

## Companion reports (STEP 8)

- `PROPERTY_FACTORY_REPORT.md`
- `DEVELOPER_REPORT.md`
- `PROJECT_REPORT.md`
- `LISTING_REPORT.md`
- `MEDIA_REPORT.md`
- `SEO_REPORT.md`
- `SUPABASE_IMPORT_REPORT.md`
- `VALIDATION_REPORT.md`
