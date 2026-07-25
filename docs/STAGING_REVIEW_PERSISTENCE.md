# Staging Review Persistence

## Automation ceiling

Highest automation / commit-plan review state: **`READY_FOR_APPROVAL`**.

Forbidden in commit automation: `APPROVED`, `READY_FOR_PRODUCTION`, `PUBLISHED`.

## Reviewer actions (allowed design)

- Add note
- Mark duplicate
- Mark conflict
- Reject
- Quarantine
- Mark ready for approval

## Approver (separate role)

- Approve
- Ready for production

Must **not** be the same one-click action as review.
Approver actions are blocked in Design V1.
