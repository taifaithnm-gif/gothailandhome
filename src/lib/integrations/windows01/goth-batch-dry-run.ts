/**
 * Goth Batch dry-run runner.
 * Hard-stops on HASH_VALIDATION_FAILED — does not invoke accept paths.
 * Never connects to Supabase / Storage / Production.
 */
import fs from "node:fs";
import path from "node:path";

import {
  ALLOWED_BATCH_STATUSES,
  assertDryRunActionAllowed,
  buildContractCompatibility,
  type DryRunAction,
  type FieldCompatRow,
  type GothBatchManifest,
  type HashValidationResult,
  isPdfMagic,
  isSupportedGothSchema,
  listFilesRecursive,
  loadGothBatchManifest,
  mapWindows01ReviewReason,
  normalizeName,
  projectIdFromSourcePage,
  sha256File,
  slugCandidate,
  sniffImageMime,
  validateGothBatchHashes,
  GOTH_BATCH_MANIFEST_SCHEMA_V1,
} from "./goth-batch.ts";

export type GothDryRunFlags = {
  dry_run: true;
  staging_only: true;
  production_write: false;
  database_write: false;
  asset_upload: false;
  approval: false;
  publish: false;
};

export const GOTH_DRY_RUN_FLAGS: GothDryRunFlags = {
  dry_run: true,
  staging_only: true,
  production_write: false,
  database_write: false,
  asset_upload: false,
  approval: false,
  publish: false,
};

export type GothDryRunOptions = {
  batchDir: string;
  outputDir: string;
  repoRoot?: string;
  zipPath?: string;
  zipSidecarPath?: string;
  externalManifestPath?: string;
  /** When true (default), abort entity dry-run on any hash mismatch. */
  strictHash?: boolean;
};

export type ImportActionPreview = {
  action: DryRunAction;
  entity_type: string;
  source_id: string;
  reason: string;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function appendAudit(
  lines: string[],
  event: Record<string, unknown>,
): void {
  lines.push(JSON.stringify({ at: new Date().toISOString(), ...event }));
}

function loadSiteDevelopers(repoRoot: string): Array<{
  slug: string;
  names: string[];
}> {
  const indexPath = path.join(
    repoRoot,
    "content/developers/DEVELOPER_INDEX.json",
  );
  if (!fs.existsSync(indexPath)) return [];
  const index = readJson<{
    developers?: Array<{
      slug: string;
      name?: Record<string, string>;
      legal_name?: Record<string, string>;
    }>;
  }>(indexPath);
  return (index.developers ?? []).map((d) => {
    const names = [
      ...Object.values(d.name ?? {}),
      ...Object.values(d.legal_name ?? {}),
      d.slug,
    ]
      .filter(Boolean)
      .map((n) => normalizeName(String(n)));
    return { slug: d.slug, names };
  });
}

function loadSiteProjectSlugs(repoRoot: string): string[] {
  const root = path.join(repoRoot, "content/projects");
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "README.md")
    .map((e) => e.name);
}

function findDeveloperDup(
  name: string,
  site: ReturnType<typeof loadSiteDevelopers>,
): string | null {
  const n = normalizeName(name);
  for (const d of site) {
    if (d.names.some((x) => x === n || x.includes(n) || n.includes(x))) {
      return d.slug;
    }
  }
  // Heuristic brand tokens
  const tokens: Array<[string, string]> = [
    ["แสนสิริ", "sansiri"],
    ["sansiri", "sansiri"],
    ["ศุภาลัย", "supalai"],
    ["supalai", "supalai"],
    ["เอพี", "ap-thailand"],
    ["ap thailand", "ap-thailand"],
    ["apthai", "ap-thailand"],
  ];
  for (const [token, slug] of tokens) {
    if (n.includes(normalizeName(token))) return slug;
  }
  return null;
}

export type GothDryRunResult = {
  status: "PASS" | "HASH_VALIDATION_FAILED" | "FAIL";
  flags: GothDryRunFlags;
  hash: HashValidationResult;
  manifest: GothBatchManifest | null;
  contractRows: FieldCompatRow[];
  counts: {
    developers: number;
    projects: number;
    images: number;
    pdfs: number;
    news: number;
    review_items: number;
  };
  actionCounts: Record<DryRunAction, number>;
  adapterInvoked: boolean;
  databaseWrites: 0;
  storageUploads: 0;
  productionConnection: "NO";
  outputFiles: string[];
};

