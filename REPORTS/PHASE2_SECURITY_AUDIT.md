# Phase 2 Security Audit

**Date:** 2026-07-21
**Result:** **PASS WITH MINOR ISSUES**

---

## Backward compatibility

- Phase 1 routes/behaviors preserved when all Phase 2 flags are OFF.
- Additive analytics event names; Phase 1 trackers unchanged.
- Sitemap includes map/tools only when respective flags ON.

## Authentication

| Surface | Control |
| --- | --- |
| `/admin`, `/admin/ops/*` | `requireAdmin` / admin session |
| `/{lang}/account/*` | Customer session; admins excluded from customer helper |
| `/partners/app/*` | Partner membership + role |
| Public tools/map | No auth required; flag-gated |

## Authorization / RBAC

- Partner roles: `developer` | `agent` with permission matrix (`src/lib/partners/rbac.ts`).
- Ops acquisition/leads: admin-only server actions.
- RLS mirrors app intent for customer own-data and admin ops tables.

## Validation & rate limiting

- Acquisition email rate limit: max 5 cases / hour / email (`assertAcquisitionRateLimit`).
- Mortgage/legal/AI inputs validated server-side in pure libs.
- Inquiry handoff: public identifiers only (Phase 1 contract retained).

## Secrets & environment

- `.env.example` documents keys; empty placeholders only.
- No service-role keys or live secrets in source.
- CRM webhook secret optional server-only.
- Analytics expansion gated; PII blocklist retained (`ANALYTICS_PII_KEYS`).

## Robots / indexing

- `/admin`, `/account`, `/auth`, `/partners/app`, `/leads` disallowed in `robots.ts`.
- Account pages emit `noindex`.

## Known residual risks (non-blocking)

| ID | Note |
| --- | --- |
| SEC-P2-1 | Acquisition rate-limit fails open on query error |
| SEC-P2-2 | Acquisition anon insert policy is broad (expected for intake; abuse mitigated by app rate limit + flag) |
| SEC-P2-3 | Dual-admin publish control soft (same admin can approve+publish) |

## Decision

**PASS WITH MINOR ISSUES** — no P0/P1 security blockers for staging.
