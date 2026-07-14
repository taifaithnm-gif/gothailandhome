# BANGKOK_DATABASE_PRIORITY_REPORT

**Date:** 2026-07-14  
**Project:** GoThailandHome  
**Root:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Policy:** Bangkok = **90%** of Property Factory capacity · Other cities combined = **10%** (preserve shells + verified-only)

## Scope locked

| Rule | Status |
|------|--------|
| Bangkok is the primary market for Phase 6 waves | **LOCKED** |
| Mass-import Pattaya / Phuket / Chiang Mai / Hua Hin / Rayong | **FORBIDDEN** for now |
| Keep existing non-Bangkok city shells + any already-verified data only | **LOCKED** |
| No fabricated projects, listings, yields, or inventory counts | **LOCKED** |
| Public catalog remains verified-only | **LOCKED** |
| Source order must be respected (official → portals) | **LOCKED** |

### Capacity allocation

```text
Bangkok ██████████████████████████████████████████████████ 90%
Others  █████                                               10%
```

Other-city work in this phase is maintenance only: protect pages, do not open bulk collection pods.

---

## Corridor map (district packages)

Priority corridors mapped to Bangkok `district` packages (`content/areas/bangkok/districts/*`).

| # | Corridor | Primary district slugs | Wave-1 projects (count) |
|---|----------|------------------------|-------------------------|
| 1 | Asoke / Rama 9 | `watthana`, `huai-khwang`, `din-daeng` | 15 |
| 2 | Ratchada / Huai Khwang | `huai-khwang` | 7 |
| 3 | Sukhumvit / Thonglor / Ekkamai | `watthana`, `khlong-toei` | 9 |
| 4 | Phrom Phong | `khlong-toei`, `watthana` | 9 |
| 5 | On Nut / Bang Na | `phra-khanong`, `suan-luang`, `bang-na`, `prawet` | 9 |
| 6 | Ari / Phaya Thai | `phaya-thai`, `ratchathewi` | 3 |
| 7 | Ladprao / Chatuchak | `lat-phrao`, `chatuchak`, `bang-khen` | 4 |
| 8 | Bang Kapi / Ramkhamhaeng | `bang-kapi` | 3 |
| 9 | Sathorn / Silom | `sathon`, `bang-rak`, `yan-nawa` | 6 |
| 10 | Riverside | `khlong-san`, `thon-buri`, `bang-kho-laem`, `yan-nawa` | 4 |
| 11 | Ratchathewi / Pratunam | `ratchathewi`, `pathum-wan` | 5 |
| 12 | Ploenchit / Chidlom | `pathum-wan`, `watthana` | 10 |

Notes:

- Counts overlap across corridors (a Watthana project may sit in both Thonglor and Ploenchit maps).
- Full city still has **50/50** Bangkok district packages for SEO completeness; corridor list drives **listing harvest priority**, not district existence.

---

## District coverage

| Item | Status |
|------|--------|
| Bangkok district packages | **50/50** present under `content/areas/bangkok/districts/` |
| Glossary | `content/glossary/districts-bangkok.json` + `terms.json` (transit / facilities / schools / hospitals / shopping / property types) |
| M1 validators | PASS (`PHASE6_M1_CORE_REPORT.md`) |
| Next enrichment | sourced POI fills only on corridor districts above; no invented schools/hospitals |

---

## Developer shortlist (first 20 — locked)

Already packaged under `content/developers/*/manifest.json` (official website primary):

| # | Slug | Brand |
|---|------|-------|
| 1 | `risland-thailand` | RISLAND Thailand |
| 2 | `sansiri` | Sansiri |
| 3 | `ap-thailand` | AP Thailand |
| 4 | `land-and-houses` | Land and Houses |
| 5 | `pruksa-holding` | Pruksa Holding |
| 6 | `origin-property` | Origin Property |
| 7 | `ananda-development` | Ananda Development |
| 8 | `supalai` | Supalai |
| 9 | `sc-asset` | SC Asset |
| 10 | `quality-houses` | Quality Houses |
| 11 | `lpn-development` | LPN Development |
| 12 | `major-development` | Major Development |
| 13 | `mqdc` | MQDC |
| 14 | `assetwise` | AssetWise |
| 15 | `raimon-land` | Raimon Land |
| 16 | `noble-development` | Noble Development |
| 17 | `frasers-property-thailand` | Frasers Property Thailand |
| 18 | `sena-development` | Sena Development |
| 19 | `capitaland-thailand` | CapitaLand Thailand |
| 20 | `singha-estate` | Singha Estate |

