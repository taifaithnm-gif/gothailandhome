# Staging DB Rollback Model

## Strategy

Soft-delete by `import_session_id`.

## Guarantees

- Preserve `staging_audit_events` (append-only)
- Preserve source batch / zip hash references
- Cancel pending storage plans
- Refuse rollback after production publication (future gate)
- Dry-run rollback simulation supported

## This milestone

`rollback-plan.json` only. **No real rollback execution.**
