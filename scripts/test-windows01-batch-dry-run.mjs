#!/usr/bin/env node
/**
 * Windows01 Goth Batch dry-run + BATCH_CONTRACT_V1 sealed ZIP tests.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const root = process.cwd();

async function load() {
  const url = pathToFileURL(
    path.join(root, "src/lib/integrations/windows01/index.ts"),
  ).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

function sha256Buf(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function listRelFiles(dir) {
  const out = [];
  function walk(d, prefix = "") {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full, rel);
      else out.push(rel.split(path.sep).join("/"));
    }
  }
  walk(dir);
  return out.sort();
}

function writeMembership(dir) {
  const files = listRelFiles(dir).filter(
    (f) =>
      f !== "manifests/file_inventory.json" &&
      f !== "manifests/SHA256SUMS.txt",
  );
  const inventory = files.map((rel) => {
    const full = path.join(dir, rel);
    return {
      path: rel,
      bytes: fs.statSync(full).size,
      sha256: sha256Buf(fs.readFileSync(full)),
    };
  });
  inventory.push({
    path: "manifests/file_inventory.json",
    bytes: 0,
    sha256: "b".repeat(64),
  });
  inventory.push({
    path: "manifests/SHA256SUMS.txt",
    bytes: 0,
    sha256: "c".repeat(64),
  });
  inventory.sort((a, b) => a.path.localeCompare(b.path));

  const invRow = inventory.find((r) => r.path === "manifests/file_inventory.json");
  const sumsRow = inventory.find((r) => r.path === "manifests/SHA256SUMS.txt");
  let invOut = "";
  let sumsOut = "";
  for (let i = 0; i < 6; i += 1) {
    invOut = JSON.stringify(inventory, null, 2) + "\n";
    sumsOut = inventory.map((r) => `${r.sha256}  ${r.path}`).join("\n") + "\n";
    invRow.bytes = Buffer.byteLength(invOut);
    sumsRow.bytes = Buffer.byteLength(sumsOut);
  }
  writeFile(path.join(dir, "manifests/file_inventory.json"), invOut);
  writeFile(path.join(dir, "manifests/SHA256SUMS.txt"), sumsOut);
}

function makeMinimalValidBatch(dir, { corruptPayload = false } = {}) {
  const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
  ]);
  writeFile(path.join(dir, "images/abc123.jpg"), jpeg);
  const pdf = Buffer.from(
    "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
  );
  writeFile(path.join(dir, "pdfs/doc1.pdf"), pdf);

  writeFile(
    path.join(dir, "data/developers.json"),
    JSON.stringify([
      {
        name: "Test Dev",
        slug: "test-dev",
        source_url: "https://www.terrabkk.com/projects/developer/test-dev",
        developer_resolution: {
          developer_id: "dev-unknown",
          confidence: "HIGH",
          status: "RESOLVED",
        },
      },
    ]),
  );
  writeFile(
    path.join(dir, "data/projects.json"),
    JSON.stringify([
      {
        project_id: "1001",
        project_name: "Test Project",
        developer: "Test Dev",
        province: "กรุงเทพ",
        source_url: "https://www.terrabkk.com/projects/show/1001",
        source_domain: "www.terrabkk.com",
        developer_resolution: {
          developer_id: "dev-unknown",
          confidence: "HIGH",
        },
        province_resolution: { confidence: "HIGH", status: "RESOLVED" },
        evidence: { sha256: "a".repeat(64) },
      },
    ]),
  );
  writeFile(
    path.join(dir, "data/news.json"),
    JSON.stringify([
      {
        title: "News A",
        source_url: "https://www.bangkokpost.com/property/1",
        source_domain: "www.bangkokpost.com",
        discovered_at: "2026-07-24T00:00:00Z",
      },
    ]),
  );
  writeFile(
    path.join(dir, "data/review_queue.json"),
    JSON.stringify([
      {
        reason: "PROVINCE_LOW_CONFIDENCE",
        project_id: "1001",
        source_url: "https://www.terrabkk.com/projects/show/1001",
      },
    ]),
  );
  writeFile(path.join(dir, "data/failures.json"), JSON.stringify([]));
  writeFile(
    path.join(dir, "manifests/images_manifest.json"),
    JSON.stringify([
      {
        image_id: "abc123",
        project_id: "1001",
        source_page: "https://www.terrabkk.com/projects/show/1001",
        source_url: "https://www.terrabkk.com/images/x.jpg",
        local_path: "images/abc123.jpg",
        sha256: sha256Buf(jpeg),
        format: "JPEG",
        linkage_status: "PASS",
        bytes: jpeg.length,
      },
    ]),
  );
  writeFile(
    path.join(dir, "manifests/pdfs_manifest.json"),
    JSON.stringify([
      {
        file: "doc1.pdf",
        doc_type: "brochure",
        project_id: "1001",
        source_url: "https://example.com/doc.pdf",
        source_page: "https://www.terrabkk.com/projects/show/1001",
        sha256: sha256Buf(pdf),
        bytes: pdf.length,
        page_count: 1,
      },
    ]),
  );
  writeFile(
    path.join(dir, "export_contract.json"),
    JSON.stringify({
      schema_version: "goth_export_contract.v1",
      batch_id: "BATCH-TEST-001",
      source_job_id: "JOB-TEST-001",
      counts: { developers: 1, projects: 1 },
      included_files: ["export_contract.json"],
    }),
  );
  writeFile(
    path.join(dir, "manifests/batch_manifest.json"),
    JSON.stringify(
      {
        schema_version: "goth_batch_manifest.v1",
        batch_id: "BATCH-TEST-001",
        job_id: "JOB-TEST-001",
        generated_at: "2026-07-24T00:00:00Z",
        status: "READY_FOR_STAGING_REVIEW",
        counts: {
          developers: 1,
          projects: 1,
          images: 1,
          pdfs: 1,
          news: 1,
          review_items: 1,
        },
        file_count: 0,
        zip_sha256: "0".repeat(64),
        zip_size: "0".repeat(20),
      },
      null,
      2,
    ) + "\n",
  );

  writeMembership(dir);
  const bm = JSON.parse(
    fs.readFileSync(path.join(dir, "manifests/batch_manifest.json"), "utf8"),
  );
  bm.file_count = listRelFiles(dir).length;
  writeFile(
    path.join(dir, "manifests/batch_manifest.json"),
    JSON.stringify(bm, null, 2) + "\n",
  );
  writeMembership(dir);

  if (corruptPayload) {
    fs.appendFileSync(path.join(dir, "data/developers.json"), "\n");
  }
  return dir;
}

const w01 = await load();
let passed = 0;
let total = 0;

function test(name, fn) {
  total += 1;
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    console.error(err);
  }
}

test("dry-run action vocabulary allows WOULD_* only", () => {
  for (const a of w01.DRY_RUN_ACTION_VOCABULARY) {
    w01.assertDryRunActionAllowed(a);
  }
  assert.throws(() => w01.assertDryRunActionAllowed("CREATED"));
  assert.throws(() => w01.assertDryRunActionAllowed("APPROVED"));
  assert.throws(() => w01.assertDryRunActionAllowed("PUBLISHED"));
});

test("review reason mapping never emits publish states", () => {
  assert.equal(
    w01.mapWindows01ReviewReason("PROVINCE_LOW_CONFIDENCE").mapped_state,
    "REVIEW_REQUIRED",
  );
  assert.equal(
    w01.mapWindows01ReviewReason("PROVINCE_NAME_CONFLICT").mapped_state,
    "CONFLICT",
  );
  for (const bad of [
    "APPROVED",
    "VERIFIED_FACT",
    "PUBLISHED",
    "PRODUCTION_READY",
  ]) {
    assert.ok(!w01.ALLOWED_MAPPED_REVIEW_STATES.includes(bad));
  }
});

test("pdf magic and image sniff", () => {
  assert.equal(w01.isPdfMagic(Buffer.from("%PDF-1.4")), true);
  assert.equal(w01.isPdfMagic(Buffer.from("<html>")), false);
  assert.equal(
    w01.sniffImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
    "image/jpeg",
  );
});

test("image linkage project id from source_page", () => {
  assert.equal(
    w01.projectIdFromSourcePage(
      "https://www.terrabkk.com/projects/show/36945",
    ),
    "36945",
  );
});

test("goth_batch_manifest.v1 compatibility", () => {
  assert.equal(w01.isSupportedGothSchema("goth_batch_manifest.v1"), true);
  assert.equal(w01.isSupportedGothSchema("windows01.manifest.v0"), false);
});

test("missing manifest throws", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-missing-"));
  assert.throws(() => w01.loadGothBatchManifest(dir), /MISSING_MANIFEST/);
});

test("payload hash mismatch aborts dry-run adapter", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-hashfail-"));
  makeMinimalValidBatch(dir, { corruptPayload: true });
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "HASH_VALIDATION_FAILED");
  assert.equal(result.adapterInvoked, false);
  assert.equal(result.databaseWrites, 0);
  assert.equal(result.storageUploads, 0);
});

test("meta self-reference handling is LAX (membership+bytes)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-lax-"));
  makeMinimalValidBatch(dir);
  const hash = w01.validateGothBatchHashes(dir);
  assert.equal(hash.status, "PASS");
  assert.ok(hash.metaFilesLaxOk.includes("manifests/batch_manifest.json"));
  assert.equal(hash.inventoryMembershipOk, true);
  assert.equal(hash.sumsMembershipOk, true);
});

test("export_contract.json membership required", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-export-"));
  makeMinimalValidBatch(dir);
  assert.ok(fs.existsSync(path.join(dir, "export_contract.json")));
  const inv = JSON.parse(
    fs.readFileSync(path.join(dir, "manifests/file_inventory.json"), "utf8"),
  );
  assert.ok(inv.some((r) => r.path === "export_contract.json"));
});

test("valid batch dry-run produces WOULD_* actions only", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-ok-"));
  makeMinimalValidBatch(dir);
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "PASS");
  assert.equal(result.adapterInvoked, true);
  const actions = JSON.parse(
    fs.readFileSync(path.join(out, "import_actions_preview.json"), "utf8"),
  );
  assert.ok(actions.length > 0);
  for (const a of actions) {
    assert.ok(w01.DRY_RUN_ACTION_VOCABULARY.includes(a.action));
  }
  assert.ok(fs.existsSync(path.join(out, "dry_run_audit_log.jsonl")));
});

test("duplicate URL detection via dry-run news", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-dup-"));
  makeMinimalValidBatch(dir);
  writeFile(
    path.join(dir, "data/news.json"),
    JSON.stringify([
      {
        title: "Same",
        source_url: "https://www.bangkokpost.com/property/1",
        source_domain: "www.bangkokpost.com",
      },
      {
        title: "Same",
        source_url: "https://www.bangkokpost.com/property/1",
        source_domain: "www.bangkokpost.com",
      },
    ]),
  );
  writeMembership(dir);
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "PASS");
  const dups = JSON.parse(
    fs.readFileSync(path.join(out, "duplicate_candidates.json"), "utf8"),
  );
  assert.ok(dups.some((d) => d.type === "news_url"));
});

test("image linkage mismatch independent check", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-link-"));
  makeMinimalValidBatch(dir);
  const images = JSON.parse(
    fs.readFileSync(path.join(dir, "manifests/images_manifest.json"), "utf8"),
  );
  images[0].project_id = "9999";
  writeFile(
    path.join(dir, "manifests/images_manifest.json"),
    JSON.stringify(images),
  );
  writeMembership(dir);
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "PASS");
  const assets = JSON.parse(
    fs.readFileSync(path.join(out, "normalized_assets.json"), "utf8"),
  );
  assert.equal(assets[0].independent_linkage, "FAIL");
  assert.ok(assets[0].issues.includes("IMAGE_PROJECT_LINKAGE_MISMATCH"));
});

test("invalid PDF rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-badpdf-"));
  makeMinimalValidBatch(dir);
  writeFile(path.join(dir, "pdfs/doc1.pdf"), "<html>error</html>");
  const pdfs = JSON.parse(
    fs.readFileSync(path.join(dir, "manifests/pdfs_manifest.json"), "utf8"),
  );
  pdfs[0].sha256 = sha256Buf(fs.readFileSync(path.join(dir, "pdfs/doc1.pdf")));
  writeFile(path.join(dir, "manifests/pdfs_manifest.json"), JSON.stringify(pdfs));
  writeMembership(dir);
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "PASS");
  const normalized = JSON.parse(
    fs.readFileSync(path.join(out, "normalized_pdfs.json"), "utf8"),
  );
  assert.equal(normalized[0].dry_run_decision, "REJECT");
  assert.ok(normalized[0].issues.includes("INVALID_PDF_MAGIC"));
});

test("low-confidence province maps to REVIEW_REQUIRED", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-prov-"));
  makeMinimalValidBatch(dir);
  const projects = JSON.parse(
    fs.readFileSync(path.join(dir, "data/projects.json"), "utf8"),
  );
  projects[0].province_resolution = {
    confidence: "LOW",
    status: "REVIEW_REQUIRED",
  };
  writeFile(path.join(dir, "data/projects.json"), JSON.stringify(projects));
  writeMembership(dir);
  const out = path.join(dir, "out");
  const result = w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  assert.equal(result.status, "PASS");
  const normalized = JSON.parse(
    fs.readFileSync(path.join(out, "normalized_projects.json"), "utf8"),
  );
  assert.ok(normalized[0].issues.includes("PROVINCE_LOW_CONFIDENCE"));
});

test("production / database / storage hard block flags", () => {
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.production_write, false);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.database_write, false);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.asset_upload, false);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.approval, false);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.publish, false);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.dry_run, true);
  assert.equal(w01.GOTH_DRY_RUN_FLAGS.staging_only, true);
});

test("staging adapter production hard block", async () => {
  process.env.APP_DEPLOY_ENV = "production";
  const mod = await load();
  const adapter = mod.createWindows01ImportAdapter();
  const result = adapter.runImport(
    {
      manifest: {
        schemaVersion: "windows01.manifest.v0",
        batchId: "x",
        producedAt: "2026-07-24T00:00:00Z",
        sourceMachine: "windows01",
        workerVersion: "t",
        recordCount: 0,
        contentHash: "h".repeat(16),
        evidencePaths: [],
      },
      records: [],
    },
    "dry-run",
  );
  assert.equal(result.mode, "blocked-production");
  assert.equal(result.accepted, 0);
  assert.ok(
    result.quarantined.some((q) => q.reason === "PRODUCTION_HARD_BLOCK"),
  );
  delete process.env.APP_DEPLOY_ENV;
  process.env.APP_DEPLOY_ENV = "development";
});

test("path traversal helper still rejects", async () => {
  const { assertNoPathTraversal, Windows01ValidationError } = await load();
  assert.throws(
    () => assertNoPathTraversal("../etc/passwd"),
    (e) => e instanceof Windows01ValidationError && e.code === "PATH_TRAVERSAL",
  );
});

test("audit log generation", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goth-audit-"));
  makeMinimalValidBatch(dir);
  const out = path.join(dir, "out");
  w01.runGothBatchDryRun({
    batchDir: dir,
    outputDir: out,
    repoRoot: root,
    strictHash: true,
  });
  const lines = fs
    .readFileSync(path.join(out, "dry_run_audit_log.jsonl"), "utf8")
    .trim()
    .split("\n");
  assert.ok(lines.length >= 2);
});

// --- Sealed ZIP contract tests against real BATCH001 copy ---
const realZip = path.join(
  root,
  ".work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.zip",
);
const realSidecar = path.join(
  root,
  ".work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.sha256",
);
const realExternal = path.join(
  root,
  ".work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.batch_manifest.json",
);
const realExtracted = path.join(
  root,
  ".work/imports/BATCH-GTH-20260724-001/extracted",
);
const EXPECTED_SEALED =
  "d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786";

if (fs.existsSync(realZip)) {
  test("sealed digest success", () => {
    const digest = w01.verifySealedZip(realZip);
    assert.equal(digest, EXPECTED_SEALED);
    const raw = w01.sha256Bytes(fs.readFileSync(realZip));
    assert.notEqual(raw, digest);
  });

  test("raw SHA differs from sealed digest but contract is valid", () => {
    const sealed = w01.validateSealedZipContract({
      zipPath: realZip,
      sidecarPath: realSidecar,
      externalManifestPath: realExternal,
      internalManifest: JSON.parse(
        fs.readFileSync(
          path.join(realExtracted, "manifests/batch_manifest.json"),
          "utf8",
        ),
      ),
    });
    assert.equal(sealed.status, "PASS");
    assert.equal(sealed.sealed_zip_sha256, EXPECTED_SEALED);
    assert.notEqual(sealed.raw_zip_sha256, sealed.sealed_zip_sha256);
  });

  test("sidecar mismatch detected", () => {
    const bad = path.join(os.tmpdir(), `bad-side-${Date.now()}.sha256`);
    fs.writeFileSync(bad, "a".repeat(64) + "\n");
    const sealed = w01.validateSealedZipContract({
      zipPath: realZip,
      sidecarPath: bad,
      externalManifestPath: realExternal,
      internalManifest: JSON.parse(
        fs.readFileSync(
          path.join(realExtracted, "manifests/batch_manifest.json"),
          "utf8",
        ),
      ),
    });
    assert.equal(sealed.status, "FAIL");
    assert.ok(sealed.reasons.includes("sidecar_mismatch"));
  });

  test("external manifest mismatch detected", () => {
    const bad = path.join(os.tmpdir(), `bad-ext-${Date.now()}.json`);
    const ext = JSON.parse(fs.readFileSync(realExternal, "utf8"));
    ext.zip_sha256 = "b".repeat(64);
    fs.writeFileSync(bad, JSON.stringify(ext));
    const sealed = w01.validateSealedZipContract({
      zipPath: realZip,
      sidecarPath: realSidecar,
      externalManifestPath: bad,
      internalManifest: JSON.parse(
        fs.readFileSync(
          path.join(realExtracted, "manifests/batch_manifest.json"),
          "utf8",
        ),
      ),
    });
    assert.equal(sealed.status, "FAIL");
    assert.ok(sealed.reasons.includes("external_manifest_mismatch"));
  });

  test("internal manifest mismatch detected", () => {
    const sealed = w01.validateSealedZipContract({
      zipPath: realZip,
      sidecarPath: realSidecar,
      externalManifestPath: realExternal,
      internalManifest: {
        zip_sha256: "c".repeat(64),
        zip_size: "00000000000034407985",
      },
    });
    assert.equal(sealed.status, "FAIL");
    assert.ok(sealed.reasons.includes("internal_manifest_mismatch"));
  });

  test("file_count = 30 and inventory/sums membership", () => {
    const hash = w01.validateGothBatchHashes(realExtracted, {
      zipPath: realZip,
      zipSidecarPath: realSidecar,
      externalManifestPath: realExternal,
    });
    assert.equal(hash.status, "PASS");
    assert.equal(hash.payloadFilesOk, 27);
    assert.equal(hash.payloadFilesFailed, 0);
    assert.equal(hash.inventoryMembershipOk, true);
    assert.equal(hash.sumsMembershipOk, true);
    const bm = JSON.parse(
      fs.readFileSync(
        path.join(realExtracted, "manifests/batch_manifest.json"),
        "utf8",
      ),
    );
    assert.equal(bm.file_count, 30);
    assert.ok(fs.existsSync(path.join(realExtracted, "export_contract.json")));
  });
} else {
  console.log("SKIP sealed ZIP integration tests (real ZIP not present)");
}

console.log(`\nAUTOMATED_TESTS: ${passed}/${total}`);
if (passed !== total) process.exitCode = 1;
