# G-RELEASE — Release Checklist

**Gate:** G-RELEASE  
**Document ID:** GREL-CHECK-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## Pre-acceptance checklist

| # | Item | Required |
| ---: | --- | --- |
| 1 | All prior gates CLEARED (CONTENT, INVESTMENT, LEGAL, ANALYTICS, RELEASE) | Yes |
| 2 | P1-01–P1-35 complete or Owner-waived | Yes |
| 3 | `npm run typecheck` PASS | Yes |
| 4 | `npm run lint` PASS (0 errors) | Yes |
| 5 | `npm test` PASS | Yes |
| 6 | `npm run build` PASS | Yes |
| 7 | EN/ZH/TH locale parity on public routes | Yes |
| 8 | Accessibility matrix zero critical/serious | Yes |
| 9 | Responsive matrix pass | Yes |
| 10 | Performance/media budgets pass or documented | Yes |
| 11 | No prohibited Windows01 / live-source dependency | Yes |
| 12 | No production write / deploy performed by Phase 1 | Yes |

## Approval

**APPROVED** under decision **GREL-D-002**.
