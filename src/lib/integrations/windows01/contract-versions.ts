/**
 * Central Batch Contract version constants (BATCH_CONTRACT_V1 freeze).
 * Do not scatter hard-coded schema version strings across layers.
 */

export const BATCH_CONTRACT_V1 = "BATCH_CONTRACT_V1" as const;

export const GOTH_BATCH_MANIFEST_SCHEMA_V1 = "goth_batch_manifest.v1" as const;

export const GOTH_EXPORT_CONTRACT_V1 = "goth_export_contract.v1" as const;

export const SUPPORTED_GOTH_BATCH_SCHEMA_VERSIONS = [
  GOTH_BATCH_MANIFEST_SCHEMA_V1,
] as const;

export const SUPPORTED_GOTH_EXPORT_CONTRACT_VERSIONS = [
  GOTH_EXPORT_CONTRACT_V1,
] as const;

export type GothBatchManifestSchemaVersion =
  (typeof SUPPORTED_GOTH_BATCH_SCHEMA_VERSIONS)[number];
