# EMPTY_PROJECTS_INVESTIGATION_REPORT

**Count:** 17 projects without Wave1 harvested listings  
**Method:** Light PropertyHub HTTP probes (primary / sale / for-rent) — **no harvest, no package writes**  
**Evidence:** `pipelines/factory/wave1-hardening/empty-projects-investigation.json`

## Classification (2026-07-14 probe)

All 17 classified as:

**`parser_or_pagination_failure_listings_present_but_prior_harvest_empty`**

Meaning: PropertyHub project pages respond **HTTP 200**, expose `__NEXT_DATA__` and listing hrefs **now**, yet Wave1 harvest stored zero priced listings. Causes to investigate in a future wave (not executed here):

- Sale/rent tab vs landing page scrape differences
- Detail pages without parseable price (Wave1 required priced detail)
- Transient empty inventory during original harvest window
- Slug alias / override edge cases
- Pagination only partially walked

**None** classified as confirmed `true_no_active_listing_state` on this probe date.

## Projects

| Slug | Max listing hrefs observed | Sale | Rent |
|------|---------------------------:|-----:|-----:|
| 168-sukhothai-residences | 60 | 20 | 20 |
| ascott-embassy-sathorn | 20 | 20 | 20 |
| aspire-sathorn-taksin | 20 | 20 | 20 |
| chapter-one-shine-bang-pho | 20 | 20 | 20 |
| condo-u-sukhumvit-62-1 | 20 | 20 | 20 |
| ideo-rama-9 | 20 | 20 | 20 |
| knightbridge-collage-ramkhamhaeng | 20 | 20 | 20 |
| lumpini-ville-phahol-saphanmai | 20 | 20 | 20 |
| m-jive-sathorn-lumphini | 20 | 20 | 20 |
| noble-beat | 20 | 20 | 20 |
| one-bangkok | 60 | 20 | 20 |
| origin-plug-play-sukhumvit-101 | 20 | 20 | 20 |
| samyan-mitrtown | 20 | 20 | 20 |
| singha-complex | 20 | 20 | 20 |
| the-forestias | 20 | 20 | 20 |
| the-tree-rio-bang-aor | 20 | 20 | 20 |
| vyva-thonglor | 20 | 20 | 20 |

## Policy

No replacement listings fabricated. No Wave1 re-harvest. Future fill requires priced-detail verification + validators.