**Gate:** each developer requires ≥1 official source URL (website and/or Facebook). No logo/text invention.

---

## Project shortlist (first 50 Bangkok — locked)

All `city_slug=bangkok` packages under `content/projects/` (50):

| District cluster | Project slugs |
|------------------|---------------|
| Watthana / Asoke–Thonglor | `ashton-asoke`, `rhythm-ekkamai`, `the-esse-asoke`, `vyva-thonglor`, `noble-beat`, `niche-pride-thonglor-phetchaburi`, `supalai-oriental-sukhumvit-39` |
| Huai Khwang / Ratchada–Rama 9 | `xt-huai-khwang`, `life-asoke-rama-9`, `ideo-rama-9`, `maestro-03-ratchada-rama-9`, `noble-revolve-ratchada`, `supalai-veranda-rama-9`, `singha-complex` |
| Khlong Toei / Phrom Phong | `ideo-q-sukhumvit-36`, `the-esse-sukhumvit-36` |
| Phra Khanong / On Nut | `condo-u-sukhumvit-62-1`, `the-line-sukhumvit-101`, `ideo-mobi-sukhumvit-66`, `origin-plug-play-sukhumvit-101`, `the-room-sukhumvit-62`, `whizdom-essence` |
| Suan Luang / Bang Na edge | `the-base-sukhumvit-77`, `the-privacy-rama-9`, `the-forestias` |
| Bang Kapi / Ramkhamhaeng | `the-livin-ramkhamhaeng`, `knightbridge-collage-ramkhamhaeng`, `modiz-rhyme-ramkhamhaeng` |
| Sathorn / Silom / Yan Nawa | `ascott-embassy-sathorn`, `m-jive-sathorn-lumphini`, `m-silom`, `the-lofts-silom`, `knightsbridge-prime-sathorn`, `supalai-lite-sathorn-charoenrat` |
| Pathum Wan / Ploenchit–Samyan | `life-one-wireless`, `one-bangkok`, `samyan-mitrtown` |
| Ratchathewi / Phaya Thai / Ari | `xt-phayathai`, `supalai-elite-phayathai`, `noble-around-ari` |
| Chatuchak / Lat Phrao / Bang Khen | `life-ladprao`, `chapter-one-midtown-ladprao-24`, `kave-town-space`, `lumpini-ville-phahol-saphanmai` |
| Riverside / other BKK | `aspire-sathorn-taksin`, `the-room-sathorn-taksin`, `the-tree-rio-bang-aor`, `chapter-one-shine-bang-pho`, `casa-condo-asoke-dindaeng`, `168-sukhothai-residences` |

**Gap vs listing target:** packages exist; **verified listing rows** are still specimen-level (Livin `listings.json` = 5). Scaling to 500 is the next warehouse wave — not started here.

---

## Listing source plan (500 verified Bangkok)

### Required fields (every listing)

| Field | Rule |
|-------|------|
| `source` | Allow-list code |
| `listing_url` | Stable http(s) URL |
| `collected_at` / capture date | Required |
| `source_updated_at` | When portal exposes; else capture date + note |
| `verification_status` | `verified` before public publish |
| `city_slug` | `bangkok` |
| `district_slug` | Must resolve to imported district |
| `transit_tags` | Glossary codes (BTS/MRT/…) when sourced |
| `project_slug` | Prefer linked project from the 50; orphan only as `unverified` staging |

### Source priority (strict)

1. Official developer websites  
2. Official project websites  
3. Official Facebook pages (profile / project page links — not prices alone)  
4. Google Maps (coords / place URL)  
5. PropertyHub  
6. DDproperty  
7. LivingInsider  
8. FazWaz  

### Harvest plan for 500

