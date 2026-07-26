# Review Infrastructure Deferred Backlog

**Status:** All items below are `DEFERRED`  
**Parent freeze:** `REVIEW_INFRASTRUCTURE_V1_FREEZE`  
**Date:** 2026-07-26  

Do **not** start these during `CONTENT_FIRST` sprints unless the freeze is explicitly reopened by a new milestone.

---

## DEFERRED — Review Workflow Phase B+

| Item | Status | Notes |
| --- | --- | --- |
| Decision Service | DEFERRED | No Submit / Apply / Reject / Rollback transitions |
| Decision API | DEFERRED | No HTTP routes |
| Decision UI | DEFERRED | No console decision panels |
| Workflow Engine | DEFERRED | No general workflow orchestration |
| Dual Approval | DEFERRED | No two-person rule implementation |
| Enterprise RBAC Extension | DEFERRED | Keep current five staging roles |
| Advanced Audit Timeline | DEFERRED | Append-only audit tables exist; no UI/timeline product |
| Decision Diff UI | DEFERRED | Field-level changes table exists; no UI |
| Rollback UI | DEFERRED | SQL rollback scripts only |
| Conflict Resolution Workflow | DEFERRED | Conflicts remain human browse + gate |
| Reviewer Collaboration | DEFERRED | No multi-reviewer product features |

---

## Explicitly blocked (not backlog work)

| Item | Status |
| --- | --- |
| Approval | DISABLED |
| Publish | DISABLED |
| Production cutover | BLOCKED |
| Production migration apply | FORBIDDEN |

---

## Reopen criteria (future)

Only after Content / SEO milestones explicitly schedule Review Workflow reopen, and only with:

1. New milestone name (not Phase B auto-start)
2. Staging-only gates preserved
3. Feature flags default OFF
4. No Production deploy in the same milestone
