# Batch001 Phase2 — Empty V1 Session Replacement Plan

**Milestone:** `BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT` (design only)  
**Next action candidate:** `REPLACE_EMPTY_V1_SESSION_WITH_PHASE2_COMMIT`  
**This run executes:** NONE of the steps below

## Current state

| Item | Value |
| --- | --- |
| Old session | `sess_3465132f7da014513da1d0a2` |
| Status | `COMMITTED` (entity rows = 0) |
| Phase2 artifact | READY (`9d31bf8b5bca…f723d562`) |
| Phase2 session id (artifact) | `sess_p2_fbda6bfdbeb462c00f25f88f` |

## Empty-window risk

Rolling back the empty V1 session before a successful Phase2 commit creates a window with **no Batch001 session**. If commit then fails, Batch001 has neither V1 envelope nor Phase2 entities.

Mitigation: **single orchestrated command** with no human pause between rollback and commit.

## Proposed command (design only — DO NOT RUN this milestone)

`staging:batch:replace-empty-v1-session-with-phase2`

Orchestration order:

1. Read-only preflight (env / probe / schema / RLS / migration audit / Production hard block)
2. Verify Phase2 artifact hash == sidecar; sealed digest still `d709a72c2ff8…80ec6786`
3. Verify old session still entity-empty (`developers…conflicts = 0`)
4. Lock Batch ID + Artifact hash in process memory
5. One-shot `STAGING_COMMIT_ENABLED=true` (process env only; never rewrite `.env.staging.local`)
6. Rollback `sess_3465132f7da014513da1d0a2` (token derived, never printed full)
7. **Immediately** execute Controlled Commit with Phase2 artifact payload
8. Authoritative `SELECT COUNT(*)` vs payload counts
9. On failure after rollback: emit `RECOVERY_STATE` (old session ROLLED_BACK / new session absent or partial) and stop — no auto-retry without human gate

## Status vocabulary for that future run

| Situation | Status |
| --- | --- |
| Upstream gate blocked step | `NOT_RUN` / `SKIPPED` |
| Step not applicable | `NOT_VERIFIED` |
| Cryptographic / schema / DB mismatch | `FAIL` |
| Digests verified even if commit skipped | `VERIFIED` / `PASS` (not FAIL) |

## Explicit non-goals this milestone

- No rollback of old session
- No Controlled Commit
- No DB writes
- No approval / publish / Production
