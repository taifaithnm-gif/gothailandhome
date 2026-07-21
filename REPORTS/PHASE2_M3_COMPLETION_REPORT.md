# Phase 2 — M3 Completion Report

**Date:** 2026-07-21
**Milestone:** M3 — Property acquisition workflow
**Status:** COMPLETE
**Flag:** `FEATURE_P2_ACQUISITION` (default OFF)

---

## Completed task IDs

P2-031, P2-032, P2-033, P2-034, P2-035, P2-036, P2-037, P2-038

## Functional summary

- Acquisition state machine with illegal-transition guards
- Evidence checklist aligned to honesty rules (no invented facts)
- List-your-property creates tracked `acquisition_cases` when flag on (Phase 1 lead path preserved)
- Ops reviewer console at `/admin/ops/acquisition`
- Publish bridge links evidenced fields → draft/published property with required reviewer `location_id`
- Unpublish rollback sets linked property to draft
- Rate limit: max 5 cases / email / hour
- Additive migration `20260721120000_phase2b_acquisition_partners.sql`

## Validation results

| Gate | Result |
| --- | --- |
| typecheck | PASS |
| lint | PASS |
| test (incl. phase2-acquisition) | PASS |
| build | PASS |

## Risks

- Migration must be applied before enabling flag in any environment
- Location inventory must exist for publish bridge
- Dual-control is soft (same admin can approve + publish); harden later if required

## Outstanding items

- Worker for media evidence uploads
- Dual-admin approval workflow (optional)
- Submitter-facing case status page (beyond success query param)

## Readiness

M3 complete — ready to proceed to M4 (completed in same Phase 2B batch).