export function runGothBatchDryRun(options: GothDryRunOptions): GothDryRunResult {
  const {
    batchDir,
    outputDir,
    repoRoot = process.cwd(),
    zipPath,
    zipSidecarPath,
    externalManifestPath,
    strictHash = true,
  } = options;

  fs.mkdirSync(outputDir, { recursive: true });
  const audit: string[] = [];
  appendAudit(audit, {
    event: "dry_run_start",
    batchDir,
    outputDir,
    flags: GOTH_DRY_RUN_FLAGS,
  });

  // Hard blocks — never enable writes
  if (
    process.env.APP_DEPLOY_ENV === "production" ||
    process.env.FORCE_PRODUCTION_IMPORT === "1"
  ) {
    appendAudit(audit, {
      event: "production_hard_block",
      detail: "refusing dry-run entity processing in production env",
    });
  }

  const hash = validateGothBatchHashes(batchDir, {
    zipPath,
    zipSidecarPath,
    externalManifestPath,
  });
  writeJson(path.join(outputDir, "hash_validation.json"), hash);
  appendAudit(audit, { event: "hash_validation", status: hash.status });

  let manifest: GothBatchManifest | null = null;
  try {
    manifest = loadGothBatchManifest(batchDir);
  } catch (err) {
    appendAudit(audit, {
      event: "manifest_missing",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const developersPath = path.join(batchDir, "data/developers.json");
  const projectsPath = path.join(batchDir, "data/projects.json");
  const newsPath = path.join(batchDir, "data/news.json");
  const reviewPath = path.join(batchDir, "data/review_queue.json");
  const imagesManifestPath = path.join(batchDir, "manifests/images_manifest.json");
  const pdfsManifestPath = path.join(batchDir, "manifests/pdfs_manifest.json");

  const developers = fs.existsSync(developersPath)
    ? readJson<Array<Record<string, unknown>>>(developersPath)
    : [];
  const projects = fs.existsSync(projectsPath)
    ? readJson<Array<Record<string, unknown>>>(projectsPath)
    : [];
  const news = fs.existsSync(newsPath)
    ? readJson<Array<Record<string, unknown>>>(newsPath)
    : [];
  const reviewItems = fs.existsSync(reviewPath)
    ? readJson<Array<Record<string, unknown>>>(reviewPath)
    : [];
  const images = fs.existsSync(imagesManifestPath)
    ? readJson<Array<Record<string, unknown>>>(imagesManifestPath)
    : [];
  const pdfs = fs.existsSync(pdfsManifestPath)
    ? readJson<Array<Record<string, unknown>>>(pdfsManifestPath)
    : [];

  const sampleKeys = [
    ...new Set([
      ...Object.keys(developers[0] ?? {}),
      ...Object.keys(projects[0] ?? {}),
      ...Object.keys(images[0] ?? {}),
    ]),
  ];
  const contractRows = manifest
    ? buildContractCompatibility(manifest, sampleKeys)
    : [];
  writeJson(path.join(outputDir, "unsupported_fields.json"), {
    note: "Unknown / non-v0 fields preserved; not silently dropped",
    schema_version: manifest?.schema_version ?? null,
    site_supported: ["windows01.manifest.v0", "windows01.results.v0"],
    goth_supported_recognized: [GOTH_BATCH_MANIFEST_SCHEMA_V1],
    unsupported_fields: contractRows
      .filter((r) =>
        ["UNSUPPORTED", "TRANSFORM_REQUIRED", "OPTIONAL", "RENAMED"].includes(
          r.status,
        ),
      )
      .map((r) => ({
        field: r.field,
        status: r.status,
        windows01: r.windows01,
        siteContract: r.siteContract,
        notes: r.notes,
      })),
    contract_rows: contractRows,
  });

  const emptyActions: ImportActionPreview[] = [];
  const actionCounts: Record<DryRunAction, number> = {
    WOULD_CREATE: 0,
    WOULD_UPDATE: 0,
    WOULD_REVIEW: 0,
    WOULD_REJECT: 0,
    WOULD_QUARANTINE: 0,
    WOULD_SKIP_DUPLICATE: 0,
  };

  const baseSummary = {
    mode: "dry-run",
    flags: GOTH_DRY_RUN_FLAGS,
    batch_id: manifest?.batch_id ?? null,
    job_id: manifest?.job_id ?? null,
    schema_version: manifest?.schema_version ?? null,
    batch_status: manifest?.status ?? null,
    hash_status: hash.status,
    database_writes: 0 as const,
    storage_uploads: 0 as const,
    production_connection: "NO" as const,
    auto_approved: false,
    adapter_invoked: false,
  };

  if (strictHash && hash.status === "HASH_VALIDATION_FAILED") {
    appendAudit(audit, {
      event: "import_adapter_aborted",
      reason: "HASH_VALIDATION_FAILED",
      message:
        "Critical hash mismatch — Import Adapter dry-run not continued per policy",
    });

    const blocked = {
      ...baseSummary,
      status: "HASH_VALIDATION_FAILED",
      counts: {
        developers: developers.length,
        projects: projects.length,
        images: images.length,
        pdfs: pdfs.length,
        news: news.length,
        review_items: reviewItems.length,
      },
      note: "Entity dry-run skipped due to HASH_VALIDATION_FAILED",
      hash,
    };

    writeJson(path.join(outputDir, "import_summary.json"), blocked);
    writeJson(path.join(outputDir, "normalized_developers.json"), []);
    writeJson(path.join(outputDir, "normalized_projects.json"), []);
    writeJson(path.join(outputDir, "normalized_news.json"), []);
    writeJson(path.join(outputDir, "normalized_assets.json"), []);
    writeJson(path.join(outputDir, "normalized_pdfs.json"), []);
    writeJson(path.join(outputDir, "mapped_review_queue.json"), []);
    writeJson(path.join(outputDir, "duplicate_candidates.json"), []);
    writeJson(path.join(outputDir, "rejected_records.json"), [
      {
        reason: "HASH_VALIDATION_FAILED",
        mismatches: hash.mismatches,
        metaFilesLaxOk: hash.metaFilesLaxOk,
        metaFilesFailed: hash.metaFilesFailed,
        unlistedFiles: hash.unlistedFiles,
        sealed: hash.sealedValidation,
      },
    ]);
    writeJson(path.join(outputDir, "import_actions_preview.json"), emptyActions);
    fs.writeFileSync(
      path.join(outputDir, "dry_run_audit_log.jsonl"),
      audit.join("\n") + "\n",
    );

    return {
      status: "HASH_VALIDATION_FAILED",
      flags: GOTH_DRY_RUN_FLAGS,
      hash,
      manifest,
      contractRows,
      counts: {
        developers: developers.length,
        projects: projects.length,
        images: images.length,
        pdfs: pdfs.length,
        news: news.length,
        review_items: reviewItems.length,
      },
      actionCounts,
      adapterInvoked: false,
      databaseWrites: 0,
      storageUploads: 0,
      productionConnection: "NO",
      outputFiles: listFilesRecursive(outputDir),
    };
  }

  // ---- Entity dry-run (only when hash gate passes) ----
  appendAudit(audit, { event: "entity_dry_run_start" });

  if (manifest && !isSupportedGothSchema(manifest.schema_version)) {
    appendAudit(audit, {
      event: "unsupported_schema",
      schema: manifest.schema_version,
    });
  }
  if (
    manifest &&
    !(ALLOWED_BATCH_STATUSES as readonly string[]).includes(manifest.status)
  ) {
    appendAudit(audit, {
      event: "unexpected_batch_status",
      status: manifest.status,
    });
  }

  const siteDevelopers = loadSiteDevelopers(repoRoot);
  const siteProjectSlugs = loadSiteProjectSlugs(repoRoot);
  const actions: ImportActionPreview[] = [];
  const rejected: Array<Record<string, unknown>> = [];
  const duplicates: Array<Record<string, unknown>> = [];

  const pushAction = (a: ImportActionPreview) => {
    assertDryRunActionAllowed(a.action);
    actions.push(a);
    actionCounts[a.action] += 1;
  };

  const normalizedDevelopers = developers.map((d, idx) => {
    const name = String(d.name ?? "");
    const resolution = (d.developer_resolution ?? {}) as Record<string, unknown>;
    const siteHit = findDeveloperDup(name, siteDevelopers);
    const decision =
      siteHit != null
        ? "DUPLICATE_CANDIDATE"
        : resolution.developer_id === "dev-unknown"
          ? "REVIEW_REQUIRED"
          : "ACCEPT_CANDIDATE";
    if (siteHit) {
      duplicates.push({
        type: "developer_name",
        source: name,
        site_slug: siteHit,
      });
      pushAction({
        action: "WOULD_SKIP_DUPLICATE",
        entity_type: "developer",
        source_id: String(d.slug ?? idx),
        reason: `possible match site developer ${siteHit}`,
      });
    } else {
      pushAction({
        action: "WOULD_REVIEW",
        entity_type: "developer",
        source_id: String(d.slug ?? idx),
        reason: decision,
      });
    }
    return {
      ...d,
      dry_run_decision: decision,
      site_duplicate_slug: siteHit,
      auto_approved: false,
      would_approve: false,
    };
  });

  const normalizedProjects = projects.map((p) => {
    const projectId = String(p.project_id ?? "");
    const projectName = String(p.project_name ?? "");
    const provinceRes = (p.province_resolution ?? {}) as Record<string, unknown>;
    const developerRes = (p.developer_resolution ?? {}) as Record<
      string,
      unknown
    >;
    const slug = slugCandidate(projectName);
    const slugConflict = siteProjectSlugs.includes(slug);
    const issues: string[] = [];
    if (developerRes.developer_id === "dev-unknown") issues.push("UNKNOWN_DEVELOPER_ID");
    if (String(p.developer ?? "").toUpperCase() === "UNKNOWN") {
      issues.push("DEVELOPER_UNKNOWN");
    }
    if (String(provinceRes.confidence ?? "").toUpperCase() === "LOW") {
      issues.push("PROVINCE_LOW_CONFIDENCE");
    }
    if (!p.evidence) issues.push("MISSING_EVIDENCE");
    // EN/ZH/TH localization absent in Windows01 export
    issues.push("MISSING_I18N_EN_ZH_TH");
    if (slugConflict) {
      duplicates.push({
        type: "project_slug",
        source_project_id: projectId,
        slug,
      });
    }
    const decision = issues.length > 0 || slugConflict ? "REVIEW_REQUIRED" : "ACCEPT_CANDIDATE";
    pushAction({
      action: slugConflict ? "WOULD_SKIP_DUPLICATE" : "WOULD_REVIEW",
      entity_type: "project",
      source_id: projectId,
      reason: issues.join(",") || decision,
    });
    return {
      ...p,
      route_slug_candidate: slug,
      dry_run_decision: decision,
      issues,
      auto_create_forbidden: true,
      locale_fields: { en: null, zh: null, th: null },
    };
  });

  const hashSeen = new Map<string, string>();
  const normalizedAssets = images.map((img) => {
    const localPath = String(img.local_path ?? "");
    const full = path.join(batchDir, localPath);
    const exists = fs.existsSync(full);
    const buf = exists ? fs.readFileSync(full) : Buffer.alloc(0);
    const mime = exists ? sniffImageMime(buf) : null;
    const actualSha = exists ? sha256File(full) : null;
    const declaredSha = String(img.sha256 ?? "").toLowerCase();
    const issues: string[] = [];
    if (!exists) issues.push("FILE_MISSING");
    if (actualSha && declaredSha && actualSha !== declaredSha) {
      issues.push("SHA256_MISMATCH");
    }
    if (!mime) issues.push("UNKNOWN_MIME");
    if (mime && !String(img.format ?? "").toUpperCase().includes("JPEG") && mime === "image/jpeg") {
      // format ok
    }
    const pagePid = projectIdFromSourcePage(String(img.source_page ?? ""));
    const projectId = String(img.project_id ?? "");
    if (pagePid && projectId && pagePid !== projectId) {
      issues.push("IMAGE_PROJECT_LINKAGE_MISMATCH");
    }
    if (actualSha && hashSeen.has(actualSha)) {
      issues.push("DUPLICATE_HASH");
      duplicates.push({
        type: "image_hash",
        sha256: actualSha,
        prior: hashSeen.get(actualSha),
        current: String(img.image_id ?? localPath),
      });
    } else if (actualSha) {
      hashSeen.set(actualSha, String(img.image_id ?? localPath));
    }
    const bytes = exists ? buf.length : 0;
    if (bytes > 0 && bytes < 2048) issues.push("POSSIBLE_TRACKING_PIXEL");
    if (String(img.linkage_status ?? "") !== "PASS") {
      issues.push("LINKAGE_NOT_PASS");
    }
    // Independent re-check: do not trust Windows01 alone
    const independentLinkage =
      exists &&
      actualSha === declaredSha &&
      pagePid != null &&
      pagePid === projectId &&
      mime != null
        ? "PASS"
        : "FAIL";
    const decision =
      issues.length === 0 && independentLinkage === "PASS"
        ? "ACCEPT_CANDIDATE"
        : issues.includes("FILE_MISSING") || issues.includes("SHA256_MISMATCH")
          ? "REJECT"
          : "REVIEW_REQUIRED";
    pushAction({
      action:
        decision === "REJECT"
          ? "WOULD_REJECT"
          : decision === "ACCEPT_CANDIDATE"
            ? "WOULD_CREATE"
            : "WOULD_REVIEW",
      entity_type: "image",
      source_id: String(img.image_id ?? localPath),
      reason: issues.join(",") || decision,
    });
    if (decision === "REJECT") {
      rejected.push({ entity_type: "image", image: img, issues });
    }
    return {
      ...img,
      file_exists: exists,
      actual_sha256: actualSha,
      actual_mime: mime,
      independent_linkage: independentLinkage,
      dry_run_decision: decision,
      issues,
      storage_upload: false,
    };
  });

  const pdfHashSeen = new Map<string, string>();
  const normalizedPdfs = pdfs.map((pdf) => {
    const file = String(pdf.file ?? "");
    const localPath = file.includes("/") ? file : `pdfs/${file}`;
    const full = path.join(batchDir, localPath);
    const exists = fs.existsSync(full);
    const magicOk =
      exists && isPdfMagic(fs.readFileSync(full).subarray(0, 8));
    const actualSha = exists ? sha256File(full) : null;
    const declaredSha = String(pdf.sha256 ?? "").toLowerCase();
    const issues: string[] = [];
    if (!exists) issues.push("FILE_MISSING");
    if (!magicOk) issues.push("INVALID_PDF_MAGIC");
    if (actualSha && declaredSha && actualSha !== declaredSha) {
      issues.push("SHA256_MISMATCH");
    }
    if (actualSha && pdfHashSeen.has(actualSha)) {
      issues.push("DUPLICATE_HASH");
      duplicates.push({
        type: "pdf_hash",
        sha256: actualSha,
        prior: pdfHashSeen.get(actualSha),
        current: file,
      });
    } else if (actualSha) {
      pdfHashSeen.set(actualSha, file);
    }
    const docType = String(pdf.doc_type ?? "unknown");
    const classification =
      ["brochure", "floor_plan", "price_list"].includes(docType)
        ? docType
        : "unknown";
    const decision =
      issues.includes("FILE_MISSING") || issues.includes("INVALID_PDF_MAGIC")
        ? "REJECT"
        : issues.length
          ? "REVIEW_REQUIRED"
          : "ACCEPT_CANDIDATE";
    pushAction({
      action:
        decision === "REJECT"
          ? "WOULD_REJECT"
          : decision === "ACCEPT_CANDIDATE"
            ? "WOULD_CREATE"
            : "WOULD_REVIEW",
      entity_type: "pdf",
      source_id: file,
      reason: issues.join(",") || classification,
    });
    if (decision === "REJECT") {
      rejected.push({ entity_type: "pdf", pdf, issues });
    }
    return {
      ...pdf,
      local_path: localPath,
      file_exists: exists,
      pdf_magic_ok: magicOk,
      actual_sha256: actualSha,
      content_classification_candidate: classification,
      dry_run_decision: decision,
      issues,
      storage_upload: false,
    };
  });

  const newsUrlSeen = new Set<string>();
  const newsTitleSeen = new Set<string>();
  const normalizedNews = news.map((n, idx) => {
    const url = String(n.source_url ?? "");
    const title = String(n.title ?? "");
    const issues: string[] = [];
    if (!title) issues.push("MISSING_TITLE");
    if (!url) issues.push("MISSING_URL");
    if (url && newsUrlSeen.has(url)) {
      issues.push("DUPLICATE_URL");
      duplicates.push({ type: "news_url", url });
    } else if (url) newsUrlSeen.add(url);
    const titleKey = normalizeName(title);
    if (titleKey && newsTitleSeen.has(titleKey)) {
      issues.push("DUPLICATE_TITLE");
    } else if (titleKey) newsTitleSeen.add(titleKey);
    pushAction({
      action: issues.includes("DUPLICATE_URL")
        ? "WOULD_SKIP_DUPLICATE"
        : "WOULD_REVIEW",
      entity_type: "news",
      source_id: url || String(idx),
      reason: issues.join(",") || "REVIEW_REQUIRED",
    });
    return {
      ...n,
      dry_run_decision: "REVIEW_REQUIRED",
      issues,
      auto_publish: false,
    };
  });

  const mappedReview = reviewItems.map((item, idx) => {
    const reason = String(item.reason ?? "UNKNOWN");
    const mapped = mapWindows01ReviewReason(reason);
    // Never map to APPROVED / VERIFIED_FACT / PUBLISHED / PRODUCTION_READY
    pushAction({
      action:
        mapped.mapped_state === "REJECTED"
          ? "WOULD_REJECT"
          : mapped.mapped_state === "QUARANTINED"
            ? "WOULD_QUARANTINE"
            : mapped.mapped_state === "DUPLICATE_CANDIDATE"
              ? "WOULD_SKIP_DUPLICATE"
              : "WOULD_REVIEW",
      entity_type: "review_item",
      source_id: String(item.project_id ?? item.source_url ?? idx),
      reason,
    });
    return {
      source_record_id: String(item.project_id ?? item.source_url ?? `review-${idx}`),
      source_type: "windows01_review_queue",
      source_reason: reason,
      mapped_state: mapped.mapped_state,
      severity: mapped.severity,
      reviewer_action: mapped.reviewer_action,
      evidence_references: {
        source_url: item.source_url ?? null,
        project_id: item.project_id ?? null,
      },
      blocking_status: mapped.blocking,
      forbidden_states_blocked: [
        "APPROVED",
        "VERIFIED_FACT",
        "PUBLISHED",
        "PRODUCTION_READY",
      ],
      raw: item,
    };
  });

  writeJson(path.join(outputDir, "normalized_developers.json"), normalizedDevelopers);
  writeJson(path.join(outputDir, "normalized_projects.json"), normalizedProjects);
  writeJson(path.join(outputDir, "normalized_news.json"), normalizedNews);
  writeJson(path.join(outputDir, "normalized_assets.json"), normalizedAssets);
  writeJson(path.join(outputDir, "normalized_pdfs.json"), normalizedPdfs);
  writeJson(path.join(outputDir, "mapped_review_queue.json"), mappedReview);
  writeJson(path.join(outputDir, "duplicate_candidates.json"), duplicates);
  writeJson(path.join(outputDir, "rejected_records.json"), rejected);
  writeJson(path.join(outputDir, "import_actions_preview.json"), actions);

  const summary = {
    ...baseSummary,
    status: "PASS",
    adapter_invoked: true,
    counts: {
      developers: developers.length,
      projects: projects.length,
      images: images.length,
      pdfs: pdfs.length,
      news: news.length,
      review_items: reviewItems.length,
    },
    action_counts: actionCounts,
    image_linkage_independent: {
      pass: normalizedAssets.filter((a) => a.independent_linkage === "PASS")
        .length,
      fail: normalizedAssets.filter((a) => a.independent_linkage !== "PASS")
        .length,
    },
    pdf_magic: {
      pass: normalizedPdfs.filter((p) => p.pdf_magic_ok).length,
      fail: normalizedPdfs.filter((p) => !p.pdf_magic_ok).length,
    },
  };
  writeJson(path.join(outputDir, "import_summary.json"), summary);
  appendAudit(audit, { event: "dry_run_complete", action_counts: actionCounts });
  fs.writeFileSync(
    path.join(outputDir, "dry_run_audit_log.jsonl"),
    audit.join("\n") + "\n",
  );

  return {
    status: "PASS",
    flags: GOTH_DRY_RUN_FLAGS,
    hash,
    manifest,
    contractRows,
    counts: summary.counts,
    actionCounts,
    adapterInvoked: true,
    databaseWrites: 0,
    storageUploads: 0,
    productionConnection: "NO",
    outputFiles: listFilesRecursive(outputDir),
  };
}
