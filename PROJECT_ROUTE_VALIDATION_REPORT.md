# PROJECT_ROUTE_VALIDATION_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.5 — Project Detail Alpha  
**Base URL:** `http://127.0.0.1:3020` (`next start` after production build)

## Result

| Metric | Value |
|--------|-------|
| Expected packages | 50 |
| Checked | 50 |
| Non-500 (OK) | **50/50** |
| Failures | 0 |
| Checked at | 2026-07-15T16:06:29.762Z |

Command: `BASE_URL=http://127.0.0.1:3020 npm run test:project-routes`

Artifact: `pipelines/factory/overnight/_runs/project-route-check.json` (local run output; not required for merge).

## Sample HTML sizes

| Project | Status | Bytes |
|---------|--------|-------|
| 168-sukhothai-residences | 200 | 99,591 |
| ashton-asoke | 200 | 182,117 |
| the-livin-ramkhamhaeng | 200 | 185,661 |

All 50 routes returned HTTP 200 with no `name.en` crash signatures.

## Overall

# PASS — 50/50 project routes
