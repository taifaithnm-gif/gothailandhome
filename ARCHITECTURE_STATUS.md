# Architecture Status

**Date:** 2026-07-26  
**Review Infrastructure:** `FEATURE_FREEZE` (V1)  
**Prior architecture freeze:** `ARCHITECTURE_FREEZE_V1` (still in force for contract / naming / production hard block)  
**Baseline:** `STAGING_BASELINE_V1`  
**Product mode:** `CONTENT_FIRST`

---

## Layers (current)

| Layer | Location | Freeze state |
| --- | --- | --- |
| Windows01 Contract | `src/lib/integrations/windows01/` | Frozen |
| Goth Batch Adapter | `src/lib/staging-import/adapters/` | Frozen |
| Staging Import Core | `src/lib/staging-import/` | Frozen |
| Review Console | `src/lib/review-console/`, `src/app/internal/` | Frozen |
| Staging DB + RLS + RPC | `src/lib/staging-db/`, `database/staging-migrations/` | Frozen through `012` |
| Phase A Decision skeleton | decision types / mock + supabase draft repo | Frozen (no service) |
| Decision Service / API / UI | — | **DEFERRED** |
| Approval / Publish / Production cutover | — | **BLOCKED** |

---

## Dependency direction (unchanged)

L1 ← L2 ← L3; L4 reads freeze artifacts / Staging DB browse; L5 commit path is Staging-only with gates.

No new platform architecture may be introduced while `CONTENT_FIRST` is active.

---

## Safety invariants

- Automation ceiling: `READY_FOR_APPROVAL`
- Forbidden states for automation/mutation: `APPROVED`, `READY_FOR_PRODUCTION`, `PUBLISHED`
- `STAGING_COMMIT_ENABLED` default false for migration apply
- Production write hard block
- Storage upload disabled
- Review Console feature flag default OFF

---

## Next architecture work

None for Review Workflow.

Next product work is content and SEO only. Reopening Review Workflow requires an explicit milestone after `CONTENT_FIRST` priorities — see deferred backlog.
