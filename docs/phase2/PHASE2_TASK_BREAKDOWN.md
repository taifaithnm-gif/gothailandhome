# Phase 2 — Task Breakdown

**Status:** Planning only — tasks are not started
**ID scheme:** `P2-XXX`
**Date:** 2026-07-21
**Baseline:** `v1.0.0`

Each task lists: **ID · Title · Goal · Expected deliverables · Validation requirements**.

---

## M0 — Foundation & production guardrails

### P2-001 — Phase 2 scope freeze workshop
- **Goal:** Owner-approve business scope and milestone order.
- **Deliverables:** Signed scope addendum referencing `PHASE2_BUSINESS_SCOPE.md`.
- **Validation:** Written Owner GO on scope; out-of-scope list acknowledged.

### P2-002 — Production baseline checklist
- **Goal:** Confirm `v1.0.0` health before any Phase 2 build.
- **Deliverables:** Baseline smoke + rollback pin recorded.
- **Validation:** Prod smoke PASS; tag `v1.0.0` verified.

### P2-003 — Feature-flag & environment policy
- **Goal:** Define flags for progressive Phase 2 delivery.
- **Deliverables:** Flag naming standard + env policy doc section.
- **Validation:** Policy reviewed; no prod env changed yet.

### P2-004 — Observability & error budget plan
- **Goal:** Metrics/alerts for new domains.
- **Deliverables:** Metric list (leads, auth, AI, map, CRM).
- **Validation:** Owner accepts alert thresholds draft.

### P2-005 — Security & privacy review plan
- **Goal:** Prefight PII, authZ, CRM, AI logging.
- **Deliverables:** Security checklist for M1–M7.
- **Validation:** Checklist covers IDOR, webhooks, retention.

### P2-006 — IA prefix decision (`/admin` vs `/ops`)
- **Goal:** Freeze staff shell IA.
- **Deliverables:** Decision recorded in IA doc addendum.
- **Validation:** Decision signed; robots policy draft updated on paper.

### P2-007 — Residual P2/P3 intake
- **Goal:** Import Phase 1 residuals without scope creep.
- **Deliverables:** Optional hardening backlog IDs linked.
- **Validation:** Residuals tagged optional vs required.

### P2-008 — Phase 2 Definition of Done template
- **Goal:** Standardize validation/release gates per task.
- **Deliverables:** DoD checklist template.
- **Validation:** Used by M1+ task specs.

---

## M1 — Customer identity, dashboard & saved searches

### P2-010 — Auth provider selection & threat model
- **Goal:** Choose customer auth approach.
- **Deliverables:** Provider decision + threat model.
- **Validation:** Security review sign-off.

### P2-011 — Customer profile contract
- **Goal:** Define profile fields and locale prefs.
- **Deliverables:** Contract doc; maps to data-model impact.
- **Validation:** PII minimization review.

### P2-012 — Account dashboard UX spec
- **Goal:** Specify dashboard IA and empty states.
- **Deliverables:** UX spec + a11y notes.
- **Validation:** Design review; i18n key list.

### P2-013 — Saved items sync design
- **Goal:** Dual-write / migrate favorites & compare.
- **Deliverables:** Migration UX + conflict rules.
- **Validation:** Device-only users unaffected until opt-in.

### P2-014 — Saved search contract
- **Goal:** Serialize filters, frequency, locale.
- **Deliverables:** Saved search schema contract (logical).
- **Validation:** Round-trip filter fidelity cases defined.

### P2-015 — Account API/action design
- **Goal:** Specify account server surfaces.
- **Deliverables:** API impact concrete signatures (design).
- **Validation:** AuthZ matrix complete.

### P2-016 — Implement customer auth (future build)
- **Goal:** Ship authenticated sessions for customers.
- **Deliverables:** Auth flows EN/ZH/TH; callbacks secure.
- **Validation:** Session tests; no admin privilege escalation.

### P2-017 — Implement dashboard + saved items
- **Goal:** Customer can view/manage saves.
- **Deliverables:** Dashboard UI + sync.
- **Validation:** a11y + i18n gates; noindex robots.

