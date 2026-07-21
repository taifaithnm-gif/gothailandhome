# P2-006 — IA Prefix Decision

**Date:** 2026-07-21
**Decision:** Expand **`/admin`** with **`/admin/ops/*`** for staff operations (leads). Do **not** introduce a separate `/ops` root in Phase 2A.

---

## Rationale

1. Reuses existing admin auth (`requireAdmin` + `admin_users`).
2. Keeps a single staff noindex shell (`/admin` already disallowed in robots).
3. Avoids dual login surfaces and middleware complexity.

## Robots policy (paper → code with routes)

| Path | Index |
| --- | --- |
| `/admin`, `/admin/ops`, `/admin/ops/leads` | disallow / noindex |
| `/{lang}/account`, `/{lang}/account/*` | disallow / noindex |
| `/auth` | disallow |

## Validation

- Decision signed: **YES**
- Robots draft updated: **YES** (implemented with Phase 2A routes)
