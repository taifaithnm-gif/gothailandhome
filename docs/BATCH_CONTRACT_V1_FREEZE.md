# BATCH_CONTRACT_V1 Freeze

**Authority:** sealed digest (not naive raw ZIP sha256sum alone).

Constants:

- `BATCH_CONTRACT_V1`
- `goth_batch_manifest.v1` (`GOTH_BATCH_MANIFEST_SCHEMA_V1`)
- `goth_export_contract.v1`

Central file: `src/lib/integrations/windows01/contract-versions.ts`

Required checks: sidecar agreement, member count, inventory membership, SHA256SUMS, path traversal/symlink/absolute path rejection, size/ratio limits, case-collision rejection.
