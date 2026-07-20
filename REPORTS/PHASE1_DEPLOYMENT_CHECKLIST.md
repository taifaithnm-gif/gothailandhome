# Phase 1 Deployment Checklist

**Product:** GoThailandHome Phase 1  
**Version target:** `v1.0.0-rc1` (or Owner-approved `v1.0.0`)  
**Date:** 2026-07-20  
**Prerequisite:** Engineering RC = GO WITH MINOR ISSUES; quality gates PASS

This checklist prepares production cutover. Completing this document does **not** by itself authorize deploy — Owner sign-off required on each gate.

---

## Pre-deploy

| # | Check | Owner | Done |
| --- | --- | --- | --- |
| 1 | `npm run typecheck` PASS on release commit | Eng | ☐ |
| 2 | `npm run lint` PASS | Eng | ☐ |
| 3 | `npm test` PASS | Eng | ☐ |
| 4 | `npm run build` PASS | Eng | ☐ |
| 5 | Tag/release notes reviewed (`RELEASES/Phase1/PHASE1_RELEASE_NOTES.md`) | Owner | ☐ |
| 6 | Changelog reviewed (`CHANGELOG_PHASE1.md`) | Owner | ☐ |
| 7 | Production env vars present (Supabase URL/anon, site URL) — **no secrets in git** | Ops | ☐ |
| 8 | Analytics IDs configured only if G-ANALYTICS go-live approved; else leave inert | Owner | ☐ |
| 9 | DNS / CDN / hosting target confirmed | Ops | ☐ |
| 10 | Backup / rollback path documented | Ops | ☐ |
| 11 | Known P2/P3 residuals accepted for go-live | Owner | ☐ |
| 12 | `PRODUCTION_ACCEPTANCE_CHECKLIST.md` assigned | QA/Owner | ☐ |

---

## Deploy

| # | Step | Done |
| --- | --- | --- |
| 1 | Create annotated git tag for approved version | ☐ |
| 2 | Build production artifact from exact tagged commit | ☐ |
| 3 | Deploy artifact to staging first (recommended) | ☐ |
| 4 | Smoke staging against Production Acceptance Checklist (subset) | ☐ |
| 5 | Promote to production hosting | ☐ |
| 6 | Confirm `robots.txt` and `sitemap.xml` reachable | ☐ |
| 7 | Confirm locale roots `/en` `/zh` `/th` respond 200 | ☐ |

**Do not** enable Windows01, live collectors, OCR, or embeddings as part of this deploy.

---

## Post-deploy

| # | Check | Done |
| --- | --- | --- |
| 1 | Homepage EN/ZH/TH loads | ☐ |
| 2 | Listing search + one property detail | ☐ |
| 3 | One project / developer / district detail | ☐ |
| 4 | Knowledge, blog, FAQ, investment, legal routes | ☐ |
| 5 | Contact / Find My Home submit → success path (non-prod payload OK) | ☐ |
| 6 | Favorites / compare local persistence | ☐ |
| 7 | Consent banner appears; no analytics network before consent | ☐ |
| 8 | Search Console / sitemap submit (if authorized) | ☐ |
| 9 | Error monitoring / uptime check enabled | ☐ |
| 10 | Record deploy time, tag, and operator in ops log | ☐ |

---

## Rollback

| # | Action | Done |
| --- | --- | --- |
| 1 | Identify last known-good tag/artifact | ☐ |
| 2 | Redeploy previous artifact without schema destructive changes | ☐ |
| 3 | Verify homepage + listings + contact smoke | ☐ |
| 4 | Announce rollback; file incident note | ☐ |
| 5 | Do not “hotfix invent” catalog facts during rollback | ☐ |

Phase 1 catalog reads are additive-compatible with existing Supabase spine; avoid running unrelated migrations during emergency rollback.

---

## Smoke Test (minimum)

```text
/[lang]                          Homepage
/[lang]/properties               Listings
/[lang]/properties/[id]          Property
/[lang]/projects/[slug]          Project
/[lang]/developers/[slug]        Developer
/[lang]/districts/[slug]         District
/[lang]/favorites                Favorites
/[lang]/compare                  Compare
/[lang]/knowledge                Knowledge hub
/[lang]/blog                     Blog
/[lang]/knowledge/investment     Investment guide
/[lang]/knowledge/legal          Legal guide
/[lang]/faq                      FAQ
/[lang]/contact                  Contact
/[lang]/marketplace              Marketplace hub
/robots.txt  /sitemap.xml         SEO entrypoints
```

Run for at least **en** and spot-check **zh** + **th**.

---

## Monitoring

| Signal | Target |
| --- | --- |
| Uptime / 5xx rate | Alert on sustained elevation |
| Build/deploy failures | Notify Eng |
| Consent / analytics errors | Must not break pages |
| NFT / build warnings | Track; non-blocking if pre-accepted |
| Lead form failure rate | Watch error page volume |

---

## Sign-off

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Engineering | | | |
| Owner | | | |
| Ops | | | |

**Phase 2 must not start from this checklist.**
