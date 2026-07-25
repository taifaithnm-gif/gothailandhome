# STAGING_DB_TRANSACTION_AUDIT

- Default: `batch_atomic_transaction`
- Optional documented: `entity_group_transaction`
- Failure → simulated ROLLBACK, `partialCommit=false`
- Success simulation still `committed=false`, `databaseWrites=0`
- Real commit throws `STAGING_COMMIT_DISABLED`

**Verdict: PASS**
