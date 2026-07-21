# Phase 2 — Risk Register

**Status:** Planning
**Date:** 2026-07-21
**Baseline:** `v1.0.0` LIVE

Severity: **P0** blocker · **P1** high · **P2** medium · **P3** low

---

## 1. Product & scope risks

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-SCOPE-1 | P1 | Scope creep into redesign / Factory runtime | M | H | Scope freeze; PR boundary checks |
| R-SCOPE-2 | P2 | Mixing Data Factory waves into platform milestones | M | M | Explicit plane separation in master plan |
| R-SCOPE-3 | P2 | Building AI before lead/ops foundations | M | M | Sequence 2A→2D enforced |

---

## 2. Production stability

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-PROD-1 | P0 | Regression of Phase 1 discovery/inquiry | L | H | Flags; smoke; rollback to prior deploy / `v1.0.0` pin |
| R-PROD-2 | P1 | Perf regression from maps/AI bundles | M | H | Budgets; code splitting; CWV gates |
| R-PROD-3 | P2 | Sitemap/robots mistakes indexing private pages | M | M | SEO gates; automated robots tests |

---

## 3. Security & privacy

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-SEC-1 | P0 | IDOR on account/leads/partner data | M | H | Object-level auth tests; security review |
| R-SEC-2 | P0 | CRM webhook forgery | L | H | Signatures; IP allowlists if available |
| R-SEC-3 | P1 | PII leakage via AI logs/prompts | M | H | Redaction; retention limits; no CRM notes by default |
| R-SEC-4 | P1 | Privilege escalation customer→admin | L | H | Separate role stores; regression tests |
| R-SEC-5 | P2 | Evidence upload malware | M | M | Type/size limits; scanning plan |

---

## 4. Compliance (investment / legal / finance)

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-CMP-1 | P0 | AI or tools imply guaranteed returns | M | H | Forbidden-claim scanner; disclaimers; policy pack |
| R-CMP-2 | P0 | Legal workflow presented as advice | M | H | G_LEGAL alignment; copy review |
| R-CMP-3 | P1 | Mortgage outputs misread as bank offers | M | H | Clear “illustrative only” UX |
| R-CMP-4 | P2 | Locale mistranslation of disclaimers | M | M | Human review EN/ZH/TH |

---

## 5. Data & integrations

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-DATA-1 | P1 | Schema migration breaks catalog reads | M | H | Additive migrations; expand/contract; staging |
| R-DATA-2 | P1 | CRM sync drift / duplicates | M | M | Idempotent keys; dead-letter; reconciliation job design |
| R-DATA-3 | P2 | Device→account save migration conflicts | M | M | Explicit merge UX; backups of device state |
| R-DATA-4 | P2 | Map bbox queries overload DB | M | M | Limits, indexes plan, caching |

---

## 6. AI-specific

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-AI-1 | P0 | Hallucinated listing facts | M | H | Cite fields only; L0 fallback; no free-form facts |
| R-AI-2 | P1 | Cost runaway | M | M | Quotas; caching; auth for heavy paths |
| R-AI-3 | P1 | Provider outage | M | M | Kill switch; degrade to rules |
| R-AI-4 | P2 | Over-trust / automation bias | M | M | Explanations; human publish separation |

---

## 7. Organizational / delivery

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-ORG-1 | P1 | CRM vendor delay blocks M2 | M | M | Adapter abstraction; email-only interim |
| R-ORG-2 | P2 | Map vendor ToS/cost surprise | M | M | Early M5 vendor spike |
| R-ORG-3 | P2 | Partner adoption low | M | L | Invite-only MVP; measure activation |
| R-ORG-4 | P3 | Phase 1 residual noise distracts | L | L | Optional backlog P2-090+ |

---

## 8. SEO & growth

| ID | Sev | Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- | --- | --- |
| R-SEO-1 | P1 | Thin tool pages | M | M | Educational copy bar |
| R-SEO-2 | P2 | Duplicate map vs listing URLs | M | M | Canonical rules |
| R-SEO-3 | P2 | Premature new locale | L | M | M8 evaluation gate |

---

## 9. Risk review cadence

- Re-read this register at each milestone entry.
- Any new **P0** opens a stop-the-line until mitigated.
- Waived risks require Owner written waiver in release notes.

---

## 10. Top mitigations to fund first

1. Feature flags + rollback drills
2. AuthZ test pack
3. Compliance claim scanner for AI/tools
4. CRM idempotency + dead-letter
5. Map/AI performance budgets
