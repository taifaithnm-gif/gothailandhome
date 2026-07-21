# P2-002 — Production Baseline Checklist

**Date:** 2026-07-21
**Goal:** Confirm `v1.0.0` health before Phase 2A build

---

## Rollback pin

| Field | Value |
| --- | --- |
| Tag | `v1.0.0` |
| Commit | `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e` |
| Production URL | https://www.gothailandhome.com |

## Smoke results (2026-07-21)

| Surface | HTTP | Result |
| --- | --- | --- |
| `/en` | 200 | PASS |
| `/robots.txt` | 200 | PASS |
| `/en/properties` | 200 | PASS |

## Validation

- Prod smoke: **PASS**
- Tag `v1.0.0` verified: **PASS**
