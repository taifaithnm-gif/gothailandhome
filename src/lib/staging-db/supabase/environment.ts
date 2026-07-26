/**
 * Staging-only environment resolution.
 * Never falls back to NEXT_PUBLIC_SUPABASE_* / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL.
 */

import { createHash } from "node:crypto";

import {
  ProductionWriteBlockedError,
  StagingCommitDisabledError,
  StagingEnvironmentBlockedError,
} from "../errors.ts";
import {
  assertProductionWriteBlocked,
  checkProductionWriteBlock,
} from "../environment-guard.ts";
import {
  checkStagingPoolerUrl,
  poolerChecksOk,
  type PoolerCheckBundle,
  type DatabaseConnectionMode,
} from "./connection.ts";

export type HostCheckResult = {
  status: "PASS" | "FAIL";
  reasons: string[];
};

export type StagingEnvSnapshot = {
  stagingImportEnabled: boolean;
  stagingCommitEnabled: boolean;
  stagingStorageUploadEnabled: boolean;
  stagingIntegrationTestEnabled: boolean;
  reviewerGateEnabled: boolean;
  environmentId: string | null;
  projectRef: string | null;
  allowedHost: string | null;
  allowedPoolerHost: string | null;
  supabaseUrl: string | null;
  databaseUrl: string | null;
  databasePoolerUrlPresent: boolean;
  anonKeyPresent: boolean;
  serviceRolePresent: boolean;
  anonKeyFingerprint: string | null;
  serviceRoleFingerprint: string | null;
  storageBucket: string;
  productionDetected: boolean;
  productionBlockReasons: string[];
  isolationOk: boolean;
  isolationFailures: string[];
  provisioned: boolean;
  supabaseUrlHostCheck: HostCheckResult;
  databaseHostCheck: HostCheckResult;
  poolerChecks: PoolerCheckBundle;
  databaseConnectionMode: DatabaseConnectionMode | "UNCONFIGURED";
};

function truthy(v: string | undefined): boolean {
  const n = (v ?? "").trim().toLowerCase();
  return n === "1" || n === "true" || n === "yes" || n === "on";
}

function fingerprint(secret: string | undefined): string | null {
  if (!secret || !secret.trim()) return null;
  const hex = createHash("sha256").update(secret.trim()).digest("hex");
  return `…${hex.slice(-4)}`;
}

export function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Validate STAGING_SUPABASE_URL only: https + *.supabase.co + project ref match.
 * Does NOT compare against STAGING_ALLOWED_HOST.
 */
export function checkSupabaseUrlHost(
  supabaseUrl: string | null,
  projectRef: string | null,
): HostCheckResult {
  const reasons: string[] = [];
  if (!supabaseUrl) {
    return { status: "FAIL", reasons: ["STAGING_SUPABASE_URL missing"] };
  }
  let parsed: URL;
  try {
    parsed = new URL(supabaseUrl);
  } catch {
    return { status: "FAIL", reasons: ["STAGING_SUPABASE_URL is not a valid URL"] };
  }
  if (parsed.protocol !== "https:") {
    reasons.push("STAGING_SUPABASE_URL must use https");
  }
  const host = parsed.hostname.toLowerCase();
  if (!host.endsWith(".supabase.co") || host === "supabase.co") {
    reasons.push("STAGING_SUPABASE_URL host must be *.supabase.co");
  }
  if (!projectRef) {
    reasons.push("STAGING_PROJECT_REF missing for SUPABASE_URL host check");
  } else {
    const expected = `${projectRef.toLowerCase()}.supabase.co`;
    if (host !== expected) {
      reasons.push(
        `STAGING_SUPABASE_URL host does not match STAGING_PROJECT_REF (expected ${expected})`,
      );
    }
  }
  return { status: reasons.length === 0 ? "PASS" : "FAIL", reasons };
}

