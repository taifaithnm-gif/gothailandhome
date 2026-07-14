# LISTING_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Source:** PropertyHub public listing detail `__NEXT_DATA__` (price-gated)
**Packaged verified listings:** 617 · **Supabase verified:** 620

## Integrity

| Check | Result |
|-------|--------|
| Total packaged listings | 617 |
| `verification_status = verified` | 617 / 617 (100%) |
| With `listing_url` | 617 / 617 (100%) |
| Unique `external_ref` | 617 (0 duplicates) |
| Price present (`price_thb > 0`) | 617 / 617 — unpriced records are dropped at harvest |
| `bedrooms` present | 617 / 617 |
| `area_sqm` present | 617 / 617 |
| `floor_label` present | 605 / 617 |

Re-verification: listing `propertyhub-4590499` (ashton-asoke) was re-fetched live
this milestone — ฿8,500,000 / 1 bed / 34 sqm / floor 28 — matching the stored
package exactly. No fabricated prices or descriptions.

## Split by type

| Type | Count | Avg price | Min | Max |
|------|------:|----------:|----:|----:|
| Sale | 308 | ฿8,093,324 | ฿1,850,000 | ฿48,500,000 |
| Rent | 309 | ฿30,385 / mo | ฿10,000 | ฿220,000 |

Average sale price per sqm: **฿156,426**.

## Bedrooms distribution

| Bedrooms | Listings |
|----------|---------:|
| Studio (0) | 9 |
| 1 | 435 |
| 2 | 159 |
| 3 | 11 |
| 4 | 3 |

## Verified listings by district

| District | Listings | Priority? |
|----------|---------:|:---------:|
| watthana | 100 | ✅ |
| huai-khwang | 99 | ✅ |
| phra-khanong | 80 | ✅ |
| khlong-toei | 40 | ✅ |
| bang-rak | 40 | |
| bang-kapi | 40 | ✅ |
| ratchathewi | 40 | ✅ |
| suan-luang | 40 | |
| din-daeng | 20 | |
| lat-phrao | 20 | ✅ |
| yan-nawa | 20 | |
| chatuchak | 20 | ✅ |
| pathum-wan | 20 | ✅ |
| phaya-thai | 20 | |
| khlong-san | 10 | |
| bang-khen | 8 | |
| **sathon** | **0** | ✅ (gap) |

Priority-district subtotal: **459 / 617**. Sathon khet remains at 0 — flagged in
`PHASE6_M2_PROGRESS.md`.

## Stored fields per listing (DATA_STANDARD)

`external_ref`, `listing_type`, `property_type`, `price_thb`, `bedrooms`,
`bathrooms`, `area_sqm`, `floor_label`, `building_label`, `project_slug`,
`developer_slug`, `city_slug`, `district_slug`, `transit_tags`, `title`/`summary`/
`description` (EN/ZH/TH), `source`, `listing_url`, `source_updated_at`,
`collected_at`, `source_captured_at`, `verification_status`, `latitude`,
`longitude`, `duplicate_fingerprint`.

## Validation

All 33 listing packages pass listing-batch validation (schema, source allow-list,
capture-date, coordinates, transit tags, duplicate detection). 0 failures.
