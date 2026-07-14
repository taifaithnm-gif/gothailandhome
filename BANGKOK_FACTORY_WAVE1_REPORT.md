# BANGKOK_FACTORY_WAVE1_REPORT

**Date:** 2026-07-14  
**Phase:** 6 — M2 Bangkok Property Factory (Wave 1 data execution)  
**Root:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Scope:** Bangkok only · no fabricated data · verified listings only · no UI redesign

## Final status

# PASS

Wave-1 targets met or exceeded.

| KPI | Target | Result |
|-----|--------|--------|
| Developers packaged / imported | 20 | **20 packaged · DB 23** |
| Bangkok projects packaged / imported | 50 | **50 packaged · DB 52** |
| Verified listings | 500 | **617 packaged · DB verified 620** |
| Bangkok districts SEO packages | 50 | **50/50 `publish_ready`** |

---

## Developers imported

All wave-1 developer packages under `content/developers/`:

`ananda-development`, `ap-thailand`, `assetwise`, `capitaland-thailand`, `frasers-property-thailand`, `land-and-houses`, `lpn-development`, `major-development`, `mqdc`, `noble-development`, `origin-property`, `pruksa-holding`, `quality-houses`, `raimon-land`, `risland-thailand`, `sansiri`, `sc-asset`, `sena-development`, `singha-estate`, `supalai`

**Import:** `npm run factory -- apply --wave bangkok-w1` → batch `bangkok-w1-2026-07-14T14-00-01-004Z` (`ok: 120`, `error: 0`).

---

## Projects imported

50 Bangkok project packages under `content/projects/`.  
Wave apply upserted project + developer entities.

### Projects with harvested verified listings (33 / 617 units)

| Project | District | Listings |
|---------|----------|----------|
| ashton-asoke | watthana | 20 |
| casa-condo-asoke-dindaeng | din-daeng | 20 |
| chapter-one-midtown-ladprao-24 | lat-phrao | 20 |
| ideo-mobi-sukhumvit-66 | phra-khanong | 20 |
| ideo-q-sukhumvit-36 | khlong-toei | 20 |
| life-asoke-rama-9 | huai-khwang | 20 |
| life-ladprao | chatuchak | 20 |
| life-one-wireless | pathum-wan | 20 |
| m-silom | bang-rak | 20 |
| maestro-03-ratchada-rama-9 | huai-khwang | 20 |
| modiz-rhyme-ramkhamhaeng | bang-kapi | 20 |
| niche-pride-thonglor-phetchaburi | watthana | 20 |
| noble-around-ari | phaya-thai | 20 |
| noble-revolve-ratchada | huai-khwang | 20 |
| rhythm-ekkamai | watthana | 20 |
| supalai-elite-phayathai | ratchathewi | 20 |
| supalai-oriental-sukhumvit-39 | watthana | 20 |
| supalai-veranda-rama-9 | huai-khwang | 20 |
| the-base-sukhumvit-77 | suan-luang | 20 |
| the-esse-asoke | watthana | 20 |
| the-esse-sukhumvit-36 | khlong-toei | 20 |
| the-line-sukhumvit-101 | phra-khanong | 20 |
| the-livin-ramkhamhaeng | bang-kapi | 20 |
| the-lofts-silom | bang-rak | 20 |
| the-privacy-rama-9 | suan-luang | 20 |
| the-room-sukhumvit-62 | phra-khanong | 20 |
| whizdom-essence | phra-khanong | 20 |
| xt-huai-khwang | huai-khwang | 19 |
| xt-phayathai | ratchathewi | 20 |
| knightsbridge-prime-sathorn | yan-nawa | 10 |
| supalai-lite-sathorn-charoenrat | yan-nawa | 10 |
| the-room-sathorn-taksin | khlong-san | 10 |
| kave-town-space | bang-khen | 8 |

**Listing import:** `node pipelines/factory/import-all-listings.mjs` — all packages with listings upserted (`ok`).

---

## Listings imported

