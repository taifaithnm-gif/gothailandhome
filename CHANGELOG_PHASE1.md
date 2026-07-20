# Changelog — Phase 1

**Product:** GoThailandHome  
**Scope:** Phase 1 business website (P0 + P1-01–P1-36)  
**Date:** 2026-07-20  
**Official version:** `v1.0.0`  
**Production:** https://www.gothailandhome.com (`dpl_DfkmRL3SVzf1vwRedJhF1wVFqxg5`) — PRODUCTION GO  
**Engineering RC:** GO WITH MINOR ISSUES (P0=0, P1=0)

All entries summarize delivered capability. Implementation details live in `P1_TASK_*_COMPLETION_REPORT.md` and Phase 1 planning docs.

---

## P0 — Engineering stabilization

- Accepted P0 final engineering baseline for website work.
- Established local quality gate policy (`typecheck` / `lint` / `test` / `build`).
- Confirmed Phase 1 excludes Windows01 runtime, live collector expansion, OCR, and embeddings.

---

## M1 — Resilient foundation (P1-01–P1-04)

- **P1-01** Contact / role invariants (platform CS vs listing contacts).
- **P1-02** Accessibility baseline contracts across core routes.
- **P1-03** Responsive viewport matrix (375 / 768 / 1280).
- **P1-04** Navigation & locale chrome (shared IA, language switch, active states).

---

## M2 — Discovery conversion (P1-05–P1-14)

- **P1-05** Homepage conversion hierarchy and CTAs.
- **P1-06–P1-08** Listing search state, filters, results/sort/pagination/empty states.
- **P1-09** Property card decision fields and media frame.
- **P1-10–P1-11** Property detail trust/inquiry hierarchy; gallery/media resilience.
- **P1-12–P1-14** Project, developer, and district detail decision flows.

---

## M3 — Engagement and inquiry (P1-15–P1-21)

- **P1-15–P1-16** Favorites state contract + UI/page (local device).
- **P1-17–P1-18** Compare selection contract + comparison page/controls.
- **P1-19** Contact / marketplace form reliability.
- **P1-20** Contextual inquiry handoff (allowlisted public identifiers).
- **P1-21** Contact & marketplace journey consolidation (hub-first IA).

---

## M4 — Static content product (P1-22–P1-28)

- **P1-22** Filesystem-scoped static content schema/loader.
- **P1-23** Knowledge article index/detail routes.
- **P1-24** Blog index/detail routes.
- **P1-25** Investment guide surface (G-INVESTMENT).
- **P1-26** Legal guide surface (G-LEGAL).
- **P1-27** FAQ hub.
- **P1-28** Static CMS / editorial validation command.

---

## M5 — SEO and frontend measurement (P1-29–P1-32)

- **P1-29** Content metadata, schema, and sitemap integration.
- **P1-30** Internal linking and breadcrumb completion.
- **P1-31** Consent-aware analytics bootstrap.
- **P1-32** Frontend event taxonomy and instrumentation.

---

## M6 — Hardening and acceptance (P1-33–P1-36)

- **P1-33** Cross-route accessibility remediation (0 critical/serious on agreed matrix).
- **P1-34** Cross-route responsive remediation.
- **P1-35** Performance and media budget pass.
- **P1-36** Phase 1 release-candidate acceptance + governance confirmation.

---

## RC polish (post-acceptance audit)

- Robots disallow expanded to include `/leads`.
- Localized primary navigation landmark (`dict.nav.primary`).
- Sitemap policy comment clarified (favorites vs compare).
- RC audit reports under `REPORTS/PHASE1_*`.

## Production release (`v1.0.0`)

- Deployed via existing Vercel production workflow (`vercel --prod`).
- Production acceptance smoke PASS → **PRODUCTION GO**.
- Official annotated tag `v1.0.0` on `main`.

---

## Not in Phase 1

- Phase 2 product scope (not started).
- Data Factory / Windows01 execution runtime (docs-only planning may exist; not runtime).
- OCR, embeddings, autonomous collectors.
