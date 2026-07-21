# Phase 2 — Release Plan

**Status:** Planning only
**Baseline pin:** Git tag `v1.0.0`
**Date:** 2026-07-21

---

## 1. Release philosophy

Phase 2 ships as a **train of incremental, flagged releases**, not a single big-bang rewrite. Each production cut must preserve Phase 1 discovery/inquiry/content quality.

---

## 2. Release trains

| Train | Content | Prod posture |
| --- | --- | --- |
| **T0** | M0 process only | No product change |
| **T1** | M1 customer accounts (flagged) | Dark → beta → GA |
| **T2** | M2 leads/CRM/notify | Staff first; CRM credentials Owner-gated |
| **T3** | M3 acquisition | Internal → limited partners |
| **T4** | M4 partner portals | Invite-only |
| **T5** | M5 map | Soft launch |
| **T6** | M6 tools | Public flagged |
| **T7** | M7 AI | Internal → % → GA |
| **T8** | M8 analytics + Phase 2 RC bundle | Measurement + hardening |
| **T9** | Phase 2 official version tag | Owner-named (e.g. `v1.1.0` / `v2.0.0` — decide at M8) |

Version number for Phase 2 completion is an **Owner decision at M8** (minor vs major).

---

## 3. Environments

| Env | Purpose |
| --- | --- |
| Local / CI | Unit + contract tests |
| Preview | PR Vercel previews |
| Staging (recommended) | CRM/AI integration with synthetic data |
| Production | Flag-controlled exposure |

Do not test CRM webhooks solely in production.

---

## 4. Quality gates (every production-bound increment)

Must PASS before promote:

1. `typecheck` · `lint` · `test` · `build`
2. Targeted contract tests for touched domain
3. i18n key parity for customer-facing changes
4. a11y smoke for new interactive UI
5. SEO robots/sitemap checks when routes change
6. Security checklist subset (authZ/IDOR for new APIs)
7. Feature flag default-safe in production

---

## 5. Deployment rules

- Prefer git-based production deploys from `main` after Phase 1 finalization pattern.
- No force-push; no moving `v1.0.0`.
- No production env var changes without Owner ops checklist.
- Schema migrations (when separately authorized) require expand/contract and rollback notes.
- AI/CRM secrets only in server env; never client.

---

## 6. Rollback

| Layer | Action |
| --- | --- |
| Feature | Disable flag immediately |
| Deploy | Instant rollback / promote prior Ready deployment in Vercel |
| Data | Prefer compensating actions; avoid destructive down-migrations |
| Git pin | `v1.0.0` remains ultimate Phase 1 safe pin |

Rollback runbooks must be linked in each train’s release notes.

---

## 7. Communication

| Audience | When |
| --- | --- |
| Owner | Gate decisions GO/NO-GO |
| Ops/CS | Before lead inbox / CRM go-live |
| Partners | Before portal invites |
| Customers | Before GA of accounts/alerts/AI |

---

## 8. Release package artifacts (per train)

- Changelog excerpt
- Feature flag matrix
- Smoke checklist (prod)
- Known P2/P3 residuals
- Rollback reference
- Decision: GO / GO WITH WAIVERS / NO-GO

Final Phase 2 closure mirrors Phase 1 closure discipline (`REPORTS/` style) when implementation exists — not created in this planning task beyond this plan.

---

## 9. Relationship to Phase 1 deployment policy docs

Historical Phase 1 docs may state “no Phase 1 deploy.” Phase 1 is already LIVE. Phase 2 follows this release plan and Owner ops authority; update conflicting policy docs in a **future docs task** if needed (not part of this package’s “modify existing files” ban during planning-only execution).

---

## 10. Exit criteria for “Phase 2 released”

See `PHASE2_ACCEPTANCE_CRITERIA.md` global section. Roughly: M1–M7 MVP capabilities flagged GA or explicitly waived; M8 analytics live; RC green; production healthy; residuals documented.
