# Staging DB Transaction Model

Default mode: **`batch_atomic_transaction`**.

Optional future mode: `entity_group_transaction` (not default).

## Phase order

1. BEGIN
2. insert import_session
3. insert developers
4. insert projects
5. insert assets
6. insert pdfs
7. insert news
8. insert review_items
9. insert duplicates
10. insert conflicts
11. insert audit_events
12. update import_session status
13. COMMIT

Any failure → **ROLLBACK**. No partial commit.

## Simulation

`runSimulatedBatchTransaction` uses an in-memory checkpoint.
Even on success, `committed: false` and `databaseWrites: 0`.
