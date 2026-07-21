# Phase 2 — Implementation Sequence

**Status:** Planning only
**Date:** 2026-07-21
**Task catalog:** `PHASE2_TASK_BREAKDOWN.md`

---

## 1. Sequencing principles

1. **Demand ops before heavy AI** — accounts, leads, CRM unlock personalization later.
2. **Supply ops before partner scale** — acquisition review before wide partner invites.
3. **Tools before AI coach** — finance/legal calculators underpin investment assist.
4. **Flags everywhere** — ship dark → internal → % rollout → GA.
5. **Never block production** — each milestone releasable independently when gated.
6. **Factory optional** — do not wait on Windows01/embeddings to start 2A/2B.

---

## 2. Estimated implementation phases

| Phase | Milestones | Focus | Parallelism |
| --- | --- | --- | --- |
| **2A** | M0 → M2 | Guardrails, customer, leads, CRM, notifications | Low until M0 done |
| **2B** | M3 → M4 | Acquisition, developer, agent | After M2 lead model stable |
| **2C** | M5 → M6 | Maps, finance, legal tools | Can start map design mid-2B |
| **2D** | M7 → M8 | AI, analytics, i18n growth, RC/release | Needs M1 + M6 for full AI |

---

## 3. Milestone details

### M0 — Foundation & production guardrails

| Field | Content |
| --- | --- |
| **Objectives** | Freeze scope; baseline prod; flags; security/IA decisions |
| **Scope** | P2-001–008 |
| **Dependencies** | Phase 1 `v1.0.0` LIVE; Owner attention |
| **Order** | First — blocks all implementation |
| **Validation gates** | Scope GO; baseline smoke; DoD template ready |
| **Release gates** | N/A (docs/process only) |

### M1 — Customer identity & dashboard

| Field | Content |
| --- | --- |
| **Objectives** | Auth customers; dashboard; saved searches; save sync |
| **Scope** | P2-010–019 |
| **Dependencies** | M0; privacy policy updates if needed |
| **Order** | After M0; before personalized notify/AI |
| **Validation gates** | AuthZ; i18n; a11y; noindex account |
| **Release gates** | Flagged beta → GA on Owner GO |

### M2 — Leads, notifications, CRM

| Field | Content |
| --- | --- |
| **Objectives** | Operationalize leads; notify; CRM mirror |
| **Scope** | P2-020–030 |
| **Dependencies** | M0; M1 optional for account-linked leads (can phase) |
| **Order** | Parallel design with M1; implement after lifecycle freeze |
| **Validation gates** | IDOR; SLA; CRM dead-letter; consent |
| **Release gates** | Staff-only first; CRM prod credentials Owner-controlled |

### M3 — Property acquisition

| Field | Content |
| --- | --- |
| **Objectives** | Tracked intake → review → publish bridge |
| **Scope** | P2-031–038 |
| **Dependencies** | M2 staff auth patterns; property evidence standards |
| **Order** | After M2 ops shell patterns |
| **Validation gates** | State machine; audit; no invented facts |
| **Release gates** | Internal review only → limited partners |

### M4 — Developer & agent

| Field | Content |
| --- | --- |
| **Objectives** | Partner RBAC portals and workflows |
| **Scope** | P2-040–046 |
| **Dependencies** | M3 acquisition; M2 leads |
| **Order** | After M3 publish bridge design |
| **Validation gates** | Scoped authZ; onboarding security |
| **Release gates** | Invited partners only |

### M5 — Interactive maps

| Field | Content |
| --- | --- |
| **Objectives** | Map discovery with SEO-safe deep links |
| **Scope** | P2-050–056 |
| **Dependencies** | Geo fields on catalog; perf budget |
| **Order** | May design during 2B; implement when budget approved |
| **Validation gates** | CWV; keyboard alternative; bbox limits |
| **Release gates** | Soft launch locale EN → all locales |

### M6 — Finance & legal tools

| Field | Content |
| --- | --- |
| **Objectives** | Calculators + legal checklists (non-advice) |
| **Scope** | P2-060–065 |
| **Dependencies** | G_INVESTMENT / G_LEGAL packages |
| **Order** | After compliance policy freeze; before P-INV AI |
| **Validation gates** | Disclaimer; deterministic calc tests; SEO copy |
| **Release gates** | Public flagged launch |

### M7 — AI recommendation & investment analysis

| Field | Content |
| --- | --- |
| **Objectives** | L0→L2 recommend; bounded investment assist |
| **Scope** | P2-070–077 |
| **Dependencies** | M1 context; M6 tools; optional Factory vectors |
| **Order** | After M6; can ship L0 earlier if flagged |
| **Validation gates** | Claim scanner; latency; kill switch |
| **Release gates** | Internal → % traffic → GA |

### M8 — Analytics, multilingual, release

| Field | Content |
| --- | --- |
| **Objectives** | Measurement, locale policy, Phase 2 RC/release |
| **Scope** | P2-080–087 |
| **Dependencies** | Features from prior milestones |
| **Order** | Continuous instrumentation + end-train release |
| **Validation gates** | Full regression; SEO; consent |
| **Release gates** | Phase 2 production release decision |

---

## 4. Critical dependency graph (simplified)

```text
M0
├── M1 ──────────────────────────────┐
├── M2 ──► M3 ──► M4                 │
│            │                       │
│            └──────────────►        │
├── M5 (perf budget)                 │
├── M6 ◄── legal/investment policies │
└── M7 ◄── M1 + M6 (+ optional vectors)
     └── M8 ← all milestone evidence
```

---

## 5. Suggested calendar shape (indicative, not committed)

| Phase | Indicative duration | Notes |
| --- | --- | --- |
| 2A | 2–3 sprint blocks | Highest business urgency |
| 2B | 2–3 sprint blocks | Partner readiness dependent |
| 2C | 1–2 sprint blocks | Map vendor lead time |
| 2D | 2 sprint blocks + RC | AI eval time boxed |

Exact dates set at M0 kickoff.

---

## 6. Entry / exit per milestone

| Milestone | Entry | Exit |
| --- | --- | --- |
| M0 | Owner wants Phase 2 | Scope frozen; baseline green |
| M1 | M0 exit | §M1 acceptance PASS |
| M2 | Lifecycle + CRM vendor decided | §M2 PASS |
| M3 | Evidence checklist frozen | §M3 PASS |
| M4 | RBAC frozen; M3 bridge designed | §M4 PASS |
| M5 | Map vendor + budget | §M5 PASS |
| M6 | Compliance GO | §M6 PASS |
| M7 | AI policy pack | §M7 PASS |
| M8 | Prior exits + RC | Phase 2 release decision |

---

## 7. Stop conditions

Halt implementation and escalate if:

- Production `v1.0.0` regresses materially
- P0 security issue in auth/CRM/AI
- Scope creep without addendum
- Legal/investment claim violations in staging
- Data Factory work incorrectly mixed into platform PRs without gate