/**
 * Validate STAGING_ALLOWED_HOST against STAGING_DATABASE_URL hostname only.
 * Example: postgresql://…@db.xxx.supabase.co:5432/postgres → ALLOWED_HOST=db.xxx.supabase.co
 */
export function checkDatabaseHost(
  databaseUrl: string | null,
  allowedHost: string | null,
): HostCheckResult {
  const reasons: string[] = [];
  if (!databaseUrl) {
    reasons.push("STAGING_DATABASE_URL missing");
  }
  if (!allowedHost) {
    reasons.push("STAGING_ALLOWED_HOST missing");
  }
  const dbHost = hostOf(databaseUrl);
  if (databaseUrl && !dbHost) {
    reasons.push("STAGING_DATABASE_URL host could not be parsed");
  }
  if (dbHost && allowedHost && dbHost !== allowedHost.toLowerCase()) {
    reasons.push(
      "STAGING_ALLOWED_HOST != STAGING_DATABASE_URL hostname",
    );
  }
  return { status: reasons.length === 0 ? "PASS" : "FAIL", reasons };
}

/**
 * Read STAGING_* only. Does not initialize network clients.
 */
export function readStagingEnv(
  env: NodeJS.ProcessEnv = process.env,
): StagingEnvSnapshot {
  const supabaseUrl = (env.STAGING_SUPABASE_URL || "").trim() || null;
  const databaseUrl = (env.STAGING_DATABASE_URL || "").trim() || null;
  const databasePoolerUrl = (env.STAGING_DATABASE_POOLER_URL || "").trim() || null;
  const projectRef = (env.STAGING_PROJECT_REF || "").trim() || null;
  const allowedHost = (env.STAGING_ALLOWED_HOST || "").trim() || null;
  const allowedPoolerHost =
    (env.STAGING_ALLOWED_POOLER_HOST || "").trim() || null;
  const environmentId = (env.STAGING_ENVIRONMENT_ID || "").trim() || null;
  const productionRef =
    (env.SUPABASE_PRODUCTION_PROJECT_REF || "").trim() || null;

  const productionCheck = checkProductionWriteBlock(env, {
    databaseUrl: databaseUrl ?? undefined,
    hostname: hostOf(supabaseUrl) ?? undefined,
  });

  const isolationFailures: string[] = [];
  const productionUrl = (
    env.PRODUCTION_SUPABASE_URL ||
    env.PRODUCTION_DATABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();

  if (supabaseUrl && productionUrl && supabaseUrl === productionUrl) {
    isolationFailures.push("STAGING_SUPABASE_URL equals production URL marker");
  }
  if (
    databaseUrl &&
    env.PRODUCTION_DATABASE_URL &&
    databaseUrl === env.PRODUCTION_DATABASE_URL.trim()
  ) {
    isolationFailures.push("STAGING_DATABASE_URL equals PRODUCTION_DATABASE_URL");
  }
  if (projectRef && productionRef && projectRef === productionRef) {
    isolationFailures.push("STAGING_PROJECT_REF equals SUPABASE_PRODUCTION_PROJECT_REF");
  }
  if (supabaseUrl && productionRef && supabaseUrl.includes(productionRef)) {
    isolationFailures.push("STAGING_SUPABASE_URL contains production project ref");
  }
  if (
    (env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL) &&
    !supabaseUrl &&
    truthy(env.STAGING_COMMIT_ENABLED)
  ) {
    isolationFailures.push(
      "STAGING_COMMIT_ENABLED but STAGING_SUPABASE_URL missing — refusing Production URL fallback",
    );
  }

  const supabaseUrlHostCheck = checkSupabaseUrlHost(supabaseUrl, projectRef);
  if (
    (supabaseUrl || projectRef) &&
    supabaseUrlHostCheck.status === "FAIL"
  ) {
    isolationFailures.push(...supabaseUrlHostCheck.reasons);
  }

  // Direct host only — never compare ALLOWED_HOST to pooler hostname.
  const databaseHostCheck = checkDatabaseHost(databaseUrl, allowedHost);
  if (
    (databaseUrl || allowedHost) &&
    databaseHostCheck.status === "FAIL"
  ) {
    isolationFailures.push(...databaseHostCheck.reasons);
  }

  const poolerChecks = checkStagingPoolerUrl(
    databasePoolerUrl,
    projectRef,
    allowedPoolerHost,
    productionRef,
  );

  // Pooler is preferred on this Mac mini. If present but invalid → isolation fail.
  // If absent → do not block "provisioned" for direct record, but connection mode notes fallback.
  if (databasePoolerUrl && !poolerChecksOk(poolerChecks)) {
    isolationFailures.push(
      ...poolerChecks.POOLER_URL_CHECK.reasons,
      ...poolerChecks.POOLER_HOST_CHECK.reasons,
      ...poolerChecks.POOLER_PROJECT_REF_CHECK.reasons,
      ...poolerChecks.POOLER_USERNAME_CHECK.reasons,
      ...poolerChecks.POOLER_PORT_CHECK.reasons,
      ...poolerChecks.POOLER_DATABASE_CHECK.reasons,
      ...poolerChecks.POOLER_ALLOWED_HOST_CHECK.reasons,
    );
  }

  const databaseConnectionMode: DatabaseConnectionMode | "UNCONFIGURED" =
    databasePoolerUrl && poolerChecksOk(poolerChecks)
      ? "SESSION_POOLER"
      : databaseUrl
        ? "DIRECT_FALLBACK"
        : "UNCONFIGURED";

  const provisioned = Boolean(
    supabaseUrl &&
      databaseUrl &&
      projectRef &&
      environmentId &&
      env.STAGING_SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  return {
    stagingImportEnabled: truthy(env.STAGING_IMPORT_ENABLED),
    stagingCommitEnabled: truthy(env.STAGING_COMMIT_ENABLED),
    stagingStorageUploadEnabled: truthy(env.STAGING_STORAGE_UPLOAD_ENABLED),
    stagingIntegrationTestEnabled: truthy(env.STAGING_INTEGRATION_TEST_ENABLED),
    reviewerGateEnabled: env.STAGING_REVIEWER_GATE_ENABLED == null
      ? true
      : truthy(env.STAGING_REVIEWER_GATE_ENABLED),
    environmentId,
    projectRef,
    allowedHost,
    allowedPoolerHost,
    supabaseUrl,
    databaseUrl,
    databasePoolerUrlPresent: Boolean(databasePoolerUrl),
    anonKeyPresent: Boolean(env.STAGING_SUPABASE_ANON_KEY?.trim()),
    serviceRolePresent: Boolean(env.STAGING_SUPABASE_SERVICE_ROLE_KEY?.trim()),
    anonKeyFingerprint: fingerprint(env.STAGING_SUPABASE_ANON_KEY),
    serviceRoleFingerprint: fingerprint(env.STAGING_SUPABASE_SERVICE_ROLE_KEY),
    storageBucket:
      (env.STAGING_STORAGE_BUCKET || "goth-staging-assets").trim() ||
      "goth-staging-assets",
    productionDetected: productionCheck.blocked,
    productionBlockReasons: productionCheck.reasons,
    isolationOk: isolationFailures.length === 0 && !productionCheck.blocked,
    isolationFailures,
    provisioned,
    supabaseUrlHostCheck,
    databaseHostCheck,
    poolerChecks,
    databaseConnectionMode,
  };
}

export type ControlledCommitGateInput = {
  confirmStaging: boolean;
  batchId: string;
  expectedSealedDigest: string;
  migrationAuditPass: boolean;
  rlsStaticAuditPass: boolean;
  commitPayloadHashVerified: boolean;
  importSessionAlreadyCommitted: boolean;
};

/**
 * Full controlled commit gate. Does not open sockets.
 */
export function assertControlledCommitAllowed(
  input: ControlledCommitGateInput,
  env: NodeJS.ProcessEnv = process.env,
): StagingEnvSnapshot {
  assertProductionWriteBlocked(env);
  const snap = readStagingEnv(env);

  if (snap.productionDetected) {
    throw new ProductionWriteBlockedError(
      snap.productionBlockReasons.join("; "),
      { reasons: snap.productionBlockReasons },
    );
  }
  if (!snap.isolationOk) {
    throw new StagingEnvironmentBlockedError(
      snap.isolationFailures.join("; ") || "isolation failed",
      { failures: snap.isolationFailures },
    );
  }
  if (!snap.stagingImportEnabled) {
    throw new StagingEnvironmentBlockedError("STAGING_IMPORT_ENABLED must be true");
  }
  if (!snap.stagingCommitEnabled) {
    throw new StagingCommitDisabledError("STAGING_COMMIT_DISABLED");
  }
  if (!input.confirmStaging) {
    throw new StagingEnvironmentBlockedError("explicit --confirm-staging required");
  }
  if (!snap.provisioned) {
    throw new StagingEnvironmentBlockedError(
      "Staging environment not provisioned (missing STAGING_* vars)",
    );
  }
  if (!snap.reviewerGateEnabled) {
    throw new StagingEnvironmentBlockedError("reviewer gate must be enabled");
  }
  if (!input.migrationAuditPass) {
    throw new StagingEnvironmentBlockedError("migration audit must PASS");
  }
  if (!input.rlsStaticAuditPass) {
    throw new StagingEnvironmentBlockedError("RLS static audit must PASS");
  }
  if (!input.commitPayloadHashVerified) {
    throw new StagingEnvironmentBlockedError("commit payload hash verification failed");
  }
  if (input.importSessionAlreadyCommitted) {
    throw new StagingEnvironmentBlockedError(
      "import session already committed — refuse duplicate commit",
    );
  }
  if (!input.batchId.trim()) {
    throw new StagingEnvironmentBlockedError("batchId required");
  }
  if (!/^[a-f0-9]{64}$/i.test(input.expectedSealedDigest.trim())) {
    throw new StagingEnvironmentBlockedError(
      "expected sealed digest must be 64-char hex",
    );
  }
  return snap;
}

export function assertStagingClientMayConnect(
  env: NodeJS.ProcessEnv = process.env,
): StagingEnvSnapshot {
  assertProductionWriteBlocked(env);
  const snap = readStagingEnv(env);
  if (snap.productionDetected) {
    throw new ProductionWriteBlockedError(snap.productionBlockReasons.join("; "));
  }
  if (!snap.isolationOk) {
    throw new StagingEnvironmentBlockedError(snap.isolationFailures.join("; "));
  }
  if (!snap.provisioned) {
    throw new StagingEnvironmentBlockedError(
      "Staging not provisioned — refusing client connect",
    );
  }
  return snap;
}

export function envCheckReport(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, unknown> {
  const snap = readStagingEnv(env);
  const dumpedSecretsSafe = JSON.stringify({
    status: snap.provisioned
      ? snap.isolationOk
        ? "STAGING_ENV_OK"
        : "STAGING_ENV_ISOLATION_FAIL"
      : "STAGING_ENV_INCOMPLETE",
    staging_env_present: snap.provisioned,
    production_env_detected: snap.productionDetected,
    production_hard_block_status: snap.productionDetected
      ? "BLOCKED"
      : "CLEAR",
    project_isolation: !snap.provisioned
      ? "NOT_TESTED"
      : snap.isolationOk
        ? "PASS"
        : "FAIL",
    SUPABASE_URL_HOST_CHECK: snap.supabaseUrlHostCheck.status,
    SUPABASE_URL_HOST_CHECK_REASONS: snap.supabaseUrlHostCheck.reasons,
    DATABASE_HOST_CHECK: snap.databaseHostCheck.status,
    DATABASE_HOST_CHECK_REASONS: snap.databaseHostCheck.reasons,
    POOLER_URL_CHECK: snap.poolerChecks.POOLER_URL_CHECK.status,
    POOLER_URL_CHECK_REASONS: snap.poolerChecks.POOLER_URL_CHECK.reasons,
    POOLER_HOST_CHECK: snap.poolerChecks.POOLER_HOST_CHECK.status,
    POOLER_HOST_CHECK_REASONS: snap.poolerChecks.POOLER_HOST_CHECK.reasons,
    POOLER_PROJECT_REF_CHECK: snap.poolerChecks.POOLER_PROJECT_REF_CHECK.status,
    POOLER_PROJECT_REF_CHECK_REASONS:
      snap.poolerChecks.POOLER_PROJECT_REF_CHECK.reasons,
    POOLER_USERNAME_CHECK: snap.poolerChecks.POOLER_USERNAME_CHECK.status,
    POOLER_USERNAME_CHECK_REASONS:
      snap.poolerChecks.POOLER_USERNAME_CHECK.reasons,
    POOLER_PORT_CHECK: snap.poolerChecks.POOLER_PORT_CHECK.status,
    POOLER_PORT_CHECK_REASONS: snap.poolerChecks.POOLER_PORT_CHECK.reasons,
    POOLER_DATABASE_CHECK: snap.poolerChecks.POOLER_DATABASE_CHECK.status,
    POOLER_ALLOWED_HOST_CHECK:
      snap.poolerChecks.POOLER_ALLOWED_HOST_CHECK.status,
    DATABASE_CONNECTION_MODE: snap.databaseConnectionMode,
    pooler_host: snap.poolerChecks.parsedHost,
    pooler_username: snap.poolerChecks.parsedUsername,
    pooler_port: snap.poolerChecks.parsedPort,
    pooler_url_present: snap.databasePoolerUrlPresent,
    url_comparison: snap.isolationFailures.filter((f) => f.includes("URL")),
    project_ref_comparison:
      snap.projectRef && env.SUPABASE_PRODUCTION_PROJECT_REF
        ? snap.projectRef === env.SUPABASE_PRODUCTION_PROJECT_REF.trim()
          ? "SAME_AS_PRODUCTION"
          : "DISTINCT"
        : "PRODUCTION_REF_UNSET_OR_STAGING_REF_MISSING",
    commit_enabled: snap.stagingCommitEnabled,
    import_enabled: snap.stagingImportEnabled,
    storage_upload_enabled: snap.stagingStorageUploadEnabled,
    reviewer_gate: snap.reviewerGateEnabled,
    storage_bucket: snap.storageBucket,
    anon_key: snap.anonKeyPresent
      ? `PRESENT ${snap.anonKeyFingerprint}`
      : "MISSING",
    service_role_key: snap.serviceRolePresent
      ? `PRESENT ${snap.serviceRoleFingerprint}`
      : "MISSING",
    isolation_failures: snap.isolationFailures,
    production_block_reasons: snap.productionBlockReasons,
    note: "Secrets never printed in full — no password or full URI",
  });
  // Defense-in-depth: refuse to return report if raw secrets leaked into JSON.
  const poolerRaw = (env.STAGING_DATABASE_POOLER_URL || "").trim();
  const directRaw = (env.STAGING_DATABASE_URL || "").trim();
  if (poolerRaw && dumpedSecretsSafe.includes(poolerRaw)) {
    throw new StagingEnvironmentBlockedError(
      "Refusing envCheckReport — pooler URI would leak",
    );
  }
  if (directRaw && dumpedSecretsSafe.includes(directRaw)) {
    throw new StagingEnvironmentBlockedError(
      "Refusing envCheckReport — database URI would leak",
    );
  }
  return JSON.parse(dumpedSecretsSafe) as Record<string, unknown>;
}
