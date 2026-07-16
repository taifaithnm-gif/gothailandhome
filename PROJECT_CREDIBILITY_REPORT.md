# PROJECT_CREDIBILITY_REPORT

**Milestone:** Phase 10 Sprint 1 — Real Content & Credibility
**Date:** 2026-07-16
**HEAD (audit base):** `7503e33`
**Source:** `pipelines/factory/project-master/completeness_matrix.json` (read-only)
**Policy:** No invented official pages, galleries, brochures, floor plans, or facilities.

## Scoring

Six credibility fields (equal weight):

| Field | Matrix key | Full credit |
|-------|------------|-------------|
| Official project page | `C_official_project_url` | OFFICIAL only |
| Official address | `C_full_address` | OFFICIAL=1 · VERIFIED_PORTAL=0.5 |
| Official gallery | `C_official_gallery_source` | OFFICIAL only |
| Official brochure | `C_official_brochure` | OFFICIAL only |
| Official floor plan | `C_official_floor_plans` | OFFICIAL only |
| Official facilities | `C_official_facilities` | OFFICIAL only |

Completeness % = mean of field scores × 100.

## Headline

| Metric | Value |
|--------|------:|
| Projects audited | 50 |
| Average completeness | **33.6%** |
| Projects with all 6 OFFICIAL | 1 |

### OFFICIAL coverage (count / 50)

| Field | OFFICIAL count |
|-------|---------------:|
| official project page | 50 |
| official address | 3 |
| official gallery | 3 |
| official brochure | 1 |
| official floor plan | 1 |
| official facilities | 4 |

## Per-project scorecard

| Project | Page | Address | Gallery | Brochure | Floor plan | Facilities | Score |
|---------|------|---------|---------|----------|------------|------------|------:|
| the-livin-ramkhamhaeng | OFF | OFF | OFF | OFF | OFF | OFF | 100% |
| ashton-asoke | OFF | VP | OFF | — | — | OFF | 58.3% |
| ideo-q-sukhumvit-36 | OFF | VP | OFF | — | — | VP | 50% |
| one-bangkok | OFF | OFF | — | — | — | OFF | 50% |
| the-forestias | OFF | OFF | — | — | — | OFF | 50% |
| casa-condo-asoke-dindaeng | OFF | VP | — | — | — | VP | 33.3% |
| chapter-one-midtown-ladprao-24 | OFF | VP | — | — | — | VP | 33.3% |
| ideo-mobi-sukhumvit-66 | OFF | VP | — | — | — | VP | 33.3% |
| kave-town-space | OFF | VP | — | — | — | VP | 33.3% |
| knightsbridge-prime-sathorn | OFF | VP | — | — | — | VP | 33.3% |
| life-asoke-rama-9 | OFF | VP | — | — | — | VP | 33.3% |
| life-ladprao | OFF | VP | — | — | — | VP | 33.3% |
| life-one-wireless | OFF | VP | — | — | — | VP | 33.3% |
| m-silom | OFF | VP | — | — | — | VP | 33.3% |
| maestro-03-ratchada-rama-9 | OFF | VP | — | — | — | VP | 33.3% |
| modiz-rhyme-ramkhamhaeng | OFF | VP | — | — | — | VP | 33.3% |
| niche-pride-thonglor-phetchaburi | OFF | VP | — | — | — | VP | 33.3% |
| noble-around-ari | OFF | VP | — | — | — | VP | 33.3% |
| noble-revolve-ratchada | OFF | VP | — | — | — | VP | 33.3% |
| rhythm-ekkamai | OFF | VP | — | — | — | VP | 33.3% |
| supalai-elite-phayathai | OFF | VP | — | — | — | VP | 33.3% |
| supalai-lite-sathorn-charoenrat | OFF | VP | — | — | — | VP | 33.3% |
| supalai-oriental-sukhumvit-39 | OFF | VP | — | — | — | VP | 33.3% |
| supalai-veranda-rama-9 | OFF | VP | — | — | — | VP | 33.3% |
| the-base-sukhumvit-77 | OFF | VP | — | — | — | VP | 33.3% |
| the-esse-asoke | OFF | VP | — | — | — | VP | 33.3% |
| the-esse-sukhumvit-36 | OFF | VP | — | — | — | VP | 33.3% |
| the-line-sukhumvit-101 | OFF | VP | — | — | — | VP | 33.3% |
| the-lofts-silom | OFF | VP | — | — | — | VP | 33.3% |
| the-privacy-rama-9 | OFF | VP | — | — | — | VP | 33.3% |
| the-room-sathorn-taksin | OFF | VP | — | — | — | VP | 33.3% |
| the-room-sukhumvit-62 | OFF | VP | — | — | — | VP | 33.3% |
| whizdom-essence | OFF | VP | — | — | — | VP | 33.3% |
| xt-huai-khwang | OFF | VP | — | — | — | VP | 33.3% |
| xt-phayathai | OFF | VP | — | — | — | VP | 33.3% |
| 168-sukhothai-residences | OFF | VP | — | — | — | — | 25% |
| ascott-embassy-sathorn | OFF | VP | — | — | — | — | 25% |
| aspire-sathorn-taksin | OFF | VP | — | — | — | — | 25% |
| chapter-one-shine-bang-pho | OFF | VP | — | — | — | — | 25% |
| condo-u-sukhumvit-62-1 | OFF | VP | — | — | — | — | 25% |
| ideo-rama-9 | OFF | VP | — | — | — | — | 25% |
| knightbridge-collage-ramkhamhaeng | OFF | VP | — | — | — | — | 25% |
| lumpini-ville-phahol-saphanmai | OFF | VP | — | — | — | — | 25% |
| m-jive-sathorn-lumphini | OFF | VP | — | — | — | — | 25% |
| noble-beat | OFF | VP | — | — | — | — | 25% |
| origin-plug-play-sukhumvit-101 | OFF | VP | — | — | — | — | 25% |
| samyan-mitrtown | OFF | VP | — | — | — | — | 25% |
| singha-complex | OFF | VP | — | — | — | — | 25% |
| the-tree-rio-bang-aor | OFF | VP | — | — | — | — | 25% |
| vyva-thonglor | OFF | VP | — | — | — | — | 25% |

Legend: **OFF** = OFFICIAL · **VP** = VERIFIED_PORTAL · **DER** = DERIVED · **—** = UNVERIFIED / not official.

## Findings

1. **All 50** projects have an **OFFICIAL** project page URL classification.
2. Official media depth is thin: gallery **3/50**, brochure **1/50**, floor plans **1/50**, facilities **4/50**.
3. Only **the-livin-ramkhamhaeng** scores **100%** on this official-six set.
4. Most projects sit at **~25–33%** (page + partial/portal address only).
5. RC2 UI correctly labels unavailable official media — this audit does **not** recommend fabricating fill.

## Mutations

None. Documentation-only sprint.
