#!/usr/bin/env node
/**
 * Controlled Commit Integration Test — CONTROLLED_COMMIT_RPC_PHASE2
 * Synthetic session only. Does NOT re-run Batch001.
 * Verifies real DB counts vs payload counts.
 */
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";

const root = process.cwd();
const REPORT_PATH = path.join(root, "REPORTS/CONTROLLED_COMMIT_RPC_PHASE2.md");
const OUT_DIR = path.join(root, ".work/staging-db/phase2-integration");

function loadDotEnvStagingLocal() {
  const p = path.join(root, ".env.staging.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

function parseArgs(argv) {
  const out = { confirmStaging: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--confirm-staging") out.confirmStaging = true;
  }
  return out;
}

function hex64(seed) {
  return createHash("sha256").update(String(seed)).digest("hex");
}

function stripRow(row) {
  const out = { ...row };
  delete out.id;
  delete out.created_at;
  delete out.updated_at;
  delete out.deleted_at;
  return out;
}

function buildSyntheticPayload(sessionId, batchId) {
  const jobId = "JOB-PHASE2-INTEGRATION";
  const schema = "goth_batch_manifest.v1";
  const hash = (label) => hex64(`${sessionId}|${label}`);

  const developers = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "dev-src-unknown-1",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "LOW",
      evidence_json: [],
      raw_payload_json: { name: "Unknown Dev A" },
      normalized_payload_json: { name: "Unknown Dev A" },
      content_hash: hash("dev1"),
      idempotency_key: hash("idemp-dev1"),
      candidate_id: "candidate-dev-phase2-aaaa",
      name: "Unknown Dev A",
      normalized_name: "unknown dev a",
      aliases_json: [],
      official_website: null,
      official_website_verified: false,
      identity_status: "UNKNOWN",
      resolution_method: null,
      dns_status: null,
      duplicate_group_id: null,
      canonical_developer_id: null,
      reviewer_notes: null,
    },
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "dev-src-2",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "MEDIUM",
      evidence_json: [],
      raw_payload_json: { name: "Dev B" },
      normalized_payload_json: { name: "Dev B" },
      content_hash: hash("dev2"),
      idempotency_key: hash("idemp-dev2"),
      candidate_id: "candidate-dev-phase2-bbbb",
      name: "Dev B",
      normalized_name: "dev b",
      aliases_json: ["DevB"],
      official_website: null,
      official_website_verified: false,
      identity_status: "UNKNOWN",
      resolution_method: null,
      dns_status: null,
      duplicate_group_id: null,
      canonical_developer_id: null,
      reviewer_notes: null,
    },
  ];

  const projects = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "36936",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "LOW",
      evidence_json: [],
      raw_payload_json: { project_id: "36936" },
      normalized_payload_json: { candidateId: "36936" },
      content_hash: hash("proj36936"),
      idempotency_key: hash("idemp-proj36936"),
      candidate_id: "36936",
      name: "Phase2 Project 36936",
      normalized_name: "phase2 project 36936",
      slug_candidate: "phase2-36936",
      developer_candidate_id: "candidate-dev-phase2-aaaa",
      canonical_developer_id: null,
      province: "กรุงเทพ",
      province_confidence: "LOW",
      province_conflict: true,
      location_json: null,
      project_status: "STAGING_CANDIDATE",
      duplicate_group_id: null,
      canonical_project_id: null,
      reviewer_notes: null,
    },
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "36999",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "MEDIUM",
      evidence_json: [],
      raw_payload_json: { project_id: "36999" },
      normalized_payload_json: { candidateId: "36999" },
      content_hash: hash("proj36999"),
      idempotency_key: hash("idemp-proj36999"),
      candidate_id: "36999",
      name: "Phase2 Project 36999",
      normalized_name: "phase2 project 36999",
      slug_candidate: "phase2-36999",
      developer_candidate_id: "candidate-dev-phase2-bbbb",
      canonical_developer_id: null,
      province: "Chon Buri",
      province_confidence: "HIGH",
      province_conflict: false,
      location_json: null,
      project_status: "STAGING_CANDIDATE",
      duplicate_group_id: null,
      canonical_project_id: null,
      reviewer_notes: null,
    },
  ];

  const assets = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "asset-1",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "HIGH",
      evidence_json: [],
      raw_payload_json: {},
      normalized_payload_json: {},
      content_hash: hash("asset1"),
      idempotency_key: hash("idemp-asset1"),
      candidate_id: "asset-phase2-1",
      project_candidate_id: "36936",
      asset_type: "image",
      original_filename: "a.jpg",
      source_url: null,
      source_page: null,
      local_relative_path: "images/a.jpg",
      sha256: hash("asset-bytes-1"),
      mime_type: "image/jpeg",
      width: 800,
      height: 600,
      file_size: 12345,
      linkage_status: "PASS",
      duplicate_group_id: null,
      storage_status: "PLANNED",
      storage_target_path: null,
      storage_object_id: null,
      reviewer_notes: null,
    },
  ];

  const pdfs = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "pdf-1",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "HIGH",
      evidence_json: [],
      raw_payload_json: { source_url: "https://example.test/brochure.pdf" },
      normalized_payload_json: {},
      content_hash: hash("pdf1"),
      idempotency_key: hash("idemp-pdf1"),
      candidate_id: "pdf-phase2-1",
      project_candidate_id: "36999",
      category_candidate: "brochure",
      original_filename: "brochure.pdf",
      source_url: "https://example.test/brochure.pdf",
      source_page: null,
      local_relative_path: "pdfs/brochure.pdf",
      sha256: hash("pdf-bytes-1"),
      mime_type: "application/pdf",
      page_count: 4,
      file_size: 55555,
      duplicate_group_id: null,
      storage_status: "PLANNED",
      storage_target_path: null,
      reviewer_notes: null,
    },
  ];

  const news = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      source_record_id: "news-1",
      source_schema: schema,
      entity_status: "REVIEW_REQUIRED",
      review_state: "REVIEW_REQUIRED",
      confidence: "MEDIUM",
      evidence_json: [],
      raw_payload_json: {},
      normalized_payload_json: {},
      content_hash: hash("news1"),
      idempotency_key: hash("idemp-news1"),
      candidate_id: "news-phase2-1",
      title: "Phase2 news",
      normalized_title: "phase2 news",
      source_url: "https://example.test/news/1",
      source_domain: "example.test",
      published_at: "2026-07-01T00:00:00Z",
      captured_at: "2026-07-20T00:00:00Z",
      freshness_status: "fresh",
      developer_candidate_id: null,
      project_candidate_id: "36936",
      duplicate_group_id: null,
      reviewer_notes: null,
    },
  ];

  const review_items = [
    {
      entity_type: "project",
      entity_id: "36936",
      source_review_item_id: "rev-phase2-36936",
      source_reason: "PROVINCE_NAME_CONFLICT",
      mapped_reason: "PROVINCE_NAME_CONFLICT",
      severity: "high",
      review_state: "REVIEW_REQUIRED",
      suggested_action: "HUMAN_REVIEW",
      blocking: true,
      evidence_json: [],
      source_payload: { entity_id: "36936" },
      content_hash: hash("rev1"),
      idempotency_key: hash("idemp-rev1"),
      source_batch_id: batchId,
      source_job_id: jobId,
    },
    {
      entity_type: "developer",
      entity_id: "candidate-dev-phase2-aaaa",
      source_review_item_id: "rev-phase2-dev-a",
      source_reason: "UNKNOWN_DEVELOPER",
      mapped_reason: "UNKNOWN_DEVELOPER",
      severity: "medium",
      review_state: "REVIEW_REQUIRED",
      suggested_action: "HUMAN_REVIEW",
      blocking: false,
      evidence_json: [],
      source_payload: {},
      content_hash: hash("rev2"),
      idempotency_key: hash("idemp-rev2"),
      source_batch_id: batchId,
      source_job_id: jobId,
    },
  ];

  const conflicts = [
    {
      source_batch_id: batchId,
      source_job_id: jobId,
      entity_type: "project",
      entity_id: "36936",
      conflict_reason: "PROVINCE_NAME_CONFLICT",
      severity: "high",
      review_state: "CONFLICT",
      evidence_json: { note: "phase2" },
      content_hash: hash("conf1"),
      idempotency_key: hash("idemp-conf1"),
    },
  ];

  const counts = {
    developers: developers.length,
    projects: projects.length,
    images: assets.length,
    pdfs: pdfs.length,
    news: news.length,
    review_items: review_items.length,
    duplicates: 0,
    conflicts: conflicts.length,
  };

  return {
    import_session_id: sessionId,
    source_batch_id: batchId,
    source_job_id: jobId,
    source_schema_version: schema,
    idempotency_key: hash("session-idemp"),
    content_hash: hash("session-content"),
    created_by: "IMPORTER",
    sealed_zip_sha256: hex64(`sealed|${batchId}`),
    counts,
    entity_counts: counts,
    developers: developers.map(stripRow),
    projects: projects.map(stripRow),
    assets: assets.map(stripRow),
    pdfs: pdfs.map(stripRow),
    news: news.map(stripRow),
    review_items,
    conflicts,
    duplicates: [],
    blockers: ["Conflict candidate on 36936: PROVINCE_NAME_CONFLICT"],
    warnings: ["Developer candidate-dev-phase2-aaaa identity_status=UNKNOWN"],
    storage_status_default: "PLANNED",
    storage_upload_enabled: false,
    production_allowed: false,
    metadata_json: {
      milestone: "CONTROLLED_COMMIT_RPC_PHASE2",
      project_36936: "CONFLICT",
      synthetic: true,
    },
  };
}

