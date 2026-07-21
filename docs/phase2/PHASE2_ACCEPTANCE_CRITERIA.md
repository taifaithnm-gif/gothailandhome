# Phase 2 — Acceptance Criteria

**Status:** Planning
**Date:** 2026-07-21
**Baseline:** Phase 1 `v1.0.0` remains healthy throughout

---

## 1. Global Phase 2 acceptance

Phase 2 is **accepted** when all of the following hold:

1. **Production stability:** Phase 1 core journeys (home, listings, property, lead forms, knowledge) still PASS smoke on production.
2. **Milestone MVPs:** M1–M7 MVP criteria below are PASS or Owner-waived with written waiver.
3. **M8:** Analytics expansion live under consent; RC hardening PASS; release decision recorded.
4. **Cross-cutting:** Customer-facing features have EN/ZH/TH parity; a11y contracts met; private surfaces noindex.
5. **Compliance:** No shipping surface violates investment/legal forbidden-claim policies.
6. **Documentation:** Release notes + residual risk list published for the Phase 2 train.
7. **Non-goals honored:** No unauthorized Factory runtime, payments, or big-bang redesign.

**Decision vocabulary:** `PHASE 2 RELEASED` · `RELEASED WITH WAIVERS` · `NOT ACCEPTED`

---

## 2. Cross-cutting gates (every milestone that ships UI)

| Gate | Pass rule |
| --- | --- |
| Quality | typecheck, lint, test, build PASS |
| i18n | New customer strings in en/zh/th |
| a11y | Landmarks, labels, keyboard for new flows |
| SEO | robots/sitemap/metadata per surface class |
| Security | AuthZ tests for new private data |
| Perf | Budgets for map/AI/media changes |
| Flags | Default-safe in production |
| Evidence | No fabricated listing facts |

---

## 3. Milestone acceptance

### M0 — Foundation

| # | Criterion |
| --- | --- |
| M0.1 | Owner scope GO recorded |
| M0.2 | `v1.0.0` prod smoke PASS |
| M0.3 | Flag + security + IA prefix decisions recorded |
| M0.4 | Residual backlog triaged |

### M1 — Customer dashboard & saved searches

| # | Criterion |
| --- | --- |
| M1.1 | Customer can sign in/out securely |
| M1.2 | Dashboard shows saved items and searches |
| M1.3 | Saved search CRUD restores filters correctly |
| M1.4 | Device favorites remain usable without account |
| M1.5 | Opt-in migration does not destroy device state silently |
| M1.6 | Account routes noindex |
| M1.7 | EN/ZH/TH + a11y PASS |

### M2 — Leads, notifications, CRM

| # | Criterion |
| --- | --- |
| M2.1 | Staff lead inbox lists/filters/assigns |
| M2.2 | Status transitions audited |
| M2.3 | Phase 1 public lead forms still succeed |
| M2.4 | Notification prefs respected |
| M2.5 | CRM sync idempotent with failure visibility |
| M2.6 | IDOR tests PASS |
| M2.7 | PII retention policy documented |

### M3 — Acquisition

| # | Criterion |
| --- | --- |
| M3.1 | Submit creates tracked case with ID |
| M3.2 | Illegal state transitions blocked |
| M3.3 | Evidence checklist enforced before publish |
| M3.4 | Publish bridge links to catalog without inventing facts |
| M3.5 | Reject/unpublish paths work + audited |
| M3.6 | Spam/rate controls active |

### M4 — Developer & agent

| # | Criterion |
| --- | --- |
| M4.1 | RBAC prevents cross-org access |
| M4.2 | Developer can manage scoped projects/listings per spec MVP |
| M4.3 | Agent can steward listings and hand off leads |
| M4.4 | Onboarding invite/verify path secured |
| M4.5 | Partner app noindex |

### M5 — Maps

| # | Criterion |
| --- | --- |
| M5.1 | Users browse map and open listing from pin |
| M5.2 | Bbox API enforces limits |
| M5.3 | Keyboard-accessible listing list alternative |
| M5.4 | District deep links canonical + in sitemap |
| M5.5 | CWV/perf budget met on sample pages |
| M5.6 | EN/ZH/TH chrome PASS |

### M6 — Finance & legal tools

| # | Criterion |
| --- | --- |
| M6.1 | Mortgage calculator deterministic tests PASS |
| M6.2 | Disclaimers visible and crawlable |
| M6.3 | Legal checklist does not present advice |
| M6.4 | Forbidden investment/legal claims absent |
| M6.5 | Tools meet educational SEO copy bar |
| M6.6 | a11y live regions for results |

### M7 — AI

| # | Criterion |
| --- | --- |
| M7.1 | Recommend MVP returns evidenced reason codes |
| M7.2 | Explanations do not invent null fields |
| M7.3 | Investment assist requires disclaimer ACK |
| M7.4 | Forbidden-claim eval set PASS |
| M7.5 | Provider failure → L0/safe fallback |
| M7.6 | Kill switch disables AI surfaces |
| M7.7 | Latency within budget; quotas enforced |
| M7.8 | Audit logs retained per policy |

### M8 — Analytics, multilingual, release

| # | Criterion |
| --- | --- |
| M8.1 | Expanded events fire only with consent |
| M8.2 | Taxonomy covers leads/map/tools/AI/partners |
| M8.3 | Locale growth evaluation delivered (no silent new locale) |
| M8.4 | RC regression PASS |
| M8.5 | Production release train executed per plan |
| M8.6 | Closure decision recorded |

---

## 4. Goal coverage traceability

| Phase 2 goal | Acceptance anchors |
| --- | --- |
| Property acquisition | M3.* |
| Developer management | M4.1–M4.2 |
| Lead management | M2.* |
| AI recommendation | M7.1–M7.2, M7.5–M7.8 |
| AI investment analysis | M7.3–M7.8 |
| Interactive maps | M5.* |
| Mortgage / finance | M6.1–M6.2, M6.4–M6.6 |
| Legal workflow | M6.3–M6.4 |
| Agent workflow | M4.3–M4.4 |
| Customer dashboard | M1.1–M1.2, M1.6–M1.7 |
| Saved searches | M1.3 |
| Notifications | M2.4 |
| CRM integration | M2.5 |
| Analytics expansion | M8.1–M8.2 |
| Multilingual growth | M8.3 + cross-cutting i18n |

---

## 5. Explicit non-acceptance conditions

Do **not** accept Phase 2 if:

- Production Phase 1 smoke fails due to Phase 2 changes
- AI or tools ship with unresolved P0 compliance findings
- Private data exposed publicly or indexed
- Owner scope freeze violated without addendum

---

## 6. Waiver rule

Waivers allowed only for non-P0 items, written by Owner, listed in release notes, with follow-up IDs.
