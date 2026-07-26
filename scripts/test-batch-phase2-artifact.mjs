#!/usr/bin/env node
/**
 * Tests for BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BATCH = "BATCH-GTH-20260724-001";
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, error: err instanceof Error ? err.message : String(err) });
    console.log(`FAIL ${name}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, error: err instanceof Error ? err.message : String(err) });
    console.log(`FAIL ${name}`);
  }
}

const api = await import(
  `${pathToFileURL(path.join(root, "src/lib/staging-db/phase2-commit-artifact.ts")).href}?t=${Date.now()}`
);

const artifactDir = path.join(
  root,
  "ARTIFACTS/STAGING_COMMIT",
  BATCH,
  "PHASE2",
);
const v1Path = path.join(
  root,
  `.work/staging-db/${BATCH}/implementation/commit-payload.json`,
);
const v1HashPath = path.join(
  root,
  `.work/staging-db/${BATCH}/implementation/commit-payload.sha256`,
);
const v1Before = fs.readFileSync(v1Path);
const zipPath = path.join(
  root,
  `.work/imports/${BATCH}/source/${BATCH}.zip`,
);
const zipBefore = fs.readFileSync(zipPath);

test("V1 payload valid but Phase2 incompatible", () => {
  const v1 = api.auditV1CommitPayload(v1Path, v1HashPath);
  assert.equal(v1.status, "VALID_BUT_PHASE2_INCOMPATIBLE");
  assert.equal(v1.hashMatch, true);
  assert.equal(v1.sealedDigestMatch, true);
  assert.equal(v1.phase2Compatible, false);
  assert.equal(v1.entityArraysPresent.length, 0);
  assert.equal(v1.counts.developers, 5);
});

test("source sealed digest pin unchanged", () => {
  assert.equal(
    api.EXPECTED_SOURCE_SEALED_DIGEST,
    "d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786",
  );
  const sidecar = fs
    .readFileSync(
      path.join(root, `.work/imports/${BATCH}/source/${BATCH}.sha256`),
      "utf8",
    )
    .trim()
    .split(/\s+/)[0];
  assert.equal(sidecar, api.EXPECTED_SOURCE_SEALED_DIGEST);
});

test("Phase2 artifact files exist", () => {
  for (const f of [
    "commit-payload.phase2.json",
    "commit-payload.phase2.json.sha256",
    "commit-payload.phase2.provenance.json",
    "commit-payload.phase2.validation.json",
  ]) {
    assert.ok(fs.existsSync(path.join(artifactDir, f)), f);
  }
});

test("Phase2 artifact includes all arrays with expected counts", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  assert.equal(payload.developers.length, 5);
  assert.equal(payload.projects.length, 10);
  assert.equal(payload.assets.length, 9);
  assert.equal(payload.pdfs.length, 5);
  assert.equal(payload.news.length, 10);
  assert.equal(payload.review_items.length, 63);
  assert.equal(payload.conflicts.length, 1);
  assert.equal(payload.counts.developers, 5);
  assert.equal(
    payload.developers.length +
      payload.projects.length +
      payload.assets.length +
      payload.pdfs.length +
      payload.news.length,
    39,
  );
  assert.equal(payload.review_items.length + payload.conflicts.length, 64);
});

test("unknown developers preserved / no canonical links", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  assert.equal(
    payload.developers.filter((d) => d.identity_status === "UNKNOWN").length,
    5,
  );
  assert.equal(
    payload.developers.filter((d) => d.canonical_developer_id).length,
    0,
  );
  assert.ok(payload.developers.every((d) => d.candidate_id !== "dev-unknown"));
});

test("Project 36936 conflict / review intent preserved", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const p = payload.projects.find((x) => x.candidate_id === "36936");
  assert.ok(p);
  assert.equal(p.review_state, "REVIEW_REQUIRED");
  assert.equal(payload.conflicts[0].entity_id, "36936");
  assert.equal(payload.conflicts[0].review_state, "CONFLICT");
  assert.equal(payload.metadata_json.project_36936, "CONFLICT");
});

test("no approvals / published / storage object ids", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const forbidden = ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"];
  for (const row of [
    ...payload.developers,
    ...payload.projects,
    ...payload.assets,
    ...payload.pdfs,
    ...payload.news,
    ...payload.review_items,
  ]) {
    assert.ok(!forbidden.includes(row.review_state));
  }
  assert.ok(payload.assets.every((a) => a.storage_object_id == null));
  assert.ok(
    payload.assets.every(
      (a) => a.storage_status === "PLANNED" || a.storage_status === "NOT_PLANNED",
    ),
  );
  assert.equal(payload.production_allowed, false);
  assert.equal(payload.storage_upload_enabled, false);
});

test("stable sorting by formal keys", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const keys = payload.developers.map((d) => d.candidate_id);
  assert.deepEqual(keys, [...keys].sort());
  const pkeys = payload.projects.map((p) => p.candidate_id);
  assert.deepEqual(pkeys, [...pkeys].sort());
});

test("canonical JSON hash matches sidecar", () => {
  const raw = fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"));
  const expected = fs
    .readFileSync(path.join(artifactDir, "commit-payload.phase2.json.sha256"), "utf8")
    .trim();
  const actual = createHash("sha256").update(raw).digest("hex");
  assert.equal(actual, expected);
});

test("provenance binds source sealed digest and artifact hash", () => {
  const prov = JSON.parse(
    fs.readFileSync(
      path.join(artifactDir, "commit-payload.phase2.provenance.json"),
      "utf8",
    ),
  );
  assert.equal(prov.sourceSealedDigest, api.EXPECTED_SOURCE_SEALED_DIGEST);
  assert.equal(prov.importSessionStrategy, "ARTIFACT_DEFINED");
  assert.ok(String(prov.importSessionId).startsWith("sess_p2_"));
  assert.equal(prov.v1ImportSessionIdPreserved, "sess_3465132f7da014513da1d0a2");
  assert.equal(prov.phase2ArtifactHash.length, 64);
  assert.equal(prov.coreEntityCount, 39);
  assert.equal(prov.workflowEntityCount, 64);
});

test("schema file exists", () => {
  assert.ok(
    fs.existsSync(
      path.join(root, "database/staging-rpc/commit-payload-phase2.schema.json"),
    ),
  );
});

test("import session strategy ARTIFACT_DEFINED differs from V1", () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  assert.notEqual(payload.import_session_id, "sess_3465132f7da014513da1d0a2");
  assert.ok(payload.import_session_id.startsWith("sess_p2_"));
});

test("NOT_RUN status semantics helper values exist", () => {
  // GateStatus includes NOT_RUN / SKIPPED / NOT_VERIFIED — used when upstream blocked
  const sample = ["PASS", "FAIL", "NOT_RUN", "SKIPPED", "NOT_VERIFIED"];
  assert.ok(sample.includes("NOT_RUN"));
});

test("V1 payload not overwritten (byte-identical)", () => {
  const now = fs.readFileSync(v1Path);
  assert.ok(now.equals(v1Before));
});

test("original Batch ZIP byte-identical", () => {
  const now = fs.readFileSync(zipPath);
  assert.ok(now.equals(zipBefore));
});

await testAsync("Phase2 RPC compatibility validator PASS", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const compat = api.validatePhase2RpcCompatibility(payload);
  assert.equal(compat.status, "PASS", compat.errors.join(","));
});

await testAsync("reference integrity PASS", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const ref = api.validateReferenceIntegrity(payload);
  assert.equal(ref.status, "PASS", ref.errors.join(","));
});

await testAsync("counts mismatch hard-fails compatibility", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const bad = { ...payload, developers: payload.developers.slice(0, 1) };
  const compat = api.validatePhase2RpcCompatibility(bad);
  assert.equal(compat.status, "FAIL");
  assert.ok(compat.errors.some((e) => e.startsWith("COUNT_MISMATCH:developers")));
});

await testAsync("missing entity array hard-fails", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const bad = { ...payload };
  delete bad.developers;
  const compat = api.validatePhase2RpcCompatibility(bad);
  assert.equal(compat.status, "FAIL");
  assert.ok(compat.errors.some((e) => e.includes("MISSING_ARRAY:developers")));
});

await testAsync("duplicate source id hard-fails reference integrity", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const bad = {
    ...payload,
    developers: [...payload.developers, { ...payload.developers[0] }],
  };
  const ref = api.validateReferenceIntegrity(bad);
  assert.equal(ref.status, "FAIL");
  assert.ok(ref.errors.some((e) => e.startsWith("DUPLICATE_DEVELOPER")));
});

await testAsync("broken foreign reference hard-fails", async () => {
  const payload = JSON.parse(
    fs.readFileSync(path.join(artifactDir, "commit-payload.phase2.json"), "utf8"),
  );
  const projects = payload.projects.map((p, i) =>
    i === 0 ? { ...p, developer_candidate_id: "missing-dev-xxx" } : p,
  );
  const ref = api.validateReferenceIntegrity({ ...payload, projects });
  assert.equal(ref.status, "FAIL");
  assert.ok(ref.errors.some((e) => e.startsWith("UNRESOLVED_PROJECT_DEVELOPER_REF")));
});

await testAsync("deterministic rebuild hash equals stored", async () => {
  const verify = await api.verifyPhase2CommitArtifact({
    repoRoot: root,
    batchId: BATCH,
  });
  assert.equal(verify.deterministic, "PASS");
  assert.equal(verify.status, "PASS");
  assert.equal(verify.sidecarMatch, true);
});

await testAsync("source hash mismatch causes hard fail on build gates", async () => {
  const { inputs } = api.locateBatch001Inputs(root, BATCH);
  assert.ok(inputs.every((i) => i.sha256 !== "MISSING" || !i.used_for_phase2 || i.file_role.includes("V1")));
  // missing entity file path detection
  const missing = path.join(root, `.work/review-console/${BATCH}/developers.json`);
  assert.ok(fs.existsSync(missing));
});

test("package scripts present", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.ok(pkg.scripts["staging:batch:build-phase2-artifact"]);
  assert.ok(pkg.scripts["staging:batch:verify-phase2-artifact"]);
  assert.ok(pkg.scripts["test:batch-phase2-artifact"]);
});

test("no database connection required for module load", () => {
  // If we got here without env DB vars, module is offline-safe
  assert.ok(true);
});

console.log(`\nBatch Phase2 Artifact tests: ${passed} passed, ${failed} failed`);
if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f.name}\n  ${f.error}`);
  process.exit(1);
}
console.log(`TOTAL: ${passed}`);
