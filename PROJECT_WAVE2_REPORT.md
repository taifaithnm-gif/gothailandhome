# PROJECT_WAVE2_REPORT

**Milestone:** Phase 11 — Project Factory · Wave 2  
**Date:** 2026-07-16  
**HEAD baseline:** `0abc31b` (Wave 1 review)  
**Policy:** Official project pages only · evidence + provenance + `verified_at` · unknown stays UNVERIFIED · no UI / features / deploy / schema

## Objective

Raise project completeness from Wave 1 factory mean **54.5%** toward **80%**.

## Scope (priority order)

| # | Developer | Projects |
|--:|-----------|----------|
| 1 | AssetWise | modiz-rhyme-ramkhamhaeng, kave-town-space |
| 2 | Origin | knightsbridge-prime-sathorn, knightbridge-collage-ramkhamhaeng, origin-plug-play-sukhumvit-101 |
| 3 | SC Asset (catalog) | the-esse-asoke, the-esse-sukhumvit-36, vyva-thonglor |
| 4 | Frasers | one-bangkok, samyan-mitrtown |
| 5 | Land & Houses | the-room-sathorn-taksin, the-room-sukhumvit-62 |
| 6 | Major | m-jive-sathorn-lumphini, m-silom, maestro-03-ratchada-rama-9 |

**n = 15** in-catalog projects

## Result

| Cohort | Mean 10-field OFFICIAL |
|--------|----------------------:|
| Wave 1 factory (22) — still | **54.5%** |
| Wave 2 cohort (15) | **32.0%** |
| Union Wave 1 ∪ Wave 2 (35) | **45.4%** |

**80% target not reached.** Lift is concentrated on projects with live official DETAIL pages; eight Wave 2 packages remain **0%** with no usable official DETAIL.

## Per-developer

| Developer | Avg % | Notes |
|-----------|------:|-------|
| AssetWise | 45.0 | Modiz **90%**; KAVE Town Space still no page |
| Origin | 60.0 | Prime + Collage **90%** each; Plug & Play Sukhumvit 101 **0%** |
| SC Asset (catalog) | 56.7 | THE ESSE facts from **Singha Estate** official residential pages (**80–90%**); Vyva **0%** |
| Frasers | 20.0 | One Bangkok district facts **40%**; Samyan site unresolved |
| Land & Houses | 0.0 | LH URLs soft-land / SSR shell — no extractable DETAIL |
| Major | 0.0 | No live official project DETAIL pages |

## Per-project

| Project | % | Official URL |
|---------|--:|--------------|
| modiz-rhyme-ramkhamhaeng | 90 | assetwise.co.th …/modiz-rhyme/ |
| knightsbridge-prime-sathorn | 90 | en.origin.co.th …/knightsbridge-prime-sathorn/ |
| knightbridge-collage-ramkhamhaeng | 90 | origin.co.th …/knightsbridge-collage-ramkhamhaeng/ |
| the-esse-sukhumvit-36 | 90 | residential.singhaestate.co.th …/sukhumvit36 |
| the-esse-asoke | 80 | residential.singhaestate.co.th …/asoke |
| one-bangkok | 40 | onebangkok.com/en/ |
| kave-town-space | 0 | — |
| origin-plug-play-sukhumvit-101 | 0 | — |
| vyva-thonglor | 0 | — |
| samyan-mitrtown | 0 | — |
| the-room-sathorn-taksin | 0 | soft-land |
| the-room-sukhumvit-62 | 0 | soft-land |
| m-jive-sathorn-lumphini | 0 | — |
| m-silom | 0 | — |
| maestro-03-ratchada-rama-9 | 0 | — |

## Honest gaps

1. **Completion year** — **0%** OFFICIAL in Wave 2 cohort (not clearly published).  
2. **THE ESSE** catalog developer is `sc-asset` but official publisher pages are **Singha Estate** — provenance records Singha URLs; developer_slug not rewritten this wave.  
3. **Agency / portal sites** (e.g. theesseasoke.com resale) were **not** used.  
4. **Media binaries** remain hotlink / pending license.  
5. **Major / LH / several sold-out or retired pages** — no invent from portals.

## Artifacts

- `scripts/phase11-wave2-project-factory.mjs`
- `pipelines/factory/content-factory/wave2_extracted.json`
- `pipelines/factory/content-factory/wave2_snapshot.json`
- `pipelines/factory/content-factory/wave2_progress.json`
- `pipelines/factory/content-factory/wave2-raw/` (HTML captures)
