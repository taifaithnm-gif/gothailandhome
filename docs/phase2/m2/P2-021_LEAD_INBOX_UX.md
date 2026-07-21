# P2-021 — Lead Inbox UX / Ops Spec

**Shell:** `/admin/ops/leads` (P2-006)
**Auth:** `requireAdmin` only
**Permissions:** all admins can list/update; assignment is free-text `assigned_to` (Phase 2A)

## Workflow

1. Triage `new`
2. Assign
3. Contact / schedule / negotiate
4. Won / lost / spam / archive

Audit via `marketplace_lead_events`.