### P2-018 — Implement saved searches CRUD
- **Goal:** Create/edit/delete saved searches.
- **Deliverables:** Account searches UI + persistence.
- **Validation:** Filter restore tests; rate limits.

### P2-019 — M1 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M1 test report.
- **Validation:** Criteria in `PHASE2_ACCEPTANCE_CRITERIA.md` §M1.

---

## M2 — Lead management, notifications & CRM

### P2-020 — Lead lifecycle vocabulary
- **Goal:** Freeze statuses, outcomes, SLA fields.
- **Deliverables:** Status enum + SLA policy.
- **Validation:** Ops stakeholder approval.

### P2-021 — Lead inbox UX/ops spec
- **Goal:** Staff workflow for triage/assign.
- **Deliverables:** Spec + permissions.
- **Validation:** Role matrix reviewed.

### P2-022 — Extend lead capture compatibility
- **Goal:** Keep Phase 1 forms working; add account linkage.
- **Deliverables:** Compatibility design.
- **Validation:** Backward-compatible field plan.

### P2-023 — Notification channel strategy
- **Goal:** Email first; push later optional.
- **Deliverables:** Channel roadmap + preference model.
- **Validation:** Consent alignment.

### P2-024 — Saved-search alert rules
- **Goal:** Define match → notify behavior.
- **Deliverables:** Matching rules + quiet hours.
- **Validation:** No spam scenarios defined.

### P2-025 — CRM provider selection
- **Goal:** Pick CRM / integration mode.
- **Deliverables:** Provider decision + mapping table.
- **Validation:** Owner commercial approval.

### P2-026 — CRM adapter contract
- **Goal:** Webhook/API sync contract.
- **Deliverables:** Adapter interface + failure handling.
- **Validation:** Signature + retry design reviewed.

### P2-027 — Implement lead ops inbox (future build)
- **Goal:** Staff can manage leads.
- **Deliverables:** Inbox + detail + audit events.
- **Validation:** IDOR tests; SLA timers.

### P2-028 — Implement notifications MVP
- **Goal:** Transactional email for key events.
- **Deliverables:** Outbox + prefs UI.
- **Validation:** Prefs respected; bounce handling plan.

### P2-029 — Implement CRM sync MVP
- **Goal:** Push leads to CRM; receive status optionally.
- **Deliverables:** Adapter + monitoring.
- **Validation:** Sync lag metric; dead-letter path.

### P2-030 — M2 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M2 report.
- **Validation:** §M2 acceptance criteria.

---

## M3 — Property acquisition workflow

### P2-031 — Acquisition state machine
- **Goal:** submit → enrich → review → publish/reject.
- **Deliverables:** State diagram + permissions.
- **Validation:** Illegal transitions listed.

### P2-032 — Evidence checklist standard
- **Goal:** Required evidence for publish.
- **Deliverables:** Checklist aligned to property contracts.
- **Validation:** Evidence honesty rules mapped.

### P2-033 — Partner intake UX upgrade spec
- **Goal:** Upgrade list-your-property into tracked cases.
- **Deliverables:** UX + status visibility for submitter.
- **Validation:** i18n + a11y notes.

### P2-034 — Reviewer console spec
- **Goal:** Ops review/approve experience.
- **Deliverables:** Spec + audit requirements.
- **Validation:** Dual-control option considered.

### P2-035 — Publish bridge design
- **Goal:** Link approved case → catalog property.
- **Deliverables:** Mapping to Phase 1 property model / Factory contracts.
- **Validation:** No silent fact invention.

### P2-036 — Implement acquisition intake (future build)
- **Goal:** Cases creatable from public/partner forms.
- **Deliverables:** Intake + case IDs.
- **Validation:** Rate limit; spam controls.

### P2-037 — Implement review & publish bridge
- **Goal:** Staff can approve and link/publish.
- **Deliverables:** Review UI + publish action.
- **Validation:** Audit log; rollback unpublish.

