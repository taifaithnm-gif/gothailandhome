# VALIDATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.3 — Search Results Alpha

## Baseline verification

| Check | Result |
|-------|--------|
| Repository root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| Pre-work HEAD | `7c2ae6510e0221dc766e3ccd325ae642cb6715a7` |
| Working tree before changes | Clean |
| `origin/main` sync | 0 ahead / 0 behind |

## Gates

| Gate | Result |
|------|--------|
| TypeScript | PASS |
| Lint | PASS (0 errors; pre-existing pipeline warnings) |
| Tests (incl. pagination + listing-search) | PASS |
| Production build | PASS |
| Listing integrity n=1315 | PASS |
| Contact-role / Apple invariants | PASS |
| Route smoke `/en|/zh|/th/properties` | PASS HTTP 200 |
| Buy / Rent / filtered query smoke | PASS |
| `/search` → `/properties` redirect | PASS 307 |
| Result card bound (24) | PASS |
| Multilingual | PASS |
| Mobile drawer + clear-all | PASS (markup + a11y controls) |
| Lighthouse a11y | **0.98** (≥ 0.95) |
| Lighthouse performance | **0.80** (near baseline 0.87) |
| CLS | **0** |
| HTML size | **~0.286 MB** (no multi-MB regression) |
| Harvest / listing mutations / deploy | None |

## Overall

# PASS
