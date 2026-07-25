# Phase 2 T1–T10 Staging Smoke Plan

**Status:** Plan only — **not executed**. Do **not** enable these flags in Production.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`
**Sources:** [`REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`](../../REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md), [`STAGING_POLICY.md`](STAGING_POLICY.md), [`REPORTS/PHASE2_STAGING_CHECKLIST.md`](../../REPORTS/PHASE2_STAGING_CHECKLIST.md)

---

## Global rules

1. Staging Supabase isolated; Preview wired to staging ([`VERCEL_PREVIEW_STAGING_SETUP.md`](VERCEL_PREVIEW_STAGING_SETUP.md)).
2. Phase 2A/2B migrations applied and verified on staging only ([`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md)).
3. Enable **one train at a time**; smoke before the next.
4. Redeploy Preview after any `NEXT_PUBLIC_*` change.
5. Locales: **EN / ZH / TH** where the surface is localized.
6. Viewports: **desktop / tablet / mobile** for customer-facing UI.
7. Actors: **anon / auth customer / admin (staff)** as relevant.
8. States to exercise where relevant: **loading / error / empty / 404 / denied / duplicate / network failure / stale session**.
9. Record each train as PASS / FAIL / BLOCKED with evidence — never invent PASS.
10. Production: all `FEATURE_P2_*` remain **OFF**.

### Cross-cutting Phase 1 regression (before T1 and after T10)

With all Phase 2 flags OFF (and again after the full train with flags as left on staging): home, property list/detail, inquiry submit, admin login for Phase 1 catalog — still healthy on staging.

---

## T1 — ACCOUNT

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_ACCOUNT=true`, `NEXT_PUBLIC_FEATURE_P2_ACCOUNT=true` |
| Flags OFF (rollback) | Both false/unset; redeploy Preview |
| Migration deps | Phase2A (`customer_profiles`, `customer_saved_*`) |
| Seed needs | Synthetic auth users (customer); optional saved fixtures |
| Pages | `/[lang]/account/sign-in`, account home, saved items, saved searches |
| APIs / writes | Profile upsert, save favorite/compare, saved search CRUD |
| Permissions | Anon → sign-in; auth customer owns rows; admin not required |
| Smoke matrix | EN/ZH/TH; desktop/mobile; loading + empty saved; denied when logged out; stale session → re-auth; duplicate save handled gracefully |
| Rollback | Flags OFF; leave tables |
| Next-train gate | Sign-in + save + saved-search journeys pass on staging URL (not SSO login page) |

---

## T2 — OPS_LEADS

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_OPS_LEADS=true` |
| Flags OFF | false/unset |
| Migration deps | Phase2A (`marketplace_lead_events` + existing `marketplace_leads`) |
| Seed needs | Synthetic marketplace leads; staff/admin user |
| Pages | `/admin/ops/leads` (and related lead detail if present) |
| APIs / writes | Lead status/event writes by staff |
| Permissions | Anon/customer **denied**; admin allowed |
| Smoke matrix | Empty inbox; error path; denied for non-admin; desktop; network fail shows recoverable error |
| Rollback | Flag OFF; leave tables |
| Next-train gate | Staff lead inbox reachable and functional on staging |

---

## T3 — NOTIFICATIONS

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_NOTIFICATIONS=true` |
| Flags OFF | false/unset |
| Migration deps | Phase2A (`customer_notification_prefs`, `notification_outbox`) |
| Seed needs | Auth customer; optional pending outbox row |
| Pages | Notification prefs (account-adjacent); any outbox admin view if exposed |
| APIs / writes | Prefs update; outbox insert (system) — verify row shape, do not require live email provider |
| Permissions | Customer owns prefs; anon denied |
| Smoke matrix | Loading/empty prefs; invalid quiet-hours error; stale session |
| Rollback | Flag OFF; leave outbox rows |
| Next-train gate | Prefs persist; outbox contract verified (or explicitly BLOCKED if provider missing — do not fake PASS) |

---

## T4 — CRM_SYNC

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_CRM_SYNC=true` plus staging-only `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` (sandbox/mock) |
| Flags OFF | Flag false; remove webhook secrets from Preview if unused |
| Migration deps | Phase2A (`crm_sync_deliveries`) |
| Seed needs | Lead/event that triggers delivery; mock webhook receiver |
| Pages | Ops delivery log / admin CRM status if present |
| APIs / writes | Delivery attempt rows; no Production CRM endpoint |
| Permissions | Staff-only visibility of delivery logs |
| Smoke matrix | Success delivery; duplicate retry behavior; network failure → failed/dead status as designed |
| Rollback | Flag OFF; leave delivery rows |
| Next-train gate | Adapter smoke against **sandbox/mock** only |

---

