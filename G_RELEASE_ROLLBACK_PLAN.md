# G-RELEASE — Rollback Plan

**Gate:** G-RELEASE  
**Document ID:** GREL-ROLLBACK-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## Phase 1 local RC rollback

| Scenario | Action |
| --- | --- |
| Gate failure during P1-36 | Stop; reopen smallest failing task; do not record GO |
| Bad content copy | Archive content status; remove from index; re-run content-editorial |
| Analytics regression | Deny consent path + fake adapter; disable measurement ID |
| Accidental production change | Out of Phase 1 scope — ops rollback under separate runbook |

## Note

Because Phase 1 forbids deploy, primary rollback is **local working-tree / task reopen**, not production revert.

## Approval

**APPROVED** under decision **GREL-D-007**.
