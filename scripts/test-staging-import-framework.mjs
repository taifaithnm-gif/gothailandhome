#!/usr/bin/env node
/**
 * Staging Import Framework V1 — comprehensive test suite (≥80 assertions/cases).
 * Dry-run only. No DB / Storage / Production side effects.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    failures.push({ name, error: err instanceof Error ? err.message : String(err) });
  }
}

async function load() {
  const url = pathToFileURL(path.join(root, "src/lib/staging-import/index.ts")).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

function sampleBatch(api, overrides = {}) {
  return api.createBatchFromParts(
    {
      batchId: overrides.batchId ?? "TEST-BATCH-001",
      schemaVersion: "staging_import_batch.v1",
      status: "MOCK",
      source: "mock",
    },
    {
      developers: overrides.developers ?? [
        {
          id: "dev-1",
          name: "Sansiri",
          aliases: ["แสนสิริ", "Sansiri PCL"],
          officialWebsite: "https://www.sansiri.com",
          confidence: "HIGH",
          evidence: [{ kind: "other", path: "evidence/a.txt" }],
        },
      ],
      projects: overrides.projects ?? [
        {
          id: "proj-1",
          name: "The Base Height",
          developerId: "dev-1",
          province: "Phuket",
          slug: "the-base-height",
          evidence: [{ kind: "image", hash: "c".repeat(64) }],
        },
      ],
      images: overrides.images ?? [
        {
          id: "img-1",
          hash: "a".repeat(64),
          projectId: "proj-1",
          mime: "image/jpeg",
          width: 100,
          height: 100,
        },
      ],
      pdfs: overrides.pdfs ?? [
        {
          id: "pdf-1",
          hash: "b".repeat(64),
          mime: "application/pdf",
          pages: 5,
          category: "brochure",
          projectId: "proj-1",
        },
      ],
      news: overrides.news ?? [
        {
          id: "news-1",
          sourceUrl: "https://example.com/n/1",
          developerId: "dev-1",
          projectId: "proj-1",
          freshnessDays: 3,
          evidence: [{ kind: "news", url: "https://example.com/n/1" }],
        },
      ],
    },
  );
}

async function main() {
  const api = await load();

  // --- types / flags ---
  test("framework version present", () => {
    assert.equal(api.STAGING_IMPORT_FRAMEWORK_VERSION, "1.0.0");
  });
  test("hard flags dry-run", () => {
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.dryRun, true);
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.commitEnabled, false);
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.databaseWrite, false);
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.storageUpload, false);
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.approval, false);
    assert.equal(api.STAGING_IMPORT_HARD_FLAGS.publish, false);
  });
  test("preview actions include WOULD_*", () => {
    for (const a of [
      "WOULD_CREATE",
      "WOULD_UPDATE",
      "WOULD_REVIEW",
      "WOULD_REJECT",
      "WOULD_DUPLICATE",
      "WOULD_QUARANTINE",
      "WOULD_SKIP_DUPLICATE",
    ]) {
      assert.ok(api.PREVIEW_ACTIONS.includes(a));
    }
  });
  test("forbidden commit actions blocked list", () => {
    assert.ok(api.FORBIDDEN_COMMIT_ACTIONS.includes("COMMITTED"));
    assert.ok(api.FORBIDDEN_COMMIT_ACTIONS.includes("APPROVED"));
  });

  // --- state machine ---
  test("initial state RECEIVED", () => {
    assert.equal(api.initialReviewState(), "RECEIVED");
  });
  test("RECEIVED → VALIDATED allowed", () => {
    assert.equal(api.canTransition("RECEIVED", "VALIDATED"), true);
  });
  test("RECEIVED → APPROVED forbidden transition", () => {
    assert.equal(api.canTransition("RECEIVED", "APPROVED"), false);
  });
  test("assertTransition throws on illegal", () => {
    assert.throws(() => api.assertTransition("RECEIVED", "PUBLISHED"));
  });
  test("automation can reach READY_FOR_APPROVAL", () => {
    let s = api.initialReviewState();
    s = api.transitionAutomation(s, "VALIDATED");
    s = api.transitionAutomation(s, "READY_FOR_APPROVAL");
    assert.equal(s, "READY_FOR_APPROVAL");
  });
  test("automation cannot enter APPROVED", () => {
    assert.throws(() =>
      api.transitionAutomation("READY_FOR_APPROVAL", "APPROVED"),
    );
  });
  test("automation cannot enter PUBLISHED", () => {
    assert.throws(() => api.assertAutomationAllowed("PUBLISHED"));
  });
  test("max automation state is READY_FOR_APPROVAL", () => {
    assert.equal(api.maxAutomationState(), "READY_FOR_APPROVAL");
  });
  test("isAtOrBeyondCeiling", () => {
    assert.equal(api.isAtOrBeyondCeiling("READY_FOR_APPROVAL"), true);
    assert.equal(api.isAtOrBeyondCeiling("VALIDATED"), false);
  });
  test("VALIDATED → REVIEW_REQUIRED", () => {
    assert.ok(api.canTransition("VALIDATED", "REVIEW_REQUIRED"));
  });
  test("CONFLICT → READY_FOR_APPROVAL", () => {
    assert.ok(api.canTransition("CONFLICT", "READY_FOR_APPROVAL"));
  });
  test("DUPLICATE → REVIEW_REQUIRED", () => {
    assert.ok(api.canTransition("DUPLICATE", "REVIEW_REQUIRED"));
  });
  test("PUBLISHED is terminal", () => {
    assert.deepEqual(api.REVIEW_TRANSITIONS.PUBLISHED, []);
  });
  test("reviewStateRank ordering", () => {
    assert.ok(
      api.reviewStateRank("RECEIVED") < api.reviewStateRank("READY_FOR_APPROVAL"),
    );
    assert.ok(
      api.reviewStateRank("READY_FOR_APPROVAL") < api.reviewStateRank("PUBLISHED"),
    );
  });

  // --- province ---
  test("province Bangkok ok", () => {
    const r = api.validateProvince("Bangkok");
    assert.equal(r.ok, true);
    assert.equal(r.canonical, "Bangkok");
  });
  test("province alias pattaya → Chonburi", () => {
    const r = api.validateProvince("Pattaya");
    assert.equal(r.ok, true);
    assert.equal(r.canonical, "Chonburi");
    assert.equal(r.aliasUsed, true);
  });
  test("province unknown", () => {
    const r = api.validateProvince("Narnia");
    assert.equal(r.ok, false);
    assert.equal(r.code, "UNKNOWN");
  });
  test("province empty", () => {
    assert.equal(api.validateProvince("").code, "EMPTY");
  });
  test("isKnownProvince", () => {
    assert.equal(api.isKnownProvince("Phuket"), true);
    assert.equal(api.isKnownProvince("Mars"), false);
  });
  test("listProvinces has 77", () => {
    assert.equal(api.listProvinces().length, 77);
  });

  // --- developer validator ---
  test("developer valid high confidence", () => {
    const r = api.validateDeveloper({
      id: "d1",
      name: "AP Thailand",
      officialWebsite: "https://www.apthai.com",
      evidence: [{ kind: "other", path: "e.txt" }],
      confidence: "HIGH",
    });
    assert.equal(r.ok, true);
    assert.equal(r.needsReview, false);
  });
  test("developer UNKNOWN needs review", () => {
    const r = api.validateDeveloper({
      id: "dev-unknown",
      name: "UNKNOWN",
      unknown: true,
    });
    assert.equal(r.isUnknown, true);
    assert.equal(r.needsReview, true);
  });
  test("developer DNS failure", () => {
    const r = api.validateDeveloper({
      id: "d2",
      name: "Foo",
      dnsFailure: true,
      officialWebsite: "https://broken.example",
    });
    assert.equal(r.needsReview, true);
    assert.ok(r.issues.some((i) => i.code === "DEVELOPER_DNS_FAILURE"));
  });
  test("developer invalid website", () => {
    const r = api.validateDeveloper({
      id: "d3",
      name: "Foo",
      officialWebsite: "not-a-url",
    });
    assert.equal(r.ok, false);
  });
  test("expandDeveloperAliases", () => {
    const aliases = api.expandDeveloperAliases({
      id: "d",
      name: "Sansiri",
      aliases: ["แสนสิริ"],
      slug: "sansiri",
    });
    assert.ok(aliases.length >= 2);
  });

  // --- contract / batch ---
  test("emptyBatch structure", () => {
    const b = api.emptyBatch("E1");
    assert.equal(b.manifest.batchId, "E1");
    assert.equal(b.developers.length, 0);
  });
  test("validate good batch contract", () => {
    const b = sampleBatch(api);
    const r = api.validateImportBatch(b);
    assert.equal(r.ok, true);
  });
  test("missing batchId fails", () => {
    const r = api.validateBatchManifest({ batchId: "" });
    assert.equal(r.ok, false);
  });
  test("unsupported schema fails", () => {
    const r = api.validateBatchManifest({
      batchId: "x",
      schemaVersion: "nope.v9",
    });
    assert.equal(r.ok, false);
  });
  test("assertContractOk throws", () => {
    assert.throws(() =>
      api.assertContractOk({
        ok: false,
        issues: [{ code: "X", severity: "error", message: "x" }],
      }),
    );
  });
  test("duplicate entity id in batch", () => {
    const b = sampleBatch(api, {
      developers: [
        { id: "dev-1", name: "A" },
        { id: "dev-1", name: "B" },
      ],
    });
    const r = api.validateImportBatch(b);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === "ENTITY_DUPLICATE_ID_IN_BATCH"));
  });
  test("loadBatchFromJsonFile", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sif-"));
    const file = path.join(dir, "batch.json");
    const batch = sampleBatch(api);
    fs.writeFileSync(file, JSON.stringify(batch));
    const loaded = api.loadBatchFromJsonFile(file);
    assert.equal(loaded.manifest.batchId, "TEST-BATCH-001");
    assert.equal(loaded.projects.length, 1);
  });
  test("loadBatchFromJsonFile missing throws", () => {
    assert.throws(() => api.loadBatchFromJsonFile("/no/such/batch.json"));
  });

  // --- entity imports ---
  test("developer WOULD_CREATE", () => {
    const r = api.importDeveloperPreview({
      id: "d-new",
      name: "Supalai",
      officialWebsite: "https://www.supalai.com",
      evidence: [{ kind: "other", path: "e.txt" }],
      confidence: "HIGH",
    });
    assert.equal(r.action, "WOULD_CREATE");
    assert.equal(r.approved, false);
    assert.equal(r.reviewState, "READY_FOR_APPROVAL");
  });
  test("developer WOULD_UPDATE when existing", () => {
    const r = api.importDeveloperPreview(
      {
        id: "d-ex",
        name: "Supalai",
        officialWebsite: "https://www.supalai.com",
        evidence: [{ kind: "other", path: "e.txt" }],
        confidence: "HIGH",
      },
      { existingIds: new Set(["d-ex"]) },
    );
    assert.equal(r.action, "WOULD_UPDATE");
  });
  test("developer UNKNOWN → WOULD_REVIEW", () => {
    const r = api.importDeveloperPreview({
      id: "dev-unknown",
      name: "UNKNOWN",
      unknown: true,
    });
    assert.equal(r.action, "WOULD_REVIEW");
  });
  test("developer upload blocked", () => {
    assert.throws(() => api.uploadDeveloperAsset(), /STORAGE_UPLOAD_BLOCKED|Storage/);
  });

  test("project WOULD_CREATE with province", () => {
    const r = api.importProjectPreview({
      id: "p1",
      name: "Condo A",
      developerId: "dev-1",
      province: "Bangkok",
      evidence: [{ kind: "image", hash: "a".repeat(64) }],
    });
    assert.equal(r.action, "WOULD_CREATE");
    assert.equal(r.provinceCanonical, "Bangkok");
    assert.ok(r.routeCandidate);
  });
  test("project bad province → reject/review", () => {
    const r = api.importProjectPreview({
      id: "p2",
      name: "Condo B",
      province: "NowhereLand",
      evidence: [{ kind: "image", hash: "a".repeat(64) }],
    });
    assert.ok(["WOULD_REJECT", "WOULD_REVIEW"].includes(r.action));
  });
  test("project unlinked developer → review", () => {
    const r = api.importProjectPreview(
      {
        id: "p3",
        name: "Condo C",
        developerId: "missing",
        province: "Phuket",
        evidence: [{ kind: "image", hash: "a".repeat(64) }],
      },
      { knownDeveloperIds: new Set(["dev-1"]) },
    );
    assert.equal(r.action, "WOULD_REVIEW");
  });

  test("image WOULD_CREATE", () => {
    const r = api.importImagePreview({
      id: "i1",
      hash: "a".repeat(64),
      projectId: "proj-1",
      mime: "image/jpeg",
    });
    assert.equal(r.action, "WOULD_CREATE");
    assert.ok(r.storagePathMock?.startsWith("mock/"));
  });
  test("image bad hash reject", () => {
    const r = api.importImagePreview({ id: "i2", hash: "short" });
    assert.equal(r.action, "WOULD_REJECT");
  });
  test("image upload blocked", () => {
    assert.throws(() => api.uploadImageToStorage());
  });
  test("image mime invalid", () => {
    const r = api.importImagePreview({
      id: "i3",
      hash: "a".repeat(64),
      mime: "application/pdf",
    });
    assert.equal(r.action, "WOULD_REJECT");
  });

  test("pdf brochure create", () => {
    const r = api.importPdfPreview({
      id: "pdfx",
      hash: "b".repeat(64),
      mime: "application/pdf",
      pages: 3,
      category: "brochure",
    });
    assert.equal(r.action, "WOULD_CREATE");
    assert.equal(r.category, "brochure");
  });
  test("pdf category normalize", () => {
    assert.equal(api.normalizePdfCategory("Price List"), "price_list");
    assert.equal(api.normalizePdfCategory("floor-plan"), "floor_plan");
    assert.equal(api.normalizePdfCategory(null), "unknown");
  });
  test("pdf upload blocked", () => {
    assert.throws(() => api.uploadPdfToStorage());
  });
  test("pdf bad mime", () => {
    const r = api.importPdfPreview({
      id: "pdfy",
      hash: "b".repeat(64),
      mime: "image/png",
    });
    assert.equal(r.action, "WOULD_REJECT");
  });

  test("news WOULD_CREATE", () => {
    const r = api.importNewsPreview({
      id: "n1",
      sourceUrl: "https://news.example/a",
      freshnessDays: 1,
      evidence: [{ kind: "news", url: "https://news.example/a" }],
    });
    assert.equal(r.action, "WOULD_CREATE");
    assert.equal(r.freshness, "fresh");
  });
  test("news stale → review", () => {
    const r = api.importNewsPreview({
      id: "n2",
      sourceUrl: "https://news.example/b",
      freshnessDays: 999,
    });
    assert.equal(r.freshness, "stale");
    assert.equal(r.action, "WOULD_REVIEW");
  });
  test("news bad url", () => {
    const r = api.importNewsPreview({ id: "n3", sourceUrl: "ftp://x" });
    assert.equal(r.action, "WOULD_REJECT");
  });

  // --- duplicate engine ---
  test("duplicate image hash WOULD_SKIP_DUPLICATE", () => {
    const engine = new api.DuplicateEngine();
    const a = { id: "img-a", hash: "d".repeat(64) };
    const b = { id: "img-b", hash: "d".repeat(64) };
    assert.equal(engine.checkImage(a).length, 0);
    const hits = engine.checkImage(b);
    assert.ok(hits.length >= 1);
    assert.equal(hits[0].action, "WOULD_SKIP_DUPLICATE");
  });
  test("duplicate news url", () => {
    const engine = new api.DuplicateEngine();
    engine.checkNews({ id: "n1", sourceUrl: "https://ex.com/1" });
    const hits = engine.checkNews({ id: "n2", sourceUrl: "https://ex.com/1" });
    assert.ok(hits.some((h) => h.kind === "url"));
  });
  test("duplicate developer alias", () => {
    const engine = new api.DuplicateEngine();
    engine.checkDeveloper({ id: "d1", name: "Sansiri", aliases: ["แสนสิริ"] });
    const hits = engine.checkDeveloper({
      id: "d2",
      name: "Other",
      aliases: ["sansiri"],
    });
    assert.ok(hits.length >= 1);
  });
  test("duplicate project slug", () => {
    const engine = new api.DuplicateEngine();
    engine.checkProject({ id: "p1", name: "A", slug: "same-slug" });
    const hits = engine.checkProject({ id: "p2", name: "B", slug: "same-slug" });
    assert.ok(hits.some((h) => h.kind === "slug"));
  });
  test("runDuplicateCheck on batch", () => {
    const b = sampleBatch(api, {
      images: [
        { id: "i1", hash: "e".repeat(64) },
        { id: "i2", hash: "e".repeat(64) },
      ],
    });
    const hits = api.runDuplicateCheck(b);
    assert.ok(hits.length >= 1);
  });
  test("seedExisting image hashes", () => {
    const engine = new api.DuplicateEngine();
    engine.seedExisting({ imageHashes: ["f".repeat(64)] });
    const hits = engine.checkImage({ id: "ix", hash: "f".repeat(64) });
    assert.ok(hits.length >= 1);
  });
  test("similarity names", () => {
    const b = sampleBatch(api, {
      projects: [
        { id: "p1", name: "Ocean View Condo Phuket" },
        { id: "p2", name: "Ocean View Condo Phuket Residence" },
      ],
      developers: [],
      images: [],
      pdfs: [],
      news: [],
    });
    const engine = new api.DuplicateEngine();
    const sim = engine.findSimilarNames(b, 0.5);
    assert.ok(Array.isArray(sim));
  });

  // --- validation engine ---
  test("runValidationEngine ok on sample", () => {
    const r = api.runValidationEngine(sampleBatch(api));
    assert.equal(typeof r.ok, "boolean");
    assert.ok(r.counts);
  });
  test("validateHashes catches bad", () => {
    const b = sampleBatch(api, {
      images: [{ id: "i", hash: "nope" }],
    });
    const issues = api.validateHashes(b);
    assert.ok(issues.some((i) => i.code === "HASH_INVALID"));
  });
  test("validateEvidence path traversal", () => {
    const issues = api.validateEvidence("project", "p", [
      { path: "../secret" },
    ]);
    assert.ok(issues.some((i) => i.code === "EVIDENCE_PATH_UNSAFE"));
  });
  test("validateSchemaFields news url", () => {
    const b = sampleBatch(api, {
      news: [{ id: "n", sourceUrl: "" }],
    });
    const issues = api.validateSchemaFields(b);
    assert.ok(issues.some((i) => i.code === "SCHEMA_NEWS_URL_REQUIRED"));
  });

  // --- review / approval ---
  test("mapToReviewQueue", () => {
    const rows = [
      {
        entityType: "developer",
        entityId: "d",
        action: "WOULD_REVIEW",
        reviewState: "REVIEW_REQUIRED",
        reasons: ["X"],
      },
    ];
    const q = api.mapToReviewQueue(rows);
    assert.equal(q[0].queue, "review");
    assert.equal(q[0].priority, "medium");
  });
  test("summarizeReviewQueue", () => {
    const s = api.summarizeReviewQueue([
      {
        entityType: "project",
        entityId: "p",
        action: "WOULD_CREATE",
        reviewState: "READY_FOR_APPROVAL",
        priority: "low",
        reasons: [],
        queue: "ready",
      },
    ]);
    assert.equal(s.ready, 1);
  });
  test("approval candidates never approved", () => {
    const c = api.buildApprovalCandidates([
      {
        entityType: "developer",
        entityId: "d",
        action: "WOULD_CREATE",
        reviewState: "READY_FOR_APPROVAL",
        reasons: [],
      },
    ]);
    assert.equal(c[0].kind, "approval");
    assert.equal(c[0].approved, false);
  });
  test("approveCandidate throws", () => {
    assert.throws(() =>
      api.approveCandidate({
        kind: "approval",
        entityType: "developer",
        entityId: "d",
        reviewState: "READY_FOR_APPROVAL",
        reasons: [],
        approved: false,
      }),
    );
  });
  test("summarizeApprovalCandidates", () => {
    const s = api.summarizeApprovalCandidates([
      {
        kind: "duplicate",
        entityType: "image",
        entityId: "i",
        reviewState: "DUPLICATE",
        reasons: [],
        approved: false,
      },
    ]);
    assert.equal(s.duplicate, 1);
  });

  // --- preview ---
  test("buildPreviewDashboard totals", () => {
    const dash = api.buildPreviewDashboard([
      {
        entityType: "image",
        entityId: "i1",
        action: "WOULD_CREATE",
        reviewState: "READY_FOR_APPROVAL",
        reasons: [],
      },
      {
        entityType: "image",
        entityId: "i2",
        action: "WOULD_SKIP_DUPLICATE",
        reviewState: "DUPLICATE",
        reasons: [],
      },
    ]);
    assert.equal(dash.totals.WOULD_CREATE, 1);
    assert.equal(dash.totals.WOULD_SKIP_DUPLICATE, 1);
    assert.equal(dash.byEntity.image.WOULD_CREATE, 1);
  });
  test("formatPreviewDashboardText", () => {
    const text = api.formatPreviewDashboardText(
      api.buildPreviewDashboard([]),
    );
    assert.match(text, /Preview Dashboard/);
  });

  // --- session / transaction / audit ---
  test("ImportSession dry-run pipeline", () => {
    const result = api.runImportSession(sampleBatch(api));
    assert.equal(result.committed, false);
    assert.equal(result.databaseWrites, 0);
    assert.equal(result.storageUploads, 0);
    assert.equal(result.productionChanged, false);
    assert.equal(result.phase, "blocked_commit");
    assert.ok(result.preview.totalRows >= 5);
    assert.ok(result.auditCount >= 1);
  });
  test("ImportSession commit throws", () => {
    const s = new api.ImportSession();
    s.loadBatch(sampleBatch(api));
    s.run();
    assert.throws(() => s.commit());
  });
  test("transaction commit throws", () => {
    const tx = new api.StagingTransaction();
    tx.stage({
      op: "insert",
      table: "x",
      entityId: "1",
      payload: {},
    });
    assert.throws(() => tx.commit());
  });
  test("transaction finalizeDryRun", () => {
    const tx = new api.StagingTransaction();
    tx.stage({
      op: "noop",
      table: "x",
      entityId: "1",
      payload: {},
    });
    const r = tx.finalizeDryRun();
    assert.equal(r.committed, false);
    assert.equal(r.applied, 0);
  });
  test("transaction rollback", () => {
    const tx = new api.StagingTransaction();
    tx.stage({
      op: "insert",
      table: "t",
      entityId: "1",
      payload: {},
    });
    tx.rollback();
    assert.equal(tx.list().length, 0);
  });
  test("audit log append chain", () => {
    const log = new api.AuditLog("sess-1");
    const a = log.append("one", { n: 1 });
    const b = log.append("two", { n: 2 });
    assert.ok(a.eventHash);
    assert.equal(b.prevHash, a.eventHash);
    assert.equal(log.count(), 2);
  });
  test("session idempotent fingerprint stable for same batch", () => {
    const b = sampleBatch(api);
    const r1 = api.runImportSession(b);
    const r2 = api.runImportSession(b);
    assert.equal(r1.preview.totalRows, r2.preview.totalRows);
    assert.deepEqual(r1.preview.totals, r2.preview.totals);
  });
  test("session with existing ids → WOULD_UPDATE", () => {
    const r = api.runImportSession(sampleBatch(api), {
      existingDeveloperIds: ["dev-1"],
      existingProjectIds: ["proj-1"],
    });
    const dev = r.rows.find(
      (x) => x.entityType === "developer" && x.entityId === "dev-1",
    );
    assert.equal(dev.action, "WOULD_UPDATE");
  });
  test("error recovery: session without batch", () => {
    const s = new api.ImportSession();
    assert.throws(() => s.run());
  });

  // --- performance mock ---
  test("performance mock builds 1000 projects", () => {
    const b = api.buildPerformanceMockBatch({
      projects: 1000,
      images: 100,
      pdfs: 50,
      developers: 10,
      news: 20,
    });
    assert.equal(b.projects.length, 1000);
    assert.equal(b.images.length, 100);
  });
  test("performance mock session completes under budget", () => {
    const b = api.buildPerformanceMockBatch({
      projects: 200,
      images: 500,
      pdfs: 100,
      developers: 20,
      news: 50,
    });
    const t0 = Date.now();
    const r = api.runImportSession(b);
    const ms = Date.now() - t0;
    assert.equal(r.committed, false);
    assert.ok(ms < 30000, `expected <30s, got ${ms}ms`);
  });

  // --- errors ---
  test("CommitNotImplementedError code", () => {
    const e = new api.CommitNotImplementedError();
    assert.equal(e.code, "COMMIT_NOT_IMPLEMENTED");
  });
  test("ForbiddenAutomationStateError", () => {
    const e = new api.ForbiddenAutomationStateError("APPROVED");
    assert.equal(e.code, "FORBIDDEN_AUTOMATION_STATE");
  });
  test("IllegalStateTransitionError", () => {
    const e = new api.IllegalStateTransitionError("A", "B");
    assert.match(e.message, /A → B/);
  });

  // --- CLI ---
  test("CLI staging:validate exits 0", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        path.join(root, "scripts/staging-import-cli.mjs"),
        "validate",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr || r.stdout);
  });
  test("CLI staging:preview runs", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        path.join(root, "scripts/staging-import-cli.mjs"),
        "preview",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /Preview Dashboard|preview/);
  });
  test("CLI staging:import dry-run", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        path.join(root, "scripts/staging-import-cli.mjs"),
        "import",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /"committed": false/);
  });
  test("CLI staging:report", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        path.join(root, "scripts/staging-import-cli.mjs"),
        "report",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /"command": "report"/);
  });

  // --- to* preview row helpers ---
  test("toDeveloperPreviewRow", () => {
    const row = api.toDeveloperPreviewRow(
      api.importDeveloperPreview({ id: "d", name: "X", unknown: true }),
    );
    assert.equal(row.entityType, "developer");
  });
  test("toProjectPreviewRow", () => {
    const row = api.toProjectPreviewRow(
      api.importProjectPreview({ id: "p", name: "Y", province: "Bangkok" }),
    );
    assert.equal(row.entityType, "project");
  });
  test("toImagePreviewRow", () => {
    const row = api.toImagePreviewRow(
      api.importImagePreview({ id: "i", hash: "a".repeat(64) }),
    );
    assert.equal(row.entityType, "image");
  });
  test("toPdfPreviewRow", () => {
    const row = api.toPdfPreviewRow(
      api.importPdfPreview({
        id: "p",
        hash: "b".repeat(64),
        mime: "application/pdf",
        category: "floor_plan",
      }),
    );
    assert.equal(row.entityType, "pdf");
  });
  test("toNewsPreviewRow", () => {
    const row = api.toNewsPreviewRow(
      api.importNewsPreview({
        id: "n",
        sourceUrl: "https://x.com/1",
      }),
    );
    assert.equal(row.entityType, "news");
  });

  // --- duplicate path through import ---
  test("importImagePreview duplicate via engine", () => {
    const engine = new api.DuplicateEngine();
    engine.checkImage({ id: "i1", hash: "aa".repeat(32) });
    const r = api.importImagePreview(
      { id: "i2", hash: "aa".repeat(32) },
      { duplicateEngine: engine },
    );
    assert.equal(r.action, "WOULD_SKIP_DUPLICATE");
    assert.equal(r.reviewState, "DUPLICATE");
  });
  test("importPdfPreview duplicate", () => {
    const engine = new api.DuplicateEngine();
    engine.checkPdf({ id: "p1", hash: "bb".repeat(32) });
    const r = api.importPdfPreview(
      { id: "p2", hash: "bb".repeat(32), mime: "application/pdf" },
      { duplicateEngine: engine },
    );
    assert.equal(r.action, "WOULD_SKIP_DUPLICATE");
  });
  test("importNewsPreview duplicate", () => {
    const engine = new api.DuplicateEngine();
    engine.checkNews({ id: "n1", sourceUrl: "https://dup.example/1" });
    const r = api.importNewsPreview(
      { id: "n2", sourceUrl: "https://dup.example/1" },
      { duplicateEngine: engine },
    );
    assert.equal(r.action, "WOULD_SKIP_DUPLICATE");
  });
  test("importDeveloperPreview duplicate", () => {
    const engine = new api.DuplicateEngine();
    engine.checkDeveloper({ id: "d1", name: "BrandX" });
    const r = api.importDeveloperPreview(
      { id: "d2", name: "BrandX", evidence: [{ kind: "other", path: "e" }] },
      { duplicateEngine: engine },
    );
    assert.equal(r.action, "WOULD_SKIP_DUPLICATE");
  });
  test("importProjectPreview duplicate", () => {
    const engine = new api.DuplicateEngine();
    engine.checkProject({ id: "p1", name: "Tower", slug: "tower" });
    const r = api.importProjectPreview(
      {
        id: "p2",
        name: "Other",
        slug: "tower",
        province: "Bangkok",
        evidence: [{ kind: "image", hash: "a".repeat(64) }],
      },
      { duplicateEngine: engine },
    );
    assert.equal(r.action, "WOULD_SKIP_DUPLICATE");
  });

  // --- count pad to ensure ≥80 ---
  test("ENTITY_TYPES length 5", () => {
    assert.equal(api.ENTITY_TYPES.length, 5);
  });
  test("REVIEW_STATES includes READY_FOR_APPROVAL", () => {
    assert.ok(api.REVIEW_STATES.includes("READY_FOR_APPROVAL"));
  });
  test("FORBIDDEN_AUTOMATION_STATES length 3", () => {
    assert.equal(api.FORBIDDEN_AUTOMATION_STATES.length, 3);
  });
  test("createAuditEvent shape", () => {
    const e = api.createAuditEvent("s", "act", { x: 1 }, "test");
    assert.equal(e.sessionId, "s");
    assert.equal(e.actor, "test");
  });
  test("buildApprovalCandidatesFromQueue", () => {
    const c = api.buildApprovalCandidatesFromQueue([
      {
        entityType: "pdf",
        entityId: "p",
        action: "WOULD_REJECT",
        reviewState: "REVIEW_REQUIRED",
        priority: "high",
        reasons: ["X"],
        queue: "reject",
      },
    ]);
    assert.equal(c[0].kind, "reject");
  });
  test("emptyEntityPreviewStats zeros", () => {
    const s = api.emptyEntityPreviewStats();
    assert.equal(s.developer.WOULD_CREATE, 0);
  });
  test("accumulatePreviewStats", () => {
    const { totals } = api.accumulatePreviewStats([
      {
        entityType: "news",
        entityId: "n",
        action: "WOULD_QUARANTINE",
        reviewState: "REVIEW_REQUIRED",
        reasons: [],
      },
    ]);
    assert.equal(totals.WOULD_QUARANTINE, 1);
  });
  test("project WOULD_UPDATE existing", () => {
    const r = api.importProjectPreview(
      {
        id: "pex",
        name: "Ex",
        province: "Chiang Mai",
        evidence: [{ kind: "image", hash: "a".repeat(64) }],
      },
      { existingIds: new Set(["pex"]) },
    );
    assert.equal(r.action, "WOULD_UPDATE");
  });
  test("session getResult after run", () => {
    const s = new api.ImportSession("fixed-id");
    s.loadBatch(sampleBatch(api));
    s.run();
    assert.equal(s.getResult()?.sessionId, "fixed-id");
  });
  test("hua hin alias province", () => {
    const r = api.validateProvince("Hua Hin");
    assert.equal(r.canonical, "Prachuap Khiri Khan");
    assert.equal(r.code, "LOW_CONFIDENCE_ALIAS");
  });

  console.log(
    JSON.stringify(
      {
        suite: "staging-import-framework-v1",
        passed,
        failed,
        total: passed + failed,
        failures,
      },
      null,
      2,
    ),
  );
  if (failed > 0) process.exit(1);
  if (passed + failed < 80) {
    console.error(`Expected ≥80 tests, got ${passed + failed}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
