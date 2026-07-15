# PROJECT_CLASSIFICATION_HYGIENE_REPORT

**Phase:** 7 — Classification Hygiene + Official Detail Pass  
**Date:** 2026-07-15  
**Audit version:** `2026-07-15-project-master-hygiene-v2`  
**Universe:** 50 verified packaged projects  

## Overall result

**PASS WITH ACTIONS**

Mandatory classification over-promotions were demoted. Listing files were not modified (198/198 byte-identical to `HEAD`). No schema changes. Media binaries were not downloaded.

## Evidence rules applied

| Class | Rule |
|-------|------|
| **OFFICIAL** | Direct support from a **project-specific** official developer/project page (or dedicated project site), brochure source pointer, or filing. Developer homepage alone is insufficient. |
| **VERIFIED_PORTAL** | Stated by approved portal/package data; not contradicted by Tier 1. |
| **DERIVED** | Mapped/computed from package geography/transit/relations (incl. audit metadata). |
| **UNVERIFIED** | Insufficient direct evidence. |

## Mandatory corrections completed

1. Packaged `district_slug` / district names → **DERIVED** (not OFFICIAL), except where district is literal on a project-specific official address (One Bangkok, The Forestias).
2. Packaged project names → **VERIFIED_PORTAL** / **UNVERIFIED** unless confirmed on a project-specific official page.
3. Developer homepage URLs → **UNVERIFIED** for `official_project_url`.
4. Internal `developer.slug` alone → **VERIFIED_PORTAL** or **DERIVED**, never OFFICIAL.
5. `verification_timestamp` → **DERIVED** (audit metadata).
6. Brochure / floor-plan OFFICIAL values retained only as **source pointers** with explicit “media not reviewed” notes.

## Class totals (1,100 cells)

| Class | Before | After | Δ |
|-------|-------:|------:|--:|
| OFFICIAL | 327 | 62 | -265 |
| VERIFIED_PORTAL | 210 | 293 | 83 |
| DERIVED | 46 | 159 | 113 |
| UNVERIFIED | 517 | 586 | 69 |

**Cells changed:** 275

### Top transitions

| Transition | Count |
|------------|------:|
| `OFFICIAL->DERIVED` | 113 |
| `OFFICIAL->VERIFIED_PORTAL` | 85 |
| `OFFICIAL->UNVERIFIED` | 72 |
| `UNVERIFIED->OFFICIAL` | 3 |
| `VERIFIED_PORTAL->OFFICIAL` | 2 |

## Companion artifacts

| File | Purpose |
|------|---------|
| `PROJECT_CLASSIFICATION_DIFF.md` | Human-readable before/after |
| `PROJECT_OFFICIAL_DETAIL_PASS_REPORT.md` | Project-page verification results |
| `PROJECT_COMPLETENESS_MATRIX_V2.md` | V2 matrix |
| `PROJECT_UNVERIFIED_ITEMS_V2.md` | V2 unverified register |
| `pipelines/factory/project-master/completeness_matrix_v2.json` | Machine matrix |
| `pipelines/factory/project-master/classification_diff.json` | Machine diff |

## Listing integrity

- Listing files changed: **0 / 198**
- Counts: PropertyHub **617** · LivingInsider **316** · DotProperty **192** · FazWaz **190** · total **1,315**
- Baseline SHA recorded in `listing_baseline.json` remains the integrity reference (listing bytes unchanged)

## Status

PHASE 7 CLASSIFICATION HYGIENE COMPLETE — PASS WITH ACTIONS
