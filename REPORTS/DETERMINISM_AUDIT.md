# Determinism Audit

Batch001 commit simulation run twice → identical `simulationResult` and idempotency keys.
IDs derived from content hashes (no Math.random / Date.now in key material).
`generatedAt` may vary in other pipelines but does not feed content hashes in staging-db simulator (fixed timestamp).

**Verdict:** PASS
