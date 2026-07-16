# DEVELOPER_CREDIBILITY_REPORT

**Milestone:** Phase 10 Sprint 1 — Real Content & Credibility
**Date:** 2026-07-16
**HEAD (audit base):** `7503e33`
**Source:** `pipelines/factory/developer-master/completeness_matrix.json` (read-only)
**Policy:** Do not invent logos, HQ streets, years, or profiles.

## Scoring

Five fields (equal weight): logo source · company profile · headquarters · official website · established year.

| Status | Score |
|--------|------:|
| OFFICIAL | 1.0 |
| company_profile PRESENT | 0.5 |
| headquarters PRESENT | 0.75 |
| headquarters CITY_ONLY | 0.25 |
| established_year SET_OR_CATALOG | 0.5 |
| logo PLACEHOLDER / MISSING | 0 |

## Headline

| Metric | Value |
|--------|------:|
| Developers audited | 20 |
| Average completeness | **43.5%** |
| OFFICIAL logos | **0** |
| OFFICIAL websites | 20 |

## Per-developer scorecard

| Developer | Logo | Profile | HQ | Website | Established | Score |
|-----------|------|---------|----|---------|-------------|------:|
| mqdc | PLACEHOLDER | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | 80% |
| sansiri | PLACEHOLDER | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | 80% |
| supalai | PLACEHOLDER | OFFICIAL | CITY_ONLY | OFFICIAL | OFFICIAL | 65% |
| ap-thailand | PLACEHOLDER | PRESENT | PRESENT | OFFICIAL | SET_OR_CATALOG | 55% |
| ananda-development | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | SET_OR_CATALOG | 45% |
| land-and-houses | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | SET_OR_CATALOG | 45% |
| origin-property | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | SET_OR_CATALOG | 45% |
| assetwise | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| capitaland-thailand | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| frasers-property-thailand | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| lpn-development | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| major-development | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| noble-development | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| pruksa-holding | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| quality-houses | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| raimon-land | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| risland-thailand | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| sc-asset | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| sena-development | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |
| singha-estate | PLACEHOLDER | PRESENT | CITY_ONLY | OFFICIAL | MISSING | 35% |

## Findings

1. **0/20** developers have `S_logo_source = OFFICIAL` — all logos remain PLACEHOLDER (neutral mark policy stands).
2. Official websites are strong: **20/20** OFFICIAL.
3. Company profiles are typically PRESENT (not upgraded to OFFICIAL without stronger IR evidence).
4. Headquarters often CITY_ONLY ("Bangkok, Thailand") — not street-level OFFICIAL.
5. Established year is frequently SET_OR_CATALOG or MISSING — not invented to fill gaps.
6. Highest scores: mqdc / sansiri (80%) — still without official logos.

## Mutations

None. Documentation-only sprint.
