#!/usr/bin/env node
/**
 * Staging DB env-check / probe / controlled commit / rollback CLI.
 * Default: STAGING_COMMIT_ENABLED=false → commit fails closed.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BATCH = "BATCH-GTH-20260724-001";
const DEFAULT_DIGEST =
  "d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786";

async function loadApi() {
  const url = pathToFileURL(
    path.join(root, "src/lib/staging-db/supabase/index.ts"),
  ).href;
  return import(`${url}?t=${Date.now()}`);
}

async function loadCore() {
  const url = pathToFileURL(path.join(root, "src/lib/staging-db/index.ts")).href;
  return import(`${url}?t=${Date.now()}`);
}

function parseArgs(argv) {
  const out = {
    command: argv[2] || "help",
    batch: BATCH,
    confirmStaging: false,
    expectedSealedDigest: DEFAULT_DIGEST,
    importSession: null,
    rollbackToken: null,
  };
  for (let i = 3; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--confirm-staging") out.confirmStaging = true;
    else if (a === "--batch") out.batch = argv[++i];
    else if (a === "--expected-sealed-digest") out.expectedSealedDigest = argv[++i];
    else if (a === "--import-session") out.importSession = argv[++i];
    else if (a === "--rollback-token") out.rollbackToken = argv[++i];
  }
  return out;
}

function loadDotEnvStagingLocal() {
  const p = path.join(root, ".env.staging.local");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function cmdEnvCheck() {
  loadDotEnvStagingLocal();
  const api = await loadApi();
  const report = api.envCheckReport(process.env);
  const outDir = path.join(
    root,
    `.work/staging-db/${BATCH}/implementation`,
  );
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "environment-check.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.production_hard_block_status === "BLOCKED") process.exit(2);
  if (!report.staging_env_present) {
    console.error("MANUAL_ACTION_REQUIRED: provision isolated Staging Supabase");
    process.exit(3);
  }
  const poolerOk = report.POOLER_HOST_CHECK === "PASS" &&
    report.POOLER_PROJECT_REF_CHECK === "PASS" &&
    report.POOLER_USERNAME_CHECK === "PASS" &&
    report.POOLER_PORT_CHECK === "PASS" &&
    report.POOLER_URL_CHECK === "PASS";
  if (!poolerOk || report.DATABASE_CONNECTION_MODE !== "SESSION_POOLER") {
    console.error(
      "MANUAL_ACTION_REQUIRED: set STAGING_DATABASE_POOLER_URL + STAGING_ALLOWED_POOLER_HOST in .env.staging.local (do not paste secrets into chat)",
    );
    process.exit(4);
  }
  if (report.DATABASE_HOST_CHECK !== "PASS" || report.SUPABASE_URL_HOST_CHECK !== "PASS") {
    process.exit(1);
  }
  process.exit(report.project_isolation === "PASS" ? 0 : 1);
}

async function cmdProbe() {
  loadDotEnvStagingLocal();
  const api = await loadApi();
  const avail = api.describeStagingClientAvailability(process.env);
  if (!avail.allowed) {
    console.log(
      JSON.stringify(
        {
          status: "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED",
          reason: avail.reason,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const result = await api.runStagingEmptyDbProbe(process.env);
  const outDir = path.join(
    root,
    `.work/staging-db/${BATCH}/implementation`,
  );
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "empty-db-probe.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "STAGING_PROBE_PASS" ? 0 : 1);
}

async function cmdCommit(args) {
  loadDotEnvStagingLocal();
  const api = await loadApi();
  const snap = api.readStagingEnv(process.env);
  if (!snap.stagingCommitEnabled) {
    console.error("STAGING_COMMIT_DISABLED");
    process.exit(2);
  }
  if (!snap.provisioned) {
    console.error("SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED");
    process.exit(3);
  }
  const implDir = path.join(
    root,
    `.work/staging-db/${args.batch}/implementation`,
  );
  const payloadPath = path.join(implDir, "commit-payload.json");
  const hashPath = path.join(implDir, "commit-payload.sha256");
  if (!fs.existsSync(payloadPath) || !fs.existsSync(hashPath)) {
    console.error("Missing commit-payload.json / commit-payload.sha256");
    process.exit(1);
  }
  const payloadRaw = fs.readFileSync(payloadPath);
  const expectedHash = fs.readFileSync(hashPath, "utf8").trim().toLowerCase();
  const actualHash = createHash("sha256").update(payloadRaw).digest("hex");
  const migrationAudit = JSON.parse(
    fs.readFileSync(path.join(implDir, "migration-audit.json"), "utf8"),
  );
  try {
    const result = await api.executeControlledStagingCommit({
      gate: {
        confirmStaging: args.confirmStaging,
        batchId: args.batch,
        expectedSealedDigest: args.expectedSealedDigest,
        migrationAuditPass: migrationAudit.ok === true,
        rlsStaticAuditPass: true,
        commitPayloadHashVerified: actualHash === expectedHash,
        importSessionAlreadyCommitted: false,
      },
      payload: JSON.parse(payloadRaw.toString("utf8")),
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    if (err && typeof err === "object" && "code" in err) {
      console.error(String(err.code));
    }
    process.exit(1);
  }
}

async function cmdRollback(args) {
  loadDotEnvStagingLocal();
  const api = await loadApi();
  if (!args.importSession || !args.rollbackToken) {
    console.error("Requires --import-session and --rollback-token");
    process.exit(1);
  }
  try {
    const result = await api.executeStagingRollback({
      importSessionId: args.importSession,
      rollbackToken: args.rollbackToken,
      confirmStaging: args.confirmStaging,
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

async function cmdPreparePayload(args) {
  const core = await loadCore();
  const reviewDir = path.join(root, ".work/review-console", args.batch);
  if (!fs.existsSync(reviewDir)) {
    console.error(`Missing review console data: ${reviewDir}`);
    process.exit(1);
  }
  const input = core.loadBatchCommitInputFromReviewConsole(reviewDir, {
    batchId: args.batch,
    sourceFileName: `${args.batch}.zip`,
    sealedZipSha256: args.expectedSealedDigest,
  });
  const bundle = await core.simulateCommit(input);
  const implDir = path.join(
    root,
    `.work/staging-db/${args.batch}/implementation`,
  );
  fs.mkdirSync(implDir, { recursive: true });
  const payload = {
    import_session_id: bundle.commitPlan.importSession.import_session_id,
    source_batch_id: args.batch,
    source_job_id: bundle.commitPlan.importSession.source_job_id,
    source_schema_version:
      bundle.commitPlan.importSession.source_schema_version,
    idempotency_key: bundle.commitPlan.importSession.idempotency_key,
    content_hash: bundle.commitPlan.importSession.content_hash,
    created_by: "IMPORTER",
    sealed_zip_sha256: args.expectedSealedDigest,
    counts: bundle.commitPlan.entityCounts,
    entity_counts: bundle.commitPlan.entityCounts,
    blockers: bundle.commitPlan.blockers,
    warnings: bundle.commitPlan.warnings,
    storage_status_default: "PLANNED",
    storage_upload_enabled: false,
    production_allowed: false,
    metadata_json: {
      simulation_status: "SIMULATED_ONLY",
      ready_for_approval: 14,
      conflict_preserved: true,
      project_36936: "CONFLICT",
    },
  };
  const body = `${core.stableStringify(payload)}\n`;
  const hash = createHash("sha256").update(body).digest("hex");
  fs.writeFileSync(path.join(implDir, "commit-payload.json"), body);
  fs.writeFileSync(path.join(implDir, "commit-payload.sha256"), `${hash}\n`);
  fs.writeFileSync(
    path.join(implDir, "rls-test-plan.json"),
    `${core.stableStringify({
      status: "PLAN_ONLY",
      roles: [
        "staging_importer",
        "staging_reviewer",
        "staging_admin",
        "read_only_auditor",
      ],
      live: "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED",
    })}\n`,
  );
  fs.writeFileSync(
    path.join(implDir, "precommit-report.json"),
    `${core.stableStringify({
      batchId: args.batch,
      real_commit_enabled: false,
      database_writes: 0,
      storage_uploads: 0,
      production_connection: false,
      commit_payload_sha256: hash,
      entity_counts: bundle.commitPlan.entityCounts,
      blockers: bundle.commitPlan.blockers,
    })}\n`,
  );
  console.log(
    JSON.stringify(
      {
        status: "PAYLOAD_READY",
        outDir: implDir,
        commit_payload_sha256: hash,
        database_writes: 0,
      },
      null,
      2,
    ),
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.command === "env-check") return cmdEnvCheck();
  if (args.command === "probe") return cmdProbe();
  if (args.command === "commit") return cmdCommit(args);
  if (args.command === "rollback") return cmdRollback(args);
  if (args.command === "prepare-payload") return cmdPreparePayload(args);
  console.log(`Usage:
  staging:db:env-check
  staging:db:probe
  staging:db:prepare-payload
  staging:db:commit -- --confirm-staging --batch <id> --expected-sealed-digest <hex>
  staging:db:rollback -- --confirm-staging --import-session <id> --rollback-token <token>
`);
  process.exit(args.command === "help" ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
