# GoThailandHome — Phase 2 Master Plan

**Product:** GoThailandHome
**Baseline:** Phase 1 production release `v1.0.0` (LIVE)
**Document status:** Planning only — does **not** authorize implementation
**Date:** 2026-07-21
**Locale baseline:** `en` · `zh` · `th`

---

## 1. Purpose

Transform GoThailandHome from a high-quality multilingual property discovery website into a **real estate platform** with durable business capabilities: acquisition, partner operations, lead/CRM loops, customer accounts, discovery tools, and AI-assisted journeys — without destabilizing the live `v1.0.0` production baseline.

This master plan is the index for the Phase 2 planning package under `docs/phase2/`.

---

## 2. Non-negotiable constraints

| Constraint | Rule |
| --- | --- |
| Production stability | No Phase 2 work ships without gates that protect `v1.0.0` behavior |
| Planning boundary | This package creates documents only; no code, schema, API, migrations, or deploy |
| Baseline respect | Build **on** Phase 1; do not rewrite the public discovery IA without Owner approval |
| Evidence honesty | No fabricated property facts, yields, legal advice, or investment guarantees |
| Factory separation | Data Factory / Windows01 supply plane remains a **separate** workstream (see §8) |
| Consent & privacy | Analytics, CRM, notifications, and AI features inherit consent / privacy policy |

---

## 3. Phase 2 north star

**From:** Accountless discovery → inquire → learn
**To:** Account-aware platform → manage demand & supply → assist decisions → operate partners → measure & grow

Success looks like:

1. Customers can save progress across devices (dashboard, saved searches, notifications).
2. Leads are operationally manageable and CRM-ready.
3. Property supply can enter a governed acquisition workflow.
4. Developers and agents have clear operational paths.
5. Maps, finance tools, and legal support deepen decision quality without overclaiming.
6. AI assists recommendation and investment **analysis framing** with disclaimers and evidence bounds.
7. SEO, performance, a11y, and i18n remain first-class.

---

## 4. Capability pillars (15 goals)

| # | Goal | Primary milestones |
| --- | --- | --- |
| 1 | Property acquisition workflow | M3 |
| 2 | Developer management | M4 |
| 3 | Lead management | M2 |
| 4 | AI property recommendation | M7 |
| 5 | AI investment analysis | M7 |
| 6 | Interactive maps | M5 |
| 7 | Mortgage / finance tools | M6 |
| 8 | Legal workflow support | M6 |
| 9 | Agent workflow | M4 |
| 10 | Customer dashboard | M1 |
| 11 | Saved searches | M1 |
| 12 | Notifications | M2 |
| 13 | CRM integration | M2 |
| 14 | Analytics expansion | M8 |
| 15 | Future multilingual growth | M8 |

Cross-cutting: SEO, performance, accessibility, maintainability, i18n, production guardrails (all milestones).

---

## 5. Milestone overview

| ID | Milestone | Intent |
| --- | --- | --- |
| **M0** | Foundation & production guardrails | Freeze Phase 2 scope, residual carry-in policy, observability, release train |
| **M1** | Customer identity & dashboard | Auth-aware customer surfaces; saved searches; migrate device favorites/compare carefully |
| **M2** | Lead ops, notifications & CRM | Lead inbox, lifecycle, outbound notify, CRM adapters |
| **M3** | Property acquisition | Intake → review → publish pipeline for new supply |
| **M4** | Developer & agent operations | Partner consoles / workflows for developers and agents |
| **M5** | Interactive maps & geo discovery | Map-first browsing tied to listings / districts |
| **M6** | Finance tools & legal workflow | Mortgage calculators + guided legal journeys (non-advice) |
| **M7** | AI recommendation & investment analysis | Assistive AI with evidence bounds and audit |
| **M8** | Analytics, i18n growth & platform release | Measurement expansion, locale roadmap, Phase 2 RC → release |

Detailed objectives, dependencies, and gates: `PHASE2_IMPLEMENTATION_SEQUENCE.md`
Task inventory: `PHASE2_TASK_BREAKDOWN.md`

