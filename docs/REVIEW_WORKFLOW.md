# Review Workflow

**Framework:** Staging Import Framework V1
**Source:** `src/lib/staging-import/approval-state.ts`, `review-mapper.ts`

## States

```
RECEIVED
  → VALIDATED
  → REVIEW_REQUIRED
  → CONFLICT
  → DUPLICATE
  → READY_FOR_APPROVAL
  → APPROVED                 (human-only / future)
  → READY_FOR_PRODUCTION     (future)
  → PUBLISHED                (future)
```

## V1 ceiling

Automation may advance at most to **READY_FOR_APPROVAL**.

Forbidden for automation:

- `APPROVED`
- `READY_FOR_PRODUCTION`
- `PUBLISHED`

## Review queues

| Queue | When |
| --- | --- |
| `review` | `WOULD_REVIEW` / general review required |
| `duplicate` | Duplicate / skip-duplicate |
| `conflict` | `CONFLICT` state |
| `ready` | `READY_FOR_APPROVAL` |
| `reject` | `WOULD_REJECT` |
| `quarantine` | `WOULD_QUARANTINE` |

## Rules

1. Never auto-approve.
2. Evidence and UNKNOWN developers always route to review when confidence is low.
3. Duplicate hits produce `WOULD_SKIP_DUPLICATE` — never merge.
4. Workers / CLI cannot jump to publish states.
