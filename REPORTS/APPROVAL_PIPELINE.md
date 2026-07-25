# APPROVAL_PIPELINE

## Candidates

| Kind | Trigger |
| --- | --- |
| approval | READY_FOR_APPROVAL |
| review | WOULD_REVIEW / default |
| reject | WOULD_REJECT |
| quarantine | WOULD_QUARANTINE |
| duplicate | duplicate / skip-duplicate |

## Enforcement

- `approved: false` on every candidate
- `approveCandidate()` throws `ApprovalBlockedError`
- Automation cannot transition into APPROVED+

## Future

Human reviewer console will consume these candidates for Production-bound publish gating.
