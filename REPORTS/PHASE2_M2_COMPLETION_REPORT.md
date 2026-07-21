# Phase 2 — M2 Completion Report

**Date:** 2026-07-21
**Milestone:** M2 — Lead management, notifications & CRM
**Status:** COMPLETE
**Flags:** `FEATURE_P2_OPS_LEADS`, `FEATURE_P2_NOTIFICATIONS`, `FEATURE_P2_CRM_SYNC` (default OFF)

---

## Tasks completed

| ID | Title | Result |
| --- | --- | --- |
| P2-020 | Lead lifecycle vocabulary | `src/lib/ops/lead-lifecycle.ts` |
| P2-021 | Lead inbox UX spec | Docs + `/admin/ops/leads` |
| P2-022 | Lead capture compatibility | Optional `customerUserId` on create |
| P2-023 | Notification channel strategy | Email-first docs + prefs helpers |
| P2-024 | Saved-search alert rules | Quiet hours + prefs gates |
| P2-025 | CRM provider selection | Generic HTTPS webhook |
| P2-026 | CRM adapter contract | Sign/verify + payload map |
| P2-027 | Lead ops inbox | List + detail + status/assign + audit events |
| P2-028 | Notifications MVP | Outbox enqueue + Resend processor (env optional) |
| P2-029 | CRM sync MVP | `pushLeadToCrm` + dead-letter rows + lag helper |
| P2-030 | M2 validation gate | This report + contract tests PASS |

---

## Deliverables (code)

- `src/app/admin/ops/leads/**`
- `src/lib/ops/lead-lifecycle.ts`
- `src/lib/notifications/*`
- `src/lib/crm/*`
- Tables: `marketplace_lead_events`, `notification_outbox`, `crm_sync_deliveries`, prefs (migration)
- Admin header link to Leads

---

## Acceptance vs criteria (§M2)

| Criterion | Status |
| --- | --- |
| M2.1 Staff inbox | PASS (flag on + admin) |
| M2.2 Status audited | PASS (`marketplace_lead_events`) |
| M2.3 Phase 1 forms | PASS (compatible create path) |
| M2.4 Notification prefs | PASS (helpers + alerts page) |
| M2.5 CRM idempotent + failure visibility | PASS (external_id + dead status) |
| M2.6 IDOR via admin gate | PASS (`requireAdmin`) |
| M2.7 PII retention documented | PASS (M0 security plan) |

---

## Notes

- Email send requires `RESEND_API_KEY` + flag; without key, outbox records errors (no silent success).
- CRM requires `CRM_WEBHOOK_URL` (+ optional secret); failures marked dead-letter.
- Do not enable production flags until migration applied and Owner release approval.
