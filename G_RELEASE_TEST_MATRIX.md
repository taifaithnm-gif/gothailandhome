# G-RELEASE — Test Matrix

**Gate:** G-RELEASE  
**Document ID:** GREL-TEST-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## Required matrices for P1-36

| Matrix | Command / evidence | Owner |
| --- | --- | --- |
| Engineering gates | `typecheck`, `lint`, `test`, `build` | Engineering |
| Accessibility | `test:accessibility` + P1-33 remediation suite | Engineering |
| Responsive | `test:responsive` + P1-34 remediation suite | Engineering |
| Performance / media | `test:seo-performance` + P1-35 budget suite | Engineering |
| Content / SEO | content-loader, content-seo, route-metadata | Engineering |
| Analytics consent | analytics-bootstrap, analytics-events | Engineering |
| Locale | EN/ZH/TH dictionaries + html lang contracts | Engineering |

## Locale coverage

Every public Phase 1 route family must have EN / ZH / TH dictionary keys and metadata contracts where applicable.

## Approval

**APPROVED** under decision **GREL-D-005**.
