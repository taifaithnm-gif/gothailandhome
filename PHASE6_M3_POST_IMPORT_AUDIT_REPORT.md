# PHASE6_M3_POST_IMPORT_AUDIT_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M3 — LivingInsider Post-Import Audit  
**Constraints:** No re-harvest · no schema changes · no auto-merge

## Status

# PASS

## Reconciliation summary

| Source | Package | DB | Matched | Price mismatches |
|--------|--------:|---:|--------:|-----------------:|
| PropertyHub | 617 | 617 | 617 | 0 |
| LivingInsider | 316 | 316 | 316 | 0 |
| Combined source records (DB) | — | **933** | — | — |

PropertyHub `updated_at` max remains `2026-07-14T15:05:56.459976+00:00` (unchanged since LI-only import).

## LivingInsider DQ

Hard duplicates: **0** · Audit issues: **0**  
Provenance coverage on all 316 DB rows: fingerprints, source rows, price history, verification events — **316/316**

## Cross-source review (19)

| Class | Count |
|-------|------:|
| probable_same_unit | 18 |
| possible_same_unit | 1 |
| different_unit | 0 |
| insufficient_evidence | 0 |
| Merged / deleted | **0** |

## Production checks

| Check | Result |
|-------|--------|
| ESLint | PASS (0 errors; 2 pre-existing warnings) |
| `next build` / TypeScript | PASS |
| `npm test` | N/A (no test script in package.json) |
| Factory validate (Ashton sample) | PASS |
| Working tree for milestone | Clean after report commit |

## Related reports

- `SOURCE_RECONCILIATION_REPORT.md`
- `LIVINGINSIDER_DATA_AUDIT_REPORT.md`
- `CROSS_SOURCE_REVIEW_REPORT.md`
- `VALIDATION_REPORT.md`

## Evidence

`pipelines/factory/livinginsider/_runs/post-import-*.json`