### P2-038 — M3 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M3 report.
- **Validation:** §M3 criteria.

---

## M4 — Developer management & agent workflow

### P2-040 — Partner role model
- **Goal:** Roles for developer org vs agent.
- **Deliverables:** RBAC matrix.
- **Validation:** Separation from customer/admin.

### P2-041 — Developer management spec
- **Goal:** Manage org profile, projects, lead routing.
- **Deliverables:** Spec + IA.
- **Validation:** Partner UX review.

### P2-042 — Agent workflow spec
- **Goal:** Stewardship, handoff, viewing notes.
- **Deliverables:** Spec + lead handoff states.
- **Validation:** Ops + agent review.

### P2-043 — Partner auth & onboarding
- **Goal:** Invite/verify partners.
- **Deliverables:** Onboarding design.
- **Validation:** Security review.

### P2-044 — Implement developer portal MVP
- **Goal:** Developers manage scoped entities.
- **Deliverables:** Portal features flagged.
- **Validation:** Scoped authZ tests.

### P2-045 — Implement agent workflow MVP
- **Goal:** Agents handle stewardship + handoff.
- **Deliverables:** Agent app MVP.
- **Validation:** Audit events; a11y baseline.

### P2-046 — M4 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M4 report.
- **Validation:** §M4 criteria.

---

## M5 — Interactive maps

### P2-050 — Map provider & tile policy
- **Goal:** Select map stack; cost/ToS.
- **Deliverables:** Provider decision.
- **Validation:** Owner approval; privacy review.

### P2-051 — Map UX & performance budget
- **Goal:** Desktop/mobile map discovery UX.
- **Deliverables:** UX + CWV budget.
- **Validation:** Perf budget signed.

### P2-052 — Bbox search API design
- **Goal:** Bounded geo queries.
- **Deliverables:** API contract + limits.
- **Validation:** Abuse cases listed.

### P2-053 — Geo SEO deep-link plan
- **Goal:** District map URLs + canonicals.
- **Deliverables:** SEO section implementation plan.
- **Validation:** Matches `PHASE2_SEO_STRATEGY.md`.

### P2-054 — Implement map MVP
- **Goal:** Map browse + pin → listing.
- **Deliverables:** `/{lang}/map` MVP.
- **Validation:** Keyboard list alternative; i18n; CWV sample.

### P2-055 — Map ↔ listing filters sync
- **Goal:** Shareable filter state.
- **Deliverables:** URL state design/impl.
- **Validation:** Canonicalization tests.

### P2-056 — M5 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M5 report.
- **Validation:** §M5 criteria.

---

## M6 — Mortgage / finance tools & legal workflow

### P2-060 — Finance tool assumptions policy
- **Goal:** Allowed inputs/outputs; disclaimer copy.
- **Deliverables:** Policy + formula sources.
- **Validation:** Compliance review.

### P2-061 — Mortgage calculator UX spec
- **Goal:** Accessible calculator + scenarios.
- **Deliverables:** Spec EN/ZH/TH.
- **Validation:** a11y live-region plan.

### P2-062 — Legal workflow support scope
- **Goal:** Checklists & document requests — not advice.
- **Deliverables:** Workflow map linked to `G_LEGAL_*`.
- **Validation:** Legal forbidden-advice check.

### P2-063 — Implement mortgage/finance tools
- **Goal:** Public tools live behind flag.
- **Deliverables:** Tools pages + compute.
- **Validation:** Deterministic tests; SEO copy bar.

### P2-064 — Implement legal workflow MVP
- **Goal:** Guided checklist UX.
- **Deliverables:** Legal tools hub MVP.
- **Validation:** Disclaimer ACK; no advice claims.

### P2-065 — M6 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M6 report.
- **Validation:** §M6 criteria.

---

## M7 — AI recommendation & investment analysis

### P2-070 — AI policy pack freeze
- **Goal:** Freeze allowed/forbidden behaviors.
- **Deliverables:** Policy pack + eval set outline.
- **Validation:** Owner + compliance GO.