| Phase | Volume | Focus | Adapter / path |
|-------|--------|-------|----------------|
| L0 Specimen | ~5 | Livin Ramkhamhaeng (done) | `content:import` / factory validate |
| L1 Pilot | 50 | One project per top 10 corridors | PropertyHub pages linked to W1 projects |
| L2 Corridor fill | 200 | Asoke–Rama 9, Sukhumvit, Sathorn, Ratchada | PropertyHub + DDproperty |
| L3 Completeness | 250 | Remaining W1 projects to ~10 verified units each | Multi-portal with fingerprint dedupe |
| **Total** | **500** | Bangkok only | Dual-run validate → dry-run → apply |

### Quality gates before publish

- Factory `validate` + duplicate fingerprint / URL / `external_ref` checks  
- Stale scan: portal 404 or `source_updated_at` beyond TTL → `stale` / unpublish  
- Public query path: `verification_status = verified` (and existing `is_verified_listing` compatibility)  
- Price changes write `listing_price_history` with `batch_id`

---

## Implementation sequence

Aligned with roadmap; Bangkok-weighted capacity:

| Step | Work | Status |
|------|------|--------|
| 1 | Complete M1 validators + Bangkok glossary | **DONE** (`PHASE6_M1_CORE_REPORT`) |
| 2 | Build Bangkok district packages (50) | **DONE** (SEO packages); corridor POI enrichment ongoing as sourced |
| 3 | Import first 20 developers | **PACKAGED**; DB upsert via factory wave as needed |
| 4 | Import first 50 Bangkok projects | **PACKAGED**; DB upsert via factory wave as needed |
| 5 | Import first 500 verified listings | **NOT STARTED** (blocked on harvest ops; tooling ready) |
| 6 | Duplicate + stale-listing checks | **Tooling partial** (fingerprint + history tables); scheduled ops job TBD |
| 7 | Keep public pages verified-only | **POLICY LOCKED** — no UI redesign |

### Near-term operator checklist

1. Freeze non-Bangkok mass import tickets.  
2. Open PropertyHub collection for corridors 1–5 first.  
3. Batch files under `content/listings/batches/YYYYMMDD-propertyhub-bkk-*.json`.  
4. `npm run factory -- validate <batch>` → `dry-run` → apply when dual-run green.  
5. Reject any listing missing URL / source / capture date.

---

## Other cities (10% budget)

| City | Action now |
|------|------------|
| Pattaya | Preserve city shell / geography only |
| Phuket | Preserve only |
| Chiang Mai | Preserve only |
| Hua Hin | Preserve only |
| Rayong | Preserve only |

Allowed under the 10% budget:

- Bugfixes / SEO shells already in platform geography  
- Rare official-source discoveries that map cleanly (no bulk portal scrapes)

Forbidden:

- Wave generators targeting non-Bangkok  
- Fabricated projects/listings to “balance” KPI

---

## Risks and compliance notes

| Risk | Mitigation |
|------|------------|
| Portal ToS / blocking | Prefer official sources first; rate-limit PropertyHub+; store `_raw/` captures privately |
| Fabrication pressure at 500 listings | Hard fail validate without URL/source/date; never invent units |
| Cross-portal duplicates | Keep both rows with distinct `external_ref`; fingerprint flags same-unit conflicts for review |
| Stale public inventory | `verification_status=stale/delisted` + history row; public verified-only filter |
| Corridor bias vs all-50 districts | District SEO packages stay complete; listing spend follows corridors |
| Premature national expand | This document is the capacity lock — other cities stay freeze |
| Facebook as price source | Facebook allowed for profile/project links only; prices from site/portal with URL |

---

## Wave-1 snapshot (as of report)

| KPI | Target | Current |
|-----|--------|---------|
| Developers | 20 | **20 packaged** |
| Bangkok projects | 50 | **50 packaged** |
| Verified listings | 500 | **~5 specimen (Livin)** |
| Bangkok districts | 100% SEO packages | **50/50 packaged** |
| Allocation | BKK 90% / Others 10% | **Policy locked herein** |

---

## Status

**SCOPE LOCKED — BANGKOK DATABASE PRIORITY**  
Next executable gap: **500 verified Bangkok listings** under the source priority and corridor order above.