## T5 — ACQUISITION

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_ACQUISITION=true`, `NEXT_PUBLIC_FEATURE_P2_ACQUISITION=true` |
| Flags OFF | Both false; redeploy |
| Migration deps | Phase2B (`acquisition_cases`, `acquisition_evidence_items`, `acquisition_events`) |
| Seed needs | Optional; form can create cases |
| Pages | Public list-your-property (or equivalent); `/admin/ops/acquisition` |
| APIs / writes | Case create (anon/auth); staff status transitions |
| Permissions | Public submit allowed per product rules; staff manage; random user cannot escalate others’ cases |
| Smoke matrix | EN/ZH/TH; mobile; empty admin list; 404 unknown case; duplicate submit messaging; rate-limit/network errors |
| Rollback | Flags OFF; leave cases |
| Next-train gate | Submit → case visible in admin ops on staging |

---

## T6 — PARTNER_PORTAL

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_PARTNER_PORTAL=true`, `NEXT_PUBLIC_FEATURE_P2_PARTNER_PORTAL=true` |
| Flags OFF | Both false; redeploy |
| Migration deps | Phase2B (`partner_orgs`, `partner_memberships`, …) |
| Seed needs | Synthetic org + invite/membership for test partner user |
| Pages | `/partners/app` (and invite/accept flows if present) |
| APIs / writes | Partner-scoped reads/writes only |
| Permissions | Anon denied; non-member denied; member role-scoped; admin override only if designed |
| Smoke matrix | Denied states; empty org data; stale invite; desktop/tablet |
| Rollback | Flags OFF; leave partner tables |
| Next-train gate | Partner journey passes with seeded membership |

---

## T7 — MAP

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_MAP=true`, `NEXT_PUBLIC_FEATURE_P2_MAP=true` |
| Flags OFF | Both false; redeploy |
| Migration deps | Phase 1 geography sufficient; Phase 2 flags only gate UI |
| Seed needs | Geography seed / properties with coordinates as applicable |
| Pages | `/[lang]/map`, district deep links |
| APIs / writes | Read-heavy; no Production writes required |
| Permissions | Public map OK; admin not required |
| Smoke matrix | EN/ZH/TH; desktop/tablet/mobile; loading; empty region; 404 bad district; performance within budget |
| Rollback | Flags OFF |
| Next-train gate | Map renders and deep link works on staging |

---

## T8 — TOOLS

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_TOOLS=true`, `NEXT_PUBLIC_FEATURE_P2_TOOLS=true` |
| Flags OFF | Both false; redeploy |
| Migration deps | None beyond Phase 1 content as designed |
| Seed needs | None critical |
| Pages | `/[lang]/tools`, mortgage, legal tool routes |
| APIs / writes | Client calculators / content; verify no accidental privileged writes |
| Permissions | Public |
| Smoke matrix | EN/ZH/TH; mobile; loading; validation errors on bad inputs |
| Rollback | Flags OFF |
| Next-train gate | Finance/legal tools journeys pass |

---

## T9 — AI

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_AI=true`, `NEXT_PUBLIC_FEATURE_P2_AI=true`; keep `FEATURE_P2_AI_KILL_SWITCH=false` for happy path |
| Kill switch verify | Set `FEATURE_P2_AI_KILL_SWITCH=true` → safe mode / AI off; then restore false for continued train if needed |
| Flags OFF (rollback) | AI flags false **or** kill switch true |
| Migration deps | None specific beyond existing catalog data |
| Seed needs | Published properties for similar/recommend rails |
| Pages | Property similar rail; investment assist surfaces |
| APIs / writes | Recommend/assist endpoints; fail closed when kill switch on |
| Permissions | Public/auth per design; no publish-from-AI to Production |
| Smoke matrix | Loading/error/empty recommendations; network failure; kill switch; EN/ZH/TH disclaimers visible |
| Rollback | Flags OFF or kill switch ON; leave tables |
| Next-train gate | Journeys pass **and** kill switch forces safe mode |

---

## T10 — ANALYTICS_EXPANSION

| Item | Detail |
| --- | --- |
| Flags ON | `FEATURE_P2_ANALYTICS_EXPANSION=true` |
| Flags OFF | false/unset |
| Migration deps | None |
| Seed needs | Consent plumbing; staging analytics sink / debug |
| Pages | Any page that emits expanded events (account/map/tools/AI as enabled) |
| APIs / writes | Client/server event emit to staging sink only |
| Permissions | Honor consent — no fire before consent |
| Smoke matrix | Consent-on fires; consent-off silent; duplicate pageview not double-counted incorrectly |
| Rollback | Flag OFF |
| Next-train gate | Expanded events verified in **staging** analytics sink |

---

## Train exit (staging only)

- [ ] All T1–T10 recorded with evidence (or explicit BLOCKED reasons).
- [ ] No Production env vars or flags changed.
- [ ] Rollback path exercised at least once on staging (flags OFF) during the train or in a drill.
- [ ] Owner sign-off required before any future Production discussion ([`PRODUCTION_RELEASE_POLICY.md`](PRODUCTION_RELEASE_POLICY.md)).

**Current train status (as of docs):** NOT ENABLED / BLOCKED pending staging isolation — see feature-flag enablement report.
