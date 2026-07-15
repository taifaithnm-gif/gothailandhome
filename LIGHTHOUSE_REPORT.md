# LIGHTHOUSE_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.2 — Homepage Alpha  
**Tool:** lighthouse@12.2.1  
**URL:** `http://127.0.0.1:3001/en`  
**Form factor:** mobile  
**Categories:** performance, accessibility  

## Scores

| Category | Score |
|----------|------:|
| Performance | **0.75** |
| Accessibility | **1.00** |

## Core metrics

| Metric | Value |
|--------|-------|
| LCP | 5.1 s |
| FCP | 3.2 s |
| Speed Index | 3.2 s |
| Total Blocking Time | 10 ms |

## Accessibility binary fails

| Audit | Notes |
|-------|-------|
| `bf-cache` | Browser BF-cache note; not treated as product a11y blocker |

No other binary a11y failures reported (score 1.00).

## Baseline comparison

| Route | Perf | A11y | Context |
|-------|-----:|-----:|---------|
| `/en/properties` (UI Foundation) | 0.87 | 0.99 | Prior baseline |
| `/en` (Homepage Alpha) | 0.75 | 1.00 | This milestone |

Homepage is not a regression of the properties result page; it is a denser marketing surface. Bounded data fetches keep HTML payload practical (~443 KB gzipped transfer on probe).

## Evidence files

- `pipelines/factory/overnight/_runs/homepage-lighthouse.json`
- `pipelines/factory/overnight/_runs/homepage-lighthouse-summary.json`

## Verdict

Accessibility **PASS**. Performance **acceptable for Alpha homepage** with documented backlog for LCP/fonts; no listing harvest or page-type redesign required to close this gate.
