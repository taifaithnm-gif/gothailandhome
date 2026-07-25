# Staging Storage Upload Plan

Storage is **decoupled** from DB commit.

## This milestone

- Produce `storage-plan.json` only
- `storage_status`: `NOT_PLANNED` | `PLANNED`
- Actions: `WOULD_UPLOAD` | `WOULD_SKIP_DUPLICATE` | `WOULD_QUARANTINE` | `WOULD_REVIEW`
- **Never** `UPLOADED`
- `STORAGE_UPLOADS=0`

## Path rules

- Relative only
- No traversal
- `staging/{batch_id}/{entity_type}/{entity_id}/{sanitized_filename}`
- Extension preserved
- Collision avoided via entity_id segment