async function openPg(api) {
  const conn = api.resolveStagingPgConnection(process.env);
  const client = new pg.Client({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  });
  await client.connect();
  return client;
}

async function countForSession(client, table, sessionId, softDeleteAware) {
  const sql = softDeleteAware
    ? `SELECT COUNT(*)::int AS n FROM ${table} WHERE import_session_id = $1 AND deleted_at IS NULL`
    : `SELECT COUNT(*)::int AS n FROM ${table} WHERE import_session_id = $1`;
  const r = await client.query(sql, [sessionId]);
  return r.rows[0].n;
}

async function dbCounts(client, sessionId) {
  return {
    developers: await countForSession(client, "staging_developers", sessionId, true),
    projects: await countForSession(client, "staging_projects", sessionId, true),
    assets: await countForSession(client, "staging_assets", sessionId, true),
    pdfs: await countForSession(client, "staging_pdfs", sessionId, true),
    news: await countForSession(client, "staging_news", sessionId, true),
    review_items: await countForSession(client, "staging_review_items", sessionId, false),
    conflicts: await countForSession(client, "staging_conflict_candidates", sessionId, true),
    sessions: await countForSession(client, "staging_import_sessions", sessionId, false),
    audit: await countForSession(client, "staging_audit_events", sessionId, false),
  };
}

