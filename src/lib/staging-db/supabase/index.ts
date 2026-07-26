/**
 * Public exports for staging supabase adapters (server/CLI only).
 */

export {
  readStagingEnv,
  assertControlledCommitAllowed,
  assertStagingClientMayConnect,
  envCheckReport,
  checkSupabaseUrlHost,
  checkDatabaseHost,
} from "./environment.ts";
export type {
  StagingEnvSnapshot,
  ControlledCommitGateInput,
  HostCheckResult,
} from "./environment.ts";

export {
  checkStagingPoolerUrl,
  poolerChecksOk,
  resolveStagingPgConnection,
  describeStagingPgConnection,
} from "./connection.ts";
export type {
  StagingPgConnection,
  DatabaseConnectionMode,
  PoolerCheckBundle,
} from "./connection.ts";

export {
  resolveStagingMigrationConnection,
  describeMigrationConnection,
} from "./migration-connection.ts";

export {
  EXPECTED_STAGING_MIGRATIONS,
  EXPECTED_STAGING_TABLES,
  FROZEN_STAGING_MIGRATIONS_V1,
  PHASE_A_DECISION_TABLES,
  PHASE_A_ROLLBACK_SQL_REL,
  assertMigrateGates,
  listMigrationFiles,
  applyStagingMigrations,
} from "./migrate.ts";

export { verifyStagingSchema } from "./schema-verify.ts";
export { runStagingRlsLive } from "./rls-live.ts";

export {
  COMMIT_RPC_PHASE2_SQL_REL,
  assertCommitRpcPhase2Gates,
  applyCommitRpcPhase2,
} from "./commit-rpc-phase2.ts";
export type { CommitRpcPhase2ApplyResult } from "./commit-rpc-phase2.ts";

export {
  STAGING_PROJECT_NAME,
  findExactStagingProjects,
  rejectProductionProject,
  buildSessionPoolerUri,
  summarizePoolerBuild,
  extractPasswordFromDatabaseUrl,
  atomicWriteEnvFile,
  isPathGitIgnored,
  assertApiKeyShape,
  candidateSessionPoolerHosts,
  redactSecretsFromText,
  parseEnvFile,
  serializeEnvFile,
  BOOTSTRAP_ENV_ORDER,
  maskRef,
} from "./bootstrap.ts";

export {
  createStagingServiceClient,
  stagingClientConnectAllowed,
  describeStagingClientAvailability,
} from "./client.ts";
export type { StagingSupabaseClients } from "./client.ts";

export {
  executeControlledStagingCommit,
  executeStagingRollback,
  simulateCommitRpcResult,
  buildRollbackToken,
} from "./transaction-adapter.ts";
export type {
  StagingCommitRpcResult,
  StagingRollbackRpcResult,
} from "./transaction-adapter.ts";

export {
  insertImportSession,
  insertDeveloper,
  insertProject,
  insertAsset,
  insertPdf,
  insertNews,
  insertReviewItem,
  appendAuditEvent,
  assertNoClientSideMultiInsertTransaction,
} from "./repositories.ts";

export { runStagingEmptyDbProbe } from "./probe.ts";
export type { StagingProbeResult } from "./probe.ts";

export { insertImportSession as importSessionRepositoryInsert } from "./import-session-repository.ts";
export { insertDeveloper as developerRepositoryInsert } from "./developer-repository.ts";
export { insertProject as projectRepositoryInsert } from "./project-repository.ts";
export { insertAsset as assetRepositoryInsert } from "./asset-repository.ts";
export { insertPdf as pdfRepositoryInsert } from "./pdf-repository.ts";
export { insertNews as newsRepositoryInsert } from "./news-repository.ts";
export { insertReviewItem as reviewRepositoryInsert } from "./review-repository.ts";
export { appendAuditEvent as auditRepositoryAppend } from "./audit-repository.ts";

export {
  SupabaseDecisionRepository,
  createDecisionDraft,
  findDecisionById,
  listDecisions,
} from "./decision-repository.ts";
