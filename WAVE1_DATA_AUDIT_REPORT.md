# WAVE1_DATA_AUDIT_REPORT

**Generated:** 2026-07-14  
**Source packages:** 33 projects · **617** verified listings  
**Evidence:** `pipelines/factory/wave1-hardening/wave1-listing-audit.json`

## Totals

| Metric | Count |
|--------|------:|
| Projects with listings | 33 |
| Verified listings | 617 |
| Hard duplicate source IDs | 0 |
| Hard duplicate URLs | 0 |
| Hard duplicate normalized URLs | 0 |
| Hard duplicate identity fingerprints | 0 |
| Soft-match candidate groups | 34 |
| Package↔DB matched refs | 617 |
| Price mismatches | 0 |
| DQ issue flags | 1 |

## Checks performed

| Check | Result |
|-------|--------|
| Duplicate `source_listing_id` | None |
| Duplicate `listing_url` | None |
| Duplicate `normalized_source_url` | None |
| Duplicate identity fingerprint | None |
| Missing project relation | None |
| Missing source URL | None |
| Missing / non-positive price | None |
| Invalid / zero area | None |
| Invalid bedrooms / bathrooms | None |
| Unreasonable price/sqm | **1** rent flag (below) |
| Malformed dates | None |
| Stale verification (>45d) | None |
| Inconsistent project slug vs dir | None |
| Inconsistent district vs manifest | None |

## Suspicious record (not deleted)

| Field | Value |
|-------|-------|
| Code | `unreasonable_rent_per_sqm` |
| external_ref | `propertyhub-5652628` |
| project | `supalai-oriental-sukhumvit-39` |
| pps | 25,000 THB / sqm / month |
| URL | https://propertyhub.in.th/en/listings/pfd-07677-condo-for-rent-supalai-oriental-sukhumvit-39-schedule-a-viewing-line-propertyfinder---5652628 |
| Action | Flagged only — price retained as sourced; needs human review |

## Soft-match candidates

34 groups share project + beds + area + floor soft fingerprints across distinct PropertyHub IDs.  
These are **candidates only** (common unit typologies). Not merged. See `WAVE1_DUPLICATE_REPORT.md`.

## DB reconciliation

- All 617 Wave1 package `external_ref` values present in Supabase.
- 3 additional DB PropertyHub refs not in current packages (legacy).
- No price drift between package and DB.
