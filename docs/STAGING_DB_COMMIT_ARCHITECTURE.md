# Staging DB Commit Architecture

**Milestone:** STAGING_DB_COMMIT_DESIGN_V1
**Status:** Design + in-memory simulation only
**Writes:** DATABASE_WRITES=0 · STORAGE_UPLOADS=0

## Purpose

Define how Goth / Windows01 batch import results commit into an isolated **Staging** database — without touching Production.

## Layers

1. **Adapter / Review Console** (existing) — normalize + review candidates
2. **Staging DB Design** (`src/lib/staging-db/`) — commit plan, simulation, guards
3. **SQL Drafts** (`database-design/staging-import-v1/`) — schema proposal (not applied)
4. **Future Implementation** — real staging commit (blocked)

## Commit flow (design)

```
Review Console JSON
  → Commit Plan (WOULD_*)
  → In-memory Mock Repository transaction
  → Simulation result (READY_FOR_COMMIT)
  → Rollback Plan (dry-run)
  ✗ Real COMMIT (STAGING_COMMIT_DISABLED)
```

## Hard rules

- Staging physically/logically isolated from Production
- Every row binds `import_session_id`, `source_batch_id`, `source_job_id`, `source_record_id`
- Writes are idempotent and soft-delete rollbackable
- Automation ceiling: `READY_FOR_APPROVAL` / session `READY_FOR_COMMIT`
- `APPROVED` requires human Approver (separate from Reviewer)
- Storage upload plan is decoupled from DB commit
- Production hard block is code-enforced

## Module map

See `src/lib/staging-db/index.ts` exports.
