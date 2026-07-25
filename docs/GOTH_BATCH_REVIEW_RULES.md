# Goth Batch Review Rules

## Allowed review states (automation)

- RECEIVED
- VALIDATED
- REVIEW_REQUIRED
- CONFLICT
- DUPLICATE
- READY_FOR_APPROVAL
- REJECTED
- QUARANTINED

## Forbidden (automation)

- APPROVED
- READY_FOR_PRODUCTION
- PUBLISHED

Ceiling: **READY_FOR_APPROVAL**

## Source reason → mapped state

| Source reason | Mapped state |
| --- | --- |
| `*DUPLICATE*` | DUPLICATE |
| `*CONFLICT*` / `PROVINCE_NAME_CONFLICT` | CONFLICT |
| `*REJECT*` / malicious / forbidden | REJECTED |
| `*QUARANTINE*` / safety | QUARANTINED |
| `*LOW_CONFIDENCE*` / `*FAILED*` / `IMAGE_FETCH_FAILED` | REVIEW_REQUIRED |

## Entity rules

- UNKNOWN developer → REVIEW_REQUIRED; stable `candidate-dev-*` IDs; never merge unknowns
- LOW province confidence → REVIEW_REQUIRED
- Province conflict → CONFLICT
- Image missing/sha mismatch → REJECTED; tracking/placeholder → QUARANTINED; dup hash → DUPLICATE
- PDF HTML-disguised / bad magic → REJECTED
- News missing published date / stale → REVIEW_REQUIRED; dup URL/title → DUPLICATE

## Preview actions only

`WOULD_CREATE | WOULD_UPDATE | WOULD_REVIEW | WOULD_REJECT | WOULD_DUPLICATE | WOULD_QUARANTINE | WOULD_SKIP_DUPLICATE`

Never emit CREATE / UPDATE / APPROVE / PUBLISH / INSERT / UPSERT / DELETE.
