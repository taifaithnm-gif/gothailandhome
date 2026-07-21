# Phase 2 — M1 Completion Report

**Date:** 2026-07-21
**Milestone:** M1 — Customer identity, dashboard & saved searches
**Status:** COMPLETE
**Feature flag:** `FEATURE_P2_ACCOUNT` / `NEXT_PUBLIC_FEATURE_P2_ACCOUNT` (default OFF)

---

## Tasks completed

| ID | Title | Result |
| --- | --- | --- |
| P2-010 | Auth provider + threat model | Supabase Auth; non-admin customers — docs/m1 |
| P2-011 | Customer profile contract | Docs + `customer_profiles` migration |
| P2-012 | Dashboard UX spec | Docs + `/{lang}/account/*` pages |
| P2-013 | Saved items sync design | Opt-in device merge UI |
| P2-014 | Saved search contract | `src/lib/account/saved-search.ts` + round-trip tests |
| P2-015 | Account API design | Server actions under `account/actions.ts` |
| P2-016 | Customer auth | Sign-in/up/out; admin escalation blocked; safe `next` |
| P2-017 | Dashboard + saved items | Account hub + saved list + merge |
| P2-018 | Saved searches CRUD | Create/update frequency/delete + properties href |
| P2-019 | M1 validation gate | This report + contract tests PASS |

---

## Deliverables (code)

- `src/lib/auth/customer.ts`, `safe-next.ts`
- `src/lib/account/*`
- `src/app/[lang]/account/**`
- Auth callback open-redirect hardening
- Robots disallow `/account`, `/auth`
- EN/ZH/TH `account.*` dictionary keys
- Additive migration `supabase/migrations/20260721100000_phase2a_customer_ops.sql`

---

## Acceptance vs criteria (§M1)

| Criterion | Status |
| --- | --- |
| M1.1 Sign in/out | PASS (flag on + Supabase) |
| M1.2 Dashboard saves/searches | PASS |
| M1.3 Saved search filter restore | PASS (serializer tests) |
| M1.4 Device favorites without account | PASS (unchanged Phase 1) |
| M1.5 Opt-in migration | PASS (merge control) |
| M1.6 Account noindex | PASS |
| M1.7 EN/ZH/TH + a11y labels | PASS |

---

## Notes

- Routes `notFound()` when flag is off — production remains Phase 1.
- Migration is additive; apply via Owner-authorized `db:apply` before enabling flag in any environment.
