# Approval Workflow

**Framework:** Staging Import Framework V1
**Source:** `src/lib/staging-import/approval-engine.ts`

## Purpose

Build **candidates** for a future human approval console:

- Approval Candidate (`READY_FOR_APPROVAL`)
- Review Candidate
- Reject Candidate
- Quarantine Candidate
- Duplicate Candidate

## V1 rules

| Action | Allowed? |
| --- | --- |
| Build candidates | Yes |
| Summarize candidates | Yes |
| True `approveCandidate()` | **No** — throws `ApprovalBlockedError` |
| Enter `APPROVED` state via automation | **No** |
| Publish | **No** |

Every candidate carries `approved: false`.

## Future Production use

A later milestone will:

1. Require authenticated human reviewer
2. Transition `READY_FOR_APPROVAL` → `APPROVED`
3. Gate staging → production publish separately

This document does **not** authorize Production import.
