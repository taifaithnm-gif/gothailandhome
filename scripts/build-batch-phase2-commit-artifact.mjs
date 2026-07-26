#!/usr/bin/env node
/**
 * Build / verify Batch Phase2 commit artifact (offline, no DB).
 * npm run staging:batch:build-phase2-artifact -- --batch BATCH-GTH-20260724-001
 * npm run staging:batch:verify-phase2-artifact -- --batch BATCH-GTH-20260724-001
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function parseArgs(argv) {
  const out = {
    command: "help",
    batch: "BATCH-GTH-20260724-001",
    outDir: "",
  };
  const cmd = argv[2];
  if (cmd === "build" || cmd === "verify" || cmd === "help") out.command = cmd;
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--batch") out.batch = argv[++i] || out.batch;
    else if (a === "--out") out.outDir = argv[++i] || "";
    else if (a === "build" || a === "verify") out.command = a;
  }
  // package.json scripts pass no subcommand — infer from script argv or default build
  if (out.command === "help") {
    const script = process.env.npm_lifecycle_event || "";
    if (script.includes("verify")) out.command = "verify";
    else if (script.includes("build")) out.command = "build";
  }
  return out;
}

async function loadApi() {
  return import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/phase2-commit-artifact.ts")).href}?t=${Date.now()}`
  );
}

async function cmdBuild(args) {
  const api = await loadApi();
  const result = await api.buildPhase2CommitArtifact({
    repoRoot: root,
    batchId: args.batch,
    outDir: args.outDir || undefined,
  });
  const summary = {
    status: result.status,
    batchId: args.batch,
    outDir: result.outDir,
    artifactHash: result.artifactHash
      ? `${result.artifactHash.slice(0, 12)}…${result.artifactHash.slice(-8)}`
      : null,
    import_session_id: result.payload?.import_session_id ?? null,
    import_session_strategy: "ARTIFACT_DEFINED",
    counts: result.payload?.counts ?? null,
    core_entity_count: result.validation?.core_entity_count ?? null,
    workflow_entity_count: result.validation?.workflow_entity_count ?? null,
    phase2_rpc_compatibility: result.validation?.phase2_rpc_compatibility,
    reference_integrity: result.validation?.reference_integrity,
    source_batch_sealed_digest: result.validation?.source_batch_sealed_digest,
    v1_commit_payload: result.validation?.v1_commit_payload,
    errors: result.errors,
    database_writes: 0,
    note: "No secrets / full entity dumps printed",
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

async function cmdVerify(args) {
  const api = await loadApi();
  const result = await api.verifyPhase2CommitArtifact({
    repoRoot: root,
    batchId: args.batch,
    artifactDir: args.outDir || undefined,
  });
  console.log(
    JSON.stringify(
      {
        status: result.status,
        artifactHash: result.artifactHash
          ? `${result.artifactHash.slice(0, 12)}…${result.artifactHash.slice(-8)}`
          : null,
        sidecarMatch: result.sidecarMatch,
        deterministic: result.deterministic,
        run2Hash: result.run2Hash
          ? `${result.run2Hash.slice(0, 12)}…${result.run2Hash.slice(-8)}`
          : null,
        compatibility: result.compatibility,
        referenceIntegrity: result.referenceIntegrity,
        sourceUnchanged: result.sourceUnchanged,
        errors: result.errors,
        database_writes: 0,
      },
      null,
      2,
    ),
  );
  process.exit(result.status === "PASS" ? 0 : 1);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.command === "build") return cmdBuild(args);
  if (args.command === "verify") return cmdVerify(args);
  console.log(`Usage:
  staging:batch:build-phase2-artifact -- --batch <id>
  staging:batch:verify-phase2-artifact -- --batch <id>
`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
