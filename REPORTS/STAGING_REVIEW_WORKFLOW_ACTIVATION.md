# Staging Review Workflow Activation

**Milestone:** `STAGING_REVIEW_WORKFLOW_ACTIVATION`  
**Date:** 2026-07-26  
**OVERALL:** `PASS`  
**Import session:** `sess_p2_fbda6bfdbeb462c00f25f88f`  
**Batch:** `BATCH-GTH-20260724-001`

## Activation scope

| Capability | Status |
| --- | --- |
| Browse committed review queue | ACTIVE |
| Filter / search / paginate / detail | ACTIVE (Review Console) |
| Reviewer Gate | ENABLED |
| Review mutations ceiling | READY_FOR_APPROVAL max (no Approve/Publish) |
| Approval | **DISABLED** (not entered) |
| Publish | **DISABLED** (not entered) |
| Storage upload | **DISABLED** |
| Production import | **DISABLED** |

Console enable (local only; default OFF):

```bash
FEATURE_GOTH_REVIEW_CONSOLE=true APP_DEPLOY_ENV=development npm run dev
```

Route: `/internal/review/windows01/batches/BATCH-GTH-20260724-001`

---

## Review Queue Summary

Authoritative Staging DB counts for `sess_p2_fbda6bfdbeb462c00f25f88f`:

| Entity | Count |
| --- | --- |
| Developers | 5 |
| Projects | 10 |
| Assets | 9 |
| PDFs | 5 |
| News | 10 |
| Review Items | 63 |
| Conflicts | 1 |
| Session status | `COMMITTED` |

Filesystem Review Console freeze (`.work/review-console/BATCH-GTH-20260724-001/`) **aligns** with DB for all of the above arrays (developers/projects/images/pdfs/news/review-items/conflicts).

Note: `summary.json.totalReviewItems=38` is **non-authoritative summary metadata**; the machine-readable `review-items.json` and DB both have **63**. Activation uses the authoritative arrays.

---

## Pending Review Statistics

| Review Item State | Count |
| --- | --- |
| `REVIEW_REQUIRED` | 62 |
| `CONFLICT` | 1 |
| `APPROVED` / `READY_FOR_PRODUCTION` / `PUBLISHED` | **0** |
| **Total** | **63** |

Ready-for-approval (derived console list, not Approved): **14** rows in `ready-for-approval.json`. DB has **0** rows in forbidden approval/publish states.

---

## Conflict Statistics

| Field | Value |
| --- | --- |
| Conflicts | 1 |
| Target | Project `36936` |
| Reason | `PROVINCE_NAME_CONFLICT` |
| Severity | `high` |
| Conflict `review_state` | `CONFLICT` |
| Project 36936 `review_state` | `REVIEW_REQUIRED` |
| Console freeze match | YES |

---

## Unknown Developer Statistics

| Check | Result |
| --- | --- |
| UNKNOWN developers | **5** |
| Canonical developer links | **0** |
| Unified `dev-unknown` candidate | NOT PRESENT |
| Console freeze UNKNOWN count | 5 (match) |

---

## Project Review Distribution

| Project `review_state` | Count |
| --- | --- |
| `REVIEW_REQUIRED` | **10** / 10 |
| `APPROVED` / `PUBLISHED` | 0 |

`PROJECT_REVIEW_REQUIRED` = **10** (includes 36936).

---

## Reviewer Gate Verification

| Gate | Result |
| --- | --- |
| `STAGING_REVIEWER_GATE_ENABLED` | true (PASS) |
| `assertApproverActionBlocked(APPROVE)` | throws (PASS) |
| `assertAutomationCannotApproveOrPublish(PUBLISHED)` | throws (PASS) |
| `assertReviewMutationAllowed(APPROVED)` | throws (PASS) |
| `assertAutomationAllowed(APPROVED)` | throws (PASS) |
| `STAGING_COMMIT_ENABLED` | false (default; not required for browse) |
| `STAGING_STORAGE_UPLOAD_ENABLED` | false |
| Review API contract | auth required; productionDisabled; forbidden APPROVED/READY_FOR_PRODUCTION/PUBLISHED |
| Allowed mutation ceiling (design) | notes / conflict / duplicate / reject / quarantine / READY_FOR_APPROVAL only |
| Anonymous write API | NOT implemented (intentional) |

---

## Approval State Verification

| Check | Result |
| --- | --- |
| Approvals in DB | **0** |
| Approver actions executable via console | NO (preview/no-op only) |
| Approver actions via persistence helpers | BLOCKED |

---

## Publish Protection Verification

| Check | Result |
| --- | --- |
| Published news/entities | **0** |
| Automation cannot set PUBLISHED | PASS |
| Review mutation cannot set PUBLISHED | PASS |
| Console forbid copy present | “Approve / Publish / Delete are intentionally …” |

---

## Review Console Verification

| Capability | Result |
| --- | --- |
| Data present for Batch001 | PASS (`staging:goth:review-console`) |
| Tabs: developers / projects / images(assets) / pdfs / news / review / conflicts / ready | PASS |
| Search | PASS (e.g. project `36936` → 1; UNKNOWN developers → 5) |
| Filter by review state | PASS (`REVIEW_REQUIRED` → 62; `CONFLICT` → 1) |
| Pagination | PASS (pageSize 20; page1=20, page2=20, total 63) |
| Detail: View Evidence / View Source Metadata | PASS (implemented) |
| Marking Preview | no-op (PASS — no state mutation) |
| Feature flag default | OFF (safe); production deploy blocks enable |
| Production DB client on console path | NONE |
| Alignment console ↔ Staging DB | PASS |

---

## Production Isolation Verification

| Check | Result |
| --- | --- |
| Environment | `gothailandhome-staging` |
| Production detected | NO |
| Isolation | PASS |
| Session `production_allowed` | false |
| Session `storage_write_allowed` | false |
| Storage object IDs | 0 |
| Production changed | NO |

---

## Safety / non-goals this milestone

| Action | Status |
| --- | --- |
| Approval executed | NO |
| Publish executed | NO |
| Deploy | NO |
| Production write | NO |
| Storage upload | NO |
| git commit / push | NOT_EXECUTED |

## Evidence artifact

`.work/staging-db/BATCH-GTH-20260724-001/review-activation/activation-audit.json`