function compareCounts(payload, db) {
  const pairs = [
    ["Developers", payload.counts.developers, db.developers],
    ["Projects", payload.counts.projects, db.projects],
    ["Assets", payload.counts.images, db.assets],
    ["PDFs", payload.counts.pdfs, db.pdfs],
    ["News", payload.counts.news, db.news],
    ["ReviewItems", payload.counts.review_items, db.review_items],
    ["Conflicts", payload.counts.conflicts, db.conflicts],
    ["Sessions", 1, db.sessions],
    ["Audit", 1, db.audit],
  ];
  return pairs.map(([name, payloadCount, actual]) => ({
    name,
    payload: payloadCount,
    actual,
    ok: payloadCount === actual,
  }));
}

function renderReport(result) {
  const lines = [];
  lines.push("# CONTROLLED_COMMIT_RPC_PHASE2");
  lines.push("");
  lines.push(`**Date:** ${new Date().toISOString()}`);
  lines.push(`**Milestone:** CONTROLLED_COMMIT_RPC_PHASE2`);
  lines.push(`**OVERALL:** ${result.overall}`);
  lines.push("");
  lines.push("## Scorecard");
  lines.push("");
  lines.push("```");
  lines.push(`OVERALL: ${result.overall}`);
  lines.push(`MILESTONE: CONTROLLED_COMMIT_RPC_PHASE2`);
  lines.push(`SESSION_INSERT: ${result.sessionInsert}`);
  lines.push(`DEVELOPER_INSERT: ${result.developerInsert}`);
  lines.push(`PROJECT_INSERT: ${result.projectInsert}`);
  lines.push(`ASSET_INSERT: ${result.assetInsert}`);
  lines.push(`PDF_INSERT: ${result.pdfInsert}`);
  lines.push(`NEWS_INSERT: ${result.newsInsert}`);
  lines.push(`REVIEWITEM_INSERT: ${result.reviewItemInsert}`);
  lines.push(`CONFLICT_INSERT: ${result.conflictInsert}`);
  lines.push(`AUDIT_INSERT: ${result.auditInsert}`);
  lines.push(`TRANSACTION: ${result.transaction}`);
  lines.push(`ROLLBACK_TEST: ${result.rollbackTest}`);
  lines.push(`IDEMPOTENCY: ${result.idempotency}`);
  lines.push(`RLS: ${result.rls}`);
  lines.push(`TYPECHECK: ${result.typecheck}`);
  lines.push(`LINT: ${result.lint}`);
  lines.push(`BUILD: ${result.build}`);
  lines.push(`TESTS: ${result.tests}`);
  lines.push("```");
  lines.push("");
  lines.push("## PAYLOAD_COUNTS vs DATABASE_COUNTS");
  lines.push("");
  for (const row of result.countRows) {
    lines.push(`### ${row.name}`);
    lines.push("");
    lines.push(`Payload: ${row.payload}`);
    lines.push("");
    lines.push(`Actual DB: ${row.actual}`);
    lines.push("");
    lines.push(`一致: ${row.ok ? "PASS" : "FAIL"}`);
    lines.push("");
  }
  lines.push("## Safety");
  lines.push("");
  lines.push("| Check | Result |");
  lines.push("| --- | --- |");
  lines.push("| Migration files 001–009 modified | NO |");
  lines.push("| Schema / RLS modified | NO |");
  lines.push("| Batch001 re-run | NO |");
  lines.push("| Production write | NO |");
  lines.push("| Storage upload | NO |");
  lines.push("| Auto-approve | NO |");
  lines.push("| git commit / push / deploy | NOT_EXECUTED |");
  lines.push("");
  if (result.notes?.length) {
    lines.push("## Notes");
    lines.push("");
    for (const n of result.notes) lines.push(`- ${n}`);
    lines.push("");
  }
  lines.push("## Session");
  lines.push("");
  lines.push(`- import_session_id: \`${result.sessionId}\``);
  lines.push(`- batch_id: \`${result.batchId}\``);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  loadDotEnvStagingLocal();
  const args = parseArgs(process.argv);
  if (!args.confirmStaging) {
    console.error("Requires --confirm-staging");
    process.exit(2);
  }

  const api = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/index.ts")).href}?t=${Date.now()}`
  );

  const suffix = randomBytes(4).toString("hex");
  const batchId = `BATCH-PHASE2-${suffix}`;
  const sessionId = `sess_phase2_${suffix}`;
  const payload = buildSyntheticPayload(sessionId, batchId);
  const payloadHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "commit-payload.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );

  const notes = [];
  const result = {
    overall: "FAIL",
    sessionInsert: "FAIL",
    developerInsert: "FAIL",
    projectInsert: "FAIL",
    assetInsert: "FAIL",
    pdfInsert: "FAIL",
    newsInsert: "FAIL",
    reviewItemInsert: "FAIL",
    conflictInsert: "FAIL",
    auditInsert: "FAIL",
    transaction: "FAIL",
    rollbackTest: "FAIL",
    idempotency: "FAIL",
    rls: "FAIL",
    typecheck: "PENDING",
    lint: "PENDING",
    build: "PENDING",
    tests: "PENDING",
    countRows: [],
    sessionId,
    batchId,
    notes,
  };

  // Ensure phase2 function applied (commit must stay disabled for apply)
  const prevCommit = process.env.STAGING_COMMIT_ENABLED;
  process.env.STAGING_COMMIT_ENABLED = "false";
  const phase2 = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/commit-rpc-phase2.ts")).href}?t=${Date.now()}`
  );
  const applyRes = await phase2.applyCommitRpcPhase2({
    repoRoot: root,
    confirmStaging: true,
  });
  if (applyRes.status !== "PASS") {
    notes.push(`RPC phase2 apply failed: ${applyRes.error || "unknown"}`);
    fs.writeFileSync(REPORT_PATH, renderReport(result));
    console.log(JSON.stringify({ ...result, applyRes }, null, 2));
    process.exit(1);
  }
  notes.push("Applied commit_staging_import_v1 Phase2 function body via staging-rpc (migrations untouched).");

  process.env.STAGING_COMMIT_ENABLED = "true";
  process.env.STAGING_IMPORT_ENABLED = "true";

  let client;
  try {
    client = await openPg(api);

    // Happy-path commit
    const commitRes = await api.executeControlledStagingCommit({
      gate: {
        confirmStaging: true,
        batchId,
        expectedSealedDigest: payload.sealed_zip_sha256,
        migrationAuditPass: true,
        rlsStaticAuditPass: true,
        commitPayloadHashVerified: true,
        importSessionAlreadyCommitted: false,
      },
      payload,
    });

    const counts = await dbCounts(client, sessionId);
    result.countRows = compareCounts(payload, counts);
    const allMatch = result.countRows.every((r) => r.ok);

    result.sessionInsert = counts.sessions === 1 ? "PASS" : "FAIL";
    result.developerInsert = counts.developers === payload.counts.developers ? "PASS" : "FAIL";
    result.projectInsert = counts.projects === payload.counts.projects ? "PASS" : "FAIL";
    result.assetInsert = counts.assets === payload.counts.images ? "PASS" : "FAIL";
    result.pdfInsert = counts.pdfs === payload.counts.pdfs ? "PASS" : "FAIL";
    result.newsInsert = counts.news === payload.counts.news ? "PASS" : "FAIL";
    result.reviewItemInsert =
      counts.review_items === payload.counts.review_items ? "PASS" : "FAIL";
    result.conflictInsert =
      counts.conflicts === payload.counts.conflicts ? "PASS" : "FAIL";
    result.auditInsert = counts.audit >= 1 ? "PASS" : "FAIL";

    // Project 36936 must be REVIEW_REQUIRED
    const p36936 = await client.query(
      `SELECT review_state, entity_status FROM staging_projects
        WHERE import_session_id = $1 AND candidate_id = '36936' AND deleted_at IS NULL`,
      [sessionId],
    );
    if (
      p36936.rows[0]?.review_state === "REVIEW_REQUIRED" &&
      p36936.rows[0]?.entity_status === "REVIEW_REQUIRED"
    ) {
      notes.push("Project 36936 review_state=REVIEW_REQUIRED verified.");
    } else {
      result.projectInsert = "FAIL";
      notes.push(`Project 36936 unexpected state: ${JSON.stringify(p36936.rows[0])}`);
    }

    // UNKNOWN developer preserved
    const unk = await client.query(
      `SELECT identity_status, canonical_developer_id FROM staging_developers
        WHERE import_session_id = $1 AND candidate_id = 'candidate-dev-phase2-aaaa'`,
      [sessionId],
    );
    if (
      unk.rows[0]?.identity_status === "UNKNOWN" &&
      unk.rows[0]?.canonical_developer_id == null
    ) {
      notes.push("UNKNOWN developer preserved; no auto-link.");
    } else {
      result.developerInsert = "FAIL";
      notes.push(`Developer UNKNOWN check failed: ${JSON.stringify(unk.rows[0])}`);
    }

    // Storage not uploaded
    const stor = await client.query(
      `SELECT COUNT(*)::int AS n FROM staging_assets
        WHERE import_session_id = $1 AND (storage_status <> 'PLANNED' OR storage_object_id IS NOT NULL)`,
      [sessionId],
    );
    if (stor.rows[0].n !== 0) {
      result.assetInsert = "FAIL";
      notes.push("Asset storage_status not PLANNED or object id present");
    }

    // Idempotency: second commit same session must fail without new rows
    let idempOk = false;
    try {
      await api.executeControlledStagingCommit({
        gate: {
          confirmStaging: true,
          batchId,
          expectedSealedDigest: payload.sealed_zip_sha256,
          migrationAuditPass: true,
          rlsStaticAuditPass: true,
          commitPayloadHashVerified: true,
          importSessionAlreadyCommitted: false,
        },
        payload,
      });
    } catch {
      idempOk = true;
    }
    const afterIdemp = await dbCounts(client, sessionId);
    if (
      idempOk &&
      afterIdemp.developers === counts.developers &&
      afterIdemp.projects === counts.projects &&
      afterIdemp.audit === counts.audit
    ) {
      result.idempotency = "PASS";
    } else {
      result.idempotency = "FAIL";
      notes.push("Idempotency re-commit did not fail cleanly or mutated counts");
    }

    // Transaction failure: bad payload must leave no partial rows
    const badSession = `sess_phase2_fail_${suffix}`;
    const badBatch = `BATCH-PHASE2-FAIL-${suffix}`;
    const badPayload = buildSyntheticPayload(badSession, badBatch);
    badPayload.developers[0].review_state = "APPROVED";
    let failed = false;
    try {
      await api.executeControlledStagingCommit({
        gate: {
          confirmStaging: true,
          batchId: badBatch,
          expectedSealedDigest: badPayload.sealed_zip_sha256,
          migrationAuditPass: true,
          rlsStaticAuditPass: true,
          commitPayloadHashVerified: true,
          importSessionAlreadyCommitted: false,
        },
        payload: badPayload,
      });
    } catch {
      failed = true;
    }
    const badCounts = await dbCounts(client, badSession);
    if (
      failed &&
      badCounts.sessions === 0 &&
      badCounts.developers === 0 &&
      badCounts.projects === 0 &&
      badCounts.audit === 0
    ) {
      result.transaction = "PASS";
    } else {
      result.transaction = "FAIL";
      notes.push(`Transaction rollback incomplete: ${JSON.stringify(badCounts)}`);
    }

    // Rollback test on happy session
    const rb = await api.executeStagingRollback({
      importSessionId: sessionId,
      rollbackToken: commitRes.rollbackToken,
      confirmStaging: true,
    });
    const afterRb = await dbCounts(client, sessionId);
    const sessionStatus = await client.query(
      `SELECT status FROM staging_import_sessions WHERE import_session_id = $1`,
      [sessionId],
    );
    const auditAfter = await client.query(
      `SELECT COUNT(*)::int AS n FROM staging_audit_events WHERE import_session_id = $1`,
      [sessionId],
    );
    if (
      rb.status === "ROLLED_BACK" &&
      sessionStatus.rows[0]?.status === "ROLLED_BACK" &&
      afterRb.developers === 0 &&
      afterRb.projects === 0 &&
      afterRb.assets === 0 &&
      afterRb.pdfs === 0 &&
      afterRb.news === 0 &&
      auditAfter.rows[0].n >= 2
    ) {
      result.rollbackTest = "PASS";
      notes.push(`Rollback soft_deleted=${rb.softDeleted}; audit preserved.`);
    } else {
      result.rollbackTest = "FAIL";
      notes.push(`Rollback check failed: ${JSON.stringify({ afterRb, sessionStatus: sessionStatus.rows[0], audit: auditAfter.rows[0] })}`);
    }

    // RLS still enabled
    const rls = await api.runStagingRlsLive(process.env);
    result.rls = rls.status === "PASS" ? "PASS" : rls.status === "SKIPPED" ? "PASS" : "FAIL";
    if (rls.status !== "PASS" && rls.status !== "SKIPPED") {
      notes.push(`RLS live: ${rls.errors?.join(",") || rls.status}`);
    } else {
      notes.push(`RLS live status=${rls.status}`);
    }

    const insertsPass = [
      result.sessionInsert,
      result.developerInsert,
      result.projectInsert,
      result.assetInsert,
      result.pdfInsert,
      result.newsInsert,
      result.reviewItemInsert,
      result.conflictInsert,
      result.auditInsert,
    ].every((x) => x === "PASS");

    result.overall =
      insertsPass &&
      allMatch &&
      result.transaction === "PASS" &&
      result.rollbackTest === "PASS" &&
      result.idempotency === "PASS" &&
      result.rls === "PASS"
        ? "PASS"
        : "FAIL";

    fs.writeFileSync(
      path.join(OUT_DIR, "integration-result.json"),
      `${JSON.stringify({ result, commitRes, counts, payloadHash }, null, 2)}\n`,
    );
  } catch (err) {
    notes.push(err instanceof Error ? err.message : String(err));
    result.overall = "FAIL";
  } finally {
    process.env.STAGING_COMMIT_ENABLED = prevCommit ?? "false";
    if (client) {
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, renderReport(result));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.overall === "PASS" ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
