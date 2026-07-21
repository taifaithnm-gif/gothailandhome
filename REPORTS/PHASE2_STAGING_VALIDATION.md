# Phase 2 Staging Validation

**Date:** 2026-07-21
**Baseline:** Phase 1 `v1.0.0`
**Method:** Approved local/CI gates + contract suites + local HTTP smoke with Phase 2 flags ON (`127.0.0.1:3020`)
**Owner remote staging env:** Not executed here (no production/staging cloud mutations). Owner applies migrations + trains per checklist.
**Result:** **PASS WITH MINOR ISSUES** (engineering RC validation complete)

---

## 1. Staging checklist review

| Item | Engineering status |
| --- | --- |
| Feature flags default OFF | VERIFIED |
| Migration order documented | VERIFIED |
| Rollback sequence documented | VERIFIED |
| Monitoring checklist documented | VERIFIED |
| Smoke checklist documented | VERIFIED |
| Production migrations executed | **NOT DONE** (forbidden) |
| Owner staging DB apply | **OWNER PENDING** |

## 2. Quality gates (release plan §4)

| Gate | Result |
| --- | --- |
| typecheck | PASS |
| lint | PASS |
| test | PASS |
| build | PASS |
| Domain contract tests (phase2-*) | PASS |
| i18n key parity (map/tools/account) | PASS |
| a11y smoke | PASS |
| SEO robots/sitemap | PASS |
| Feature flag default-safe | PASS |

## 3. Journey validation

| Journey | Evidence | Result |
| --- | --- | --- |
| Lead workflows | marketplace + inquiry + ops-leads contracts; list-your-property HTTP 200 | PASS |
| Partner workflows | partner RBAC tests; `/partners/app` HTTP 200 | PASS |
| Developer workflows | partner developer portal routes + Phase 1 developer contracts | PASS |
| Customer dashboard | account contracts; `/en/account` HTTP 200 (flag ON) | PASS |
| Saved searches | account saved-search round-trip | PASS |
| Notifications | prefs + quiet hours contracts | PASS |
| Maps | map contracts; `/en/map`, `/th/map`, district deep link HTTP 200 | PASS |
| Finance tools | mortgage contracts; `/en/tools/mortgage` HTTP 200 | PASS |
| Legal tools | legal contracts; `/en/tools/legal` HTTP 200 | PASS |
| AI recommendation | AI contracts; investment-assist HTTP 200; rail wired | PASS |
| Analytics | bootstrap/events + expansion helpers | PASS |
| SEO | robots disallow account/partners/app/admin; sitemap build | PASS |
| Accessibility | accessibility + remediation PASS | PASS |
| Responsive | 375/768/1280 matrix PASS | PASS |
| Internationalization | EN/ZH/TH dict parity; `/zh/tools` `/th/map` HTTP 200 | PASS |

## 4. Viewport coverage

| Viewport | Result |
| --- | --- |
| Mobile 375 | PASS (responsive contracts) |
| Tablet 768 | PASS |
| Desktop 1280 | PASS |

## 5. Local HTTP smoke (flags ON)

All sampled routes returned **200** with expected titles (home EN/ZH/TH, account, map, tools*, partners, marketplace, faq, robots, sitemap).

## 6. Owner-only remaining staging actions

1. Apply additive migrations on staging DB (not production).
2. Enable trains T1→T10 with smoke after each.
3. Configure optional `RESEND_*` / `CRM_WEBHOOK_*` for synthetic tests.
4. Monitor auth/acquisition/outbox/CRM during trains.

## 7. Decision

**Engineering staging validation: PASS WITH MINOR ISSUES**
Remote Owner staging apply remains Owner-operated; does not block RC package.
