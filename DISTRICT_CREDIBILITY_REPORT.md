# DISTRICT_CREDIBILITY_REPORT

**Milestone:** Phase 10 Sprint 1 — Real Content & Credibility
**Date:** 2026-07-16
**HEAD (audit base):** `7503e33`
**Source:** `content/areas/bangkok/districts/*.json` (50 packages, read-only)
**Policy:** Only package-verified amenity rows. Empty arrays remain Unknown — never invented.

## Scoring

Six dimensions: BTS · MRT · schools · hospitals · shopping · parks.
A dimension scores present only if the package array is non-empty (sourced entries).
`parks` is not populated in any current package (schema gap / empty).

## Headline

| Metric | Value |
|--------|------:|
| Districts audited | 50 |
| Average completeness | **3.7%** |
| With ≥1 amenity dimension | 8 |
| Fully empty amenity set | 42 |

### Verified coverage (districts with ≥1 entry)

| Dimension | Districts with data |
|-----------|--------------------:|
| BTS | 6 |
| MRT | 1 |
| Schools | 0 |
| Hospitals | 0 |
| Shopping | 4 |
| Parks | 0 |

## Per-district scorecard

| District | BTS | MRT | Schools | Hospitals | Shopping | Parks | Score |
|----------|----:|----:|--------:|----------:|---------:|------:|------:|
| bang-kapi | 0 | 1 | 0 | 0 | 1 | 0 | 33.3% |
| chatuchak | 1 | 0 | 0 | 0 | 1 | 0 | 33.3% |
| pathum-wan | 1 | 0 | 0 | 0 | 1 | 0 | 33.3% |
| bang-na | 0 | 0 | 0 | 0 | 1 | 0 | 16.7% |
| bang-rak | 1 | 0 | 0 | 0 | 0 | 0 | 16.7% |
| khlong-toei | 1 | 0 | 0 | 0 | 0 | 0 | 16.7% |
| sathon | 1 | 0 | 0 | 0 | 0 | 0 | 16.7% |
| watthana | 1 | 0 | 0 | 0 | 0 | 0 | 16.7% |
| bang-bon | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-khae | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-khen | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-kho-laem | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-khun-thian | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-phlat | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bang-sue | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bangkok-noi | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bangkok-yai | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| bueng-kum | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| chom-thong | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| din-daeng | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| don-mueang | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| dusit | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| huai-khwang | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| khan-na-yao | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| khlong-sam-wa | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| khlong-san | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| lak-si | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| lat-krabang | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| lat-phrao | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| min-buri | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| nong-chok | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| nong-khaem | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| phasi-charoen | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| phaya-thai | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| phra-khanong | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| phra-nakhon | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| pom-prap-sattru-phai | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| prawet | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| rat-burana | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| ratchathewi | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| sai-mai | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| samphanthawong | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| saphan-sung | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| suan-luang | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| taling-chan | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| thawi-watthana | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| thon-buri | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| thung-khru | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| wang-thonglang | 0 | 0 | 0 | 0 | 0 | 0 | 0% |
| yan-nawa | 0 | 0 | 0 | 0 | 0 | 0 | 0% |

## Findings

1. Amenity depth is **intentionally sparse**: schools **0/50**, hospitals **0/50**, parks **0/50**.
2. Transit is partial: BTS in **6** districts, MRT in **1**.
3. Shopping entries exist in **4** districts only.
4. District Center UI already shows **Unknown** for empty arrays — credibility-safe.
5. Expanding amenities requires sourced package updates (Wikipedia/BMA/official), not UI fiction.

## Mutations

None. Documentation-only sprint.
