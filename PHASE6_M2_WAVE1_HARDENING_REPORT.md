# PHASE6_M2_WAVE1_HARDENING_REPORT

**Date:** 2026-07-14  
**Base commit:** `e3cf459` (PropertyHub Wave 1 — do not re-harvest)  
**Scope:** Post-harvest hardening only · Bangkok · no UI redesign · no fabricated listings

## Status

# PASS

## STEP 1 — Repository / database verification

| Check | Result |
|-------|--------|
| Commit `e3cf459` exists | YES (`e3cf4598bd022f8e44b05d97cbc774539c762027`) |
| Working tree at start | Clean for Wave1 deliverables; unrelated local dirs untracked (not committed) |
| Package projects with listings | **33** |
| Package verified listings | **617** |
| DB `source=propertyhub` | **617** |
| Package ↔ DB `external_ref` match | **617 / 617** |
| Price mismatches package vs DB | **0** |
| Extra DB-only PropertyHub refs | **3** (legacy `propertyhub-5813509`, `5329310`, `5886141`) — not in Wave1 packages |
| Verified prices overwritten | **No evidence** (all 617 prices identical) |
| Import partially applied | **No** — full external_ref coverage; identity backfill completed 617/617 |

### Import gap found (pre-hardening)

Wave1 v1 importer set `is_verified_listing=true` but **did not** persist `verification_status`, `duplicate_fingerprint`, or `source_captured_at`.  
Backfill reconstructed these from package evidence (no re-harvest).

Post-backfill: `verification_status=verified`, fingerprints, `source_listing_id`, normalized URLs, per-source rows, price history, and verification events all = **617**.

## STEPS 2–7 (summary)

| Step | Outcome |
|------|---------|
| Data quality audit | 1 flagged rent pps anomaly; 0 hard duplicates; 34 soft-match candidate groups |
| Identity / dedupe | Schema + helpers + importer hardened; soft matches stored as `open` candidates only |
| Empty projects (17) | All PropertyHub pages return listing hrefs now — prior harvest empty; **not** re-imported |
| Project completeness | Core identity strong; units/floors/media gaps remain (not invented) |
| Developer completeness | 16 developers for 33 projects; packages present with official fields |
| Multi-source readiness | Tables/columns/priority/events/price history ready; second source **not** harvested |

## STEP 8 — Production validation

Lint warnings only (no errors). `tsc` / `next build` PASS. Sample factory validate PASS.

## Commits

See git log after push — each logical commit hash listed in push summary.

## Evidence paths

- `pipelines/factory/wave1-hardening/wave1-listing-audit.json`
- `pipelines/factory/wave1-hardening/wave1-duplicates.json`
- `pipelines/factory/wave1-hardening/empty-projects-investigation.json`
- `pipelines/factory/wave1-hardening/project-developer-completeness.json`
- `pipelines/factory/wave1-hardening/backfill-wave1-identity.json`

## Related reports

`WAVE1_DATA_AUDIT_REPORT.md` · `WAVE1_DUPLICATE_REPORT.md` · `WAVE1_FIELD_COMPLETENESS_REPORT.md` · `WAVE1_SOURCE_INTEGRITY_REPORT.md` · `EMPTY_PROJECTS_INVESTIGATION_REPORT.md` · `PROJECT_PACKAGE_AUDIT_REPORT.md` · `DEVELOPER_PACKAGE_AUDIT_REPORT.md` · `MULTISOURCE_READINESS_REPORT.md` · `PRODUCTION_VALIDATION_REPORT.md`