### P2-071 — Recommendation L0 rules engine design
- **Goal:** Similar listings without LLM.
- **Deliverables:** Rule spec.
- **Validation:** Null-evidence cases.

### P2-072 — Recommendation L1/L2 design
- **Goal:** Similarity + explanations.
- **Deliverables:** Design; optional vector dependency noted.
- **Validation:** Citation requirements.

### P2-073 — Investment assist design
- **Goal:** Scenario coach bound to finance tools.
- **Deliverables:** UX + prompt governance.
- **Validation:** Forbidden-claim tests defined.

### P2-074 — AI provider adapter design
- **Goal:** Swappable provider; timeouts; fallback.
- **Deliverables:** Adapter contract.
- **Validation:** Kill switch design.

### P2-075 — Implement recommend MVP
- **Goal:** Similar rail on property detail.
- **Deliverables:** Flagged feature.
- **Validation:** Eval sample PASS; latency budget.

### P2-076 — Implement investment assist MVP
- **Goal:** Assist session with disclaimer ACK.
- **Deliverables:** Tool page + session.
- **Validation:** Claim scanner PASS; i18n.

### P2-077 — M7 validation gate
- **Goal:** Milestone acceptance.
- **Deliverables:** M7 report.
- **Validation:** §M7 criteria.

---

## M8 — Analytics expansion, multilingual growth & release

### P2-080 — Analytics taxonomy expansion
- **Goal:** Cover leads, partners, map, tools, AI.
- **Deliverables:** Taxonomy doc update plan.
- **Validation:** Consent mapping complete.

### P2-081 — Implement expanded analytics events
- **Goal:** Ship events behind consent.
- **Deliverables:** Event instrumentation.
- **Validation:** Test harness PASS.

### P2-082 — Multilingual growth evaluation
- **Goal:** Assess locale #4 feasibility; improve EN/ZH/TH gaps.
- **Deliverables:** Evaluation report + Phase 1 P3 i18n intake.
- **Validation:** No new locale without Owner GO.

### P2-083 — Admin/ops i18n policy decision
- **Goal:** Keep EN-first or expand.
- **Deliverables:** Decision record.
- **Validation:** Owner sign-off.

### P2-084 — Phase 2 RC hardening
- **Goal:** Perf/a11y/SEO/security regression.
- **Deliverables:** RC audit reports.
- **Validation:** Gate suite green.

### P2-085 — Phase 2 release candidate packaging
- **Goal:** Notes, changelog, rollback.
- **Deliverables:** Release package drafts.
- **Validation:** Matches `PHASE2_RELEASE_PLAN.md`.

### P2-086 — Production release for Phase 2 train
- **Goal:** Controlled production cutover of flagged features.
- **Deliverables:** Deploy under release plan.
- **Validation:** Prod smoke + feature flag verification.

### P2-087 — Phase 2 closure report
- **Goal:** Record outcomes vs acceptance.
- **Deliverables:** Closure report.
- **Validation:** Decision RELEASED or WAIVED items listed.

---

## Optional hardening (Phase 1 residuals — not milestone-critical)

### P2-090 — Media/LCP sparse listing hardening
### P2-091 — Turbopack NFT warning investigation
### P2-092 — Favorites sitemap policy revisit
### P2-093 — LoadingState / breadcrumb i18n defaults
### P2-094 — CI bundle-size budget file

---

## Task count summary

| Bucket | Task IDs | Count |
| --- | --- | --- |
| M0 | P2-001–008 | 8 |
| M1 | P2-010–019 | 10 |
| M2 | P2-020–030 | 11 |
| M3 | P2-031–038 | 8 |
| M4 | P2-040–046 | 7 |
| M5 | P2-050–056 | 7 |
| M6 | P2-060–065 | 6 |
| M7 | P2-070–077 | 8 |
| M8 | P2-080–087 | 8 |
| Optional | P2-090–094 | 5 |
| **Total** | | **78** |

Numbered gaps (e.g. P2-009, P2-039) reserved for scope addenda.
