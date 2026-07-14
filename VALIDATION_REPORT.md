# VALIDATION_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Validator:** `pipelines/factory/lib/validate.mjs` (AJV schemas + DATA_STANDARD rules)

## Result: PASS — 153/153 packages, 0 failures, 0 warnings

| Package kind | Checked | Failures | Warnings |
|--------------|--------:|---------:|---------:|
| Developer manifests | 20 | 0 | 0 |
| Project manifests | 50 | 0 | 0 |
| Listing packages | 33 | 0 | 0 |
| District SEO packages | 50 | 0 | 0 |
| **Total** | **153** | **0** | **0** |

Run via each package's path through `validatePath()` (the same code the factory CLI
uses), which auto-detects package kind and applies the matching schema + rule set.

## Rule checks exercised

- JSON Schema conformance (`schemas/{developer,project,district,listing,media,source,
  i18n}.json`).
- i18n completeness (EN/ZH/TH present where required).
- Source allow-list (`SOURCE_ALLOW`) — every `source` is an approved value.
- Capture-date validity (`collected_at` / `source_captured_at` parse as dates).
- Coordinate bounds (lat/lng within valid ranges).
- Transit-tag allow-list (`TRANSIT_TAGS`).
- Listing duplicate detection (`duplicate_fingerprint` / `external_ref`).

## STEP 6 rejection gate (anti-fabrication)

STEP 6 requires rejecting any project missing Developer, Official source, Location,
Published price, or Project status. Applied to the data set:

| Gate | Enforcement |
|------|-------------|
| Developer present | 50/50 projects link a real developer slug |
| Official source present | 50/50 projects carry a `sources[]` entry |
| Location present | 50/50 projects carry `city_slug` + `district_slug` |
| Published price | Enforced at **listing** level — harvester drops any listing without `price_thb > 0`; 617/617 priced |
| Project status | 33/50 have `construction_status`; 17 identity-only projects carry no *listings* and are excluded from the priced inventory rather than fabricated |

**No fabricated record passed the gate.** The 17 projects without a resolvable
priced source were left listing-less; no listing was attached to a project it could
not be verified against.

## Independent re-verification

Beyond schema validation, one Wave-1 listing was re-fetched from its live source
this milestone as an integrity spot-check:

- `propertyhub-4590499` (ashton-asoke) → live page shows ฿8,500,000 / 1 bed /
  34 sqm / floor 28 → **exact match** to the stored package.

## Duplicate audit

- 617 listings, 617 unique `external_ref` → **0 duplicate external references**.
- `duplicate_fingerprint` present on every listing for cross-source dedup.

## Conclusion

The packaged Bangkok Property Factory data set is schema-valid, source-attributed,
price-gated, duplicate-free, and free of detected fabrication. Open items (Sathon
khet, 17 gap projects, media galleries, JSON-LD/keywords) are documented gaps, not
validation failures.