| Metric | Value |
|--------|-------|
| Packaged verified listings | **617** |
| DB verified (`is_verified_listing` / `verification_status=verified`) | **620** |
| With `listing_url` | **620** |
| Source | PropertyHub public detail `__NEXT_DATA__` (normalized) |
| Provenance fields | `source`, `listing_url`, `collected_at` / `source_captured_at`, `source_updated_at`, `verification_status=verified`, `price_thb`, `listing_type`, `project_slug`, `developer_slug`, `city_slug=bangkok`, `district_slug`, `transit_tags` |

Validators: **33/33** listing packages `ok: true` after URI canonicalize (`pipelines/factory/fix-listing-uris.mjs`).

No fabricated prices or placeholder descriptions. Listings without a priced detail page were not imported.

---

## Coverage map (priority districts)

| Priority | District slug(s) | Verified listings in DB |
|----------|------------------|-------------------------|
| Asoke / Thonglor / Ekkamai | `watthana` | 100 |
| Rama 9 / Ratchada / Huai Khwang | `huai-khwang`, `din-daeng` | 99 + 20 |
| On Nut / Bang Na edge | `phra-khanong`, `suan-luang`, `bang-na` | 80 + 40 + 0 |
| Bang Kapi / Ramkhamhaeng | `bang-kapi` | 43 |
| Phrom Phong | `khlong-toei` | 40 |
| Silom / Sathorn / Yan Nawa | `bang-rak`, `yan-nawa`, `sathon` | 40 + 20 + 0* |
| Ari / Phaya Thai / Ratchathewi | `phaya-thai`, `ratchathewi` | 20 + 40 |
| Ladprao / Chatuchak | `lat-phrao`, `chatuchak` | 20 + 20 |
| Ploenchit / Wireless | `pathum-wan` | 20 |

\*Sathorn priority projects such as `ascott-embassy-sathorn` / `m-jive-sathorn-lumphini` returned empty PropertyHub listing pages this wave (project packages remain).

District packages: **50/50** Bangkok khet under `content/areas/bangkok/districts/` with `publish_ready` SEO EN/ZH/TH.

---

## Tooling added this wave

| Path | Role |
|------|------|
| `pipelines/factory/harvest-propertyhub-wave1.mjs` | PropertyHub → packages (listings + project enrichment) |
| `pipelines/factory/import-all-listings.mjs` | Batch `content:import` for all projects with listings |
| `pipelines/factory/fix-listing-uris.mjs` | Canonicalize non-ASCII listing URLs for AJV uri format |
| `pipelines/factory/audit-project-gaps.mjs` | Field completeness audit |
| `npm run factory:harvest:ph` | Harvest entry |

---

## Remaining workload

| Item | Status |
|------|--------|
| Wave-1 KPI 20 / 50 / 500 | **Met** (617/500 listings) |
| 17 projects without listings | Empty PropertyHub listing pages / slug mismatch — retry with alternate slugs or official portals |
| Full project field matrix (facebook / schools / hospitals / FAQ) on thin packages | Fill only from sourced captures; **do not invent** |
| Duplicate / stale batch jobs | Tables ready (`duplicate_fingerprint`, `listing_price_history`); scheduled ops TBD |
| Non-Bangkok cities | Frozen (10% budget) — shells only |
| Public filter verified-only | Policy locked; UI unchanged |

Projects still without harvested listings:

`168-sukhothai-residences`, `ascott-embassy-sathorn`, `aspire-sathorn-taksin`, `chapter-one-shine-bang-pho`, `condo-u-sukhumvit-62-1`, `ideo-rama-9`, `knightbridge-collage-ramkhamhaeng`, `lumpini-ville-phahol-saphanmai`, `m-jive-sathorn-lumphini`, `noble-beat`, `one-bangkok`, `origin-plug-play-sukhumvit-101`, `samyan-mitrtown`, `singha-complex`, `the-forestias`, `the-tree-rio-bang-aor`, `vyva-thonglor`

---

## Verification gates

| Check | Result |
|-------|--------|
| Factory validate (sample Livin / Ashton / Bang Kapi) | PASS |
| Listing packages validate (33/33) | PASS |
| Factory apply `--wave bangkok-w1` | PASS (120 ok / 0 error) |
| Listing import upserts | PASS |
| No fabricated inventory | PASS |
| Other cities unchanged / not mass-imported | PASS |

---

## Status

**PASS — BANGKOK FACTORY WAVE 1**
