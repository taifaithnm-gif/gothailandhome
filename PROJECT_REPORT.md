# PROJECT_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Packaged projects:** 50 · **Supabase `property_projects`:** 52

## Enrichment coverage (of 50 packaged projects)

| Field | Coverage | Source |
|-------|---------:|--------|
| `name` / `developer` / `location.district_slug` | 50/50 | Base identity (all real) |
| GPS (`latitude`/`longitude`) + `google_maps_url` | 33/50 | PropertyHub project location |
| `facilities` | 33/50 | PropertyHub `facilities` |
| `nearby_schools` / `nearby_hospitals` / `nearby_malls` | 33/50 | PropertyHub `nearbyZones` |
| `construction_status = completed` | 33/50 | Derived from sourced completion year |
| `faq` (EN/ZH/TH) | 33/50 | Built only from sourced facts (year, total units) |
| `transit_tags` | 50/50 | BTS/MRT/ARL tags |
| `seo` (title/description) | 50/50 | Derived from real name + district |

The 33 fully-enriched projects are exactly those with harvested listings — their
manifests were enriched from the same PropertyHub project capture. The 17 without
listings carry verified identity (name, developer, district, official URL) but were
**not** back-filled with invented facilities, coordinates, or nearby POIs.

## Projects per district (all 50)

| District | Projects |
|----------|---------:|
| watthana | 7 |
| huai-khwang | 7 |
| phra-khanong | 6 |
| bang-kapi | 3 |
| pathum-wan | 3 |
| sathon | 2 |
| khlong-toei | 2 |
| bang-khen | 2 |
| yan-nawa | 2 |
| bang-rak | 2 |
| ratchathewi | 2 |
| suan-luang | 2 |
| dusit · thon-buri · din-daeng · lat-phrao · bang-sue · chatuchak · phaya-thai · bang-na · khlong-san · bang-phlat | 1 each |

## Projects WITH listings (33)

| Project | District | Listings |
|---------|----------|---------:|
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
| xt-phayathai | ratchathewi | 20 |
| xt-huai-khwang | huai-khwang | 19 |
| knightsbridge-prime-sathorn | yan-nawa | 10 |
| supalai-lite-sathorn-charoenrat | yan-nawa | 10 |
| the-room-sathorn-taksin | khlong-san | 10 |
| kave-town-space | bang-khen | 8 |

## Projects WITHOUT listings (17 — identity only)

`168-sukhothai-residences`, `ascott-embassy-sathorn`, `aspire-sathorn-taksin`,
`chapter-one-shine-bang-pho`, `condo-u-sukhumvit-62-1`, `ideo-rama-9`,
`knightbridge-collage-ramkhamhaeng`, `lumpini-ville-phahol-saphanmai`,
`m-jive-sathorn-lumphini`, `noble-beat`, `one-bangkok`,
`origin-plug-play-sukhumvit-101`, `samyan-mitrtown`, `singha-complex`,
`the-forestias`, `the-tree-rio-bang-aor`, `vyva-thonglor`

Reason: no priced listing page resolvable on an approved source without risking
mis-attribution (see `PHASE6_M2_PROGRESS.md` gap register). Left empty by policy.

## Validation

All 50 project manifests pass schema + DATA_STANDARD validation. 0 failures.