---

## 6. Estimated implementation phases

| Phase | Milestones | Theme | Rough order |
| --- | --- | --- | --- |
| **2A** | M0 → M2 | Customer & demand operations | First |
| **2B** | M3 → M4 | Supply & partner operations | Second |
| **2C** | M5 → M6 | Decision tools (maps, finance, legal) | Third |
| **2D** | M7 → M8 | Intelligence, growth, release | Fourth |

Phases may partially overlap only where dependencies allow (e.g., analytics instrumentation alongside feature work).

---

## 7. Design principles

1. **Scalability** — Prefer modular domain services; avoid monolith admin dumps; design for catalog growth.
2. **SEO** — Every new public surface gets metadata, indexation, and internal-link rules before ship.
3. **Performance** — Map/AI/media features ship behind budgets; no unbounded SSR catalogs.
4. **Accessibility** — WCAG-oriented contracts on new interactive surfaces (maps, dashboards, forms).
5. **Maintainability** — Contracts before code; feature flags; clear Owner gates.
6. **Internationalization** — EN/ZH/TH parity for customer-facing Phase 2 features; admin language policy explicit.
7. **AI-assisted journeys** — Assist, explain, cite; never invent listing facts or guaranteed returns.
8. **Production stability** — Progressive delivery; rollback plans; no silent schema drift in planning docs.

---

## 8. Relationship to Data Factory

| Plane | Owns | Phase 2 website plan |
| --- | --- | --- |
| **Platform (this package)** | Customer UX, lead/CRM, partner workflows, maps, tools, AI UX | In scope |
| **Data Factory** | Harvest, normalize, evidence, Windows01, OCR, embeddings supply | Separate roadmap (`DATA_FACTORY_MASTER_PLAN.md`, `20_PHASE2_IMPLEMENTATION_ROADMAP.md`) |

Phase 2 platform may **consume** Factory outputs via approved contracts later. This package does **not** authorize Factory runtime build. Acquisition workflow (M3) may start with human/partner intake even before Factory automation.

---

## 9. Document map

| Document | Role |
| --- | --- |
| `PHASE2_MASTER_PLAN.md` | This index |
| `PHASE2_BUSINESS_SCOPE.md` | In / out / deferred |
| `PHASE2_INFORMATION_ARCHITECTURE.md` | Routes, nav, personas |
| `PHASE2_AI_ROADMAP.md` | Recommendation + investment AI |
| `PHASE2_SEO_STRATEGY.md` | Indexation & content SEO for Phase 2 |
| `PHASE2_DATA_MODEL_IMPACT.md` | Planned entity impact (**no migrations**) |
| `PHASE2_API_IMPACT.md` | Planned API surfaces (**no endpoints built**) |
| `PHASE2_TASK_BREAKDOWN.md` | P2 tasks with validation |
| `PHASE2_IMPLEMENTATION_SEQUENCE.md` | Milestone order & gates |
| `PHASE2_RELEASE_PLAN.md` | RC → production release train |
| `PHASE2_RISK_REGISTER.md` | Risks & controls |
| `PHASE2_ACCEPTANCE_CRITERIA.md` | Phase 2 done-when |

---

## 10. Phase 1 residual policy

Carry Phase 1 P2/P3 residuals into Phase 2 backlog **without blocking** M0 kickoff:

- P2: NFT warning, sparse media LCP, favorites sitemap policy
- P3: LoadingState/breadcrumb English defaults, admin EN-only, screenshot lab, CI bundle budget

Track as optional hardening tasks; do not treat as Phase 2 scope expansion.

---

## 11. Authorization gate

**Implementation may begin only after** Owner approval of this package and explicit kickoff of M0.

Until then: planning complete; code/schema/API/deploy forbidden.

---

## 12. Decision (planning package)

This master plan asserts the Phase 2 planning package is complete for Owner review. Implementation readiness is recorded in the task final output after all deliverables exist.
