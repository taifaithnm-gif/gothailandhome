# GOTH_BATCH001_REVIEW_CANDIDATES

**Batch:** BATCH-GTH-20260724-001

## Totals

| Metric | Count |
| --- | --- |
| Source Windows01 review items | 38 |
| Generated review candidates (source + entity) | 63 |
| CONFLICT candidates | 1 |
| DUPLICATE candidates | 0 |
| Ready-for-approval entity set | 14 |

## Source reason mix (Windows01)

| Reason | Count |
| --- | --- |
| IMAGE_FETCH_FAILED | 31 |
| PROVINCE_LOW_CONFIDENCE | 6 |
| PROVINCE_NAME_CONFLICT | 1 |

## Entity-derived highlights

- 5/5 developers → UNKNOWN identity → REVIEW_REQUIRED
- 6/10 projects → LOW province confidence
- 0 project-level provinceConflict flags (conflict present as source review item)
- Images 9/9 ACCEPT_CANDIDATE (local validation)
- PDFs 5/5 ACCEPT_CANDIDATE
- News 10/10 missing published_at → entity review REVIEW_REQUIRED (session may still WOULD_CREATE when URL valid)

## Automation ceiling

Highest automated state observed: **READY_FOR_APPROVAL**
APPROVED / READY_FOR_PRODUCTION / PUBLISHED: **0**
