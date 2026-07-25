/**
 * Goth Batch Adapter — Windows01 Goth Schema → site ImportBatch.
 * Boundary layer: staging-import core never sees Windows01 raw fields.
 *
 * DRY RUN ONLY. No DB / Storage / approve / publish.
 */

import fs from "node:fs";
import path from "node:path";

import {
  loadGothBatchManifest,
  validateGothBatchHashes,
  validateSealedZipContract,
} from "../../integrations/windows01/index.ts";
import type { ImportBatch } from "../types.ts";
import {
  adaptGothDevelopers,
  toImportDeveloper,
} from "./goth-developer-adapter.ts";
import { readJsonArray } from "./goth-helpers.ts";
import { adaptGothImages, toImportImage } from "./goth-image-adapter.ts";
import { adaptGothNewsList, toImportNews } from "./goth-news-adapter.ts";
import { adaptGothPdfs, toImportPdf } from "./goth-pdf-adapter.ts";
import {
  adaptGothProjects,
  toImportProject,
} from "./goth-project-adapter.ts";
import {
  adaptGothReviewItems,
  buildEntityReviewCandidates,
} from "./goth-review-adapter.ts";
import {
  EXPECTED_GOTH_BATCH_ID,
  EXPECTED_GOTH_JOB_ID,
  EXPECTED_GOTH_SCHEMA,
  GOTH_ADAPTER_VERSION,
  type GothAdapterContext,
  type GothAdapterResult,
} from "./goth-types.ts";

export type GothBatchAdapterOptions = {
  batchDir: string;
  zipPath?: string;
  sidecarPath?: string;
  externalManifestPath?: string;
  /** When set, enforce exact identity (defaults for Batch001). */
  expectBatchId?: string;
  expectJobId?: string;
  expectSchema?: string;
  enforceIdentity?: boolean;
};

export type GothInputValidation = {
  ok: boolean;
  errors: string[];
  sealedStatus: "PASS" | "FAIL" | "SKIPPED";
  hashStatus: "PASS" | "HASH_VALIDATION_FAILED" | "SKIPPED";
  batchId: string | null;
  jobId: string | null;
  schemaVersion: string | null;
};

export function validateGothBatchInput(
  options: GothBatchAdapterOptions,
): GothInputValidation {
  const errors: string[] = [];
  const batchDir = path.resolve(options.batchDir);
  if (!fs.existsSync(batchDir)) {
    return {
      ok: false,
      errors: [`BATCH_DIR_MISSING: ${batchDir}`],
      sealedStatus: "SKIPPED",
      hashStatus: "SKIPPED",
      batchId: null,
      jobId: null,
      schemaVersion: null,
    };
  }

  let manifest: ReturnType<typeof loadGothBatchManifest> | null = null;
  try {
    manifest = loadGothBatchManifest(batchDir);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const expectBatchId =
    options.expectBatchId ??
    (options.enforceIdentity === false ? null : EXPECTED_GOTH_BATCH_ID);
  const expectJobId =
    options.expectJobId ??
    (options.enforceIdentity === false ? null : EXPECTED_GOTH_JOB_ID);
  const expectSchema =
    options.expectSchema ??
    (options.enforceIdentity === false ? null : EXPECTED_GOTH_SCHEMA);

  if (manifest) {
    if (expectSchema && manifest.schema_version !== expectSchema) {
      errors.push(
        `SCHEMA_MISMATCH: expected ${expectSchema}, got ${manifest.schema_version}`,
      );
    }
    if (expectBatchId && manifest.batch_id !== expectBatchId) {
      errors.push(
        `BATCH_ID_MISMATCH: expected ${expectBatchId}, got ${manifest.batch_id}`,
      );
    }
    if (expectJobId && manifest.job_id !== expectJobId) {
      errors.push(
        `JOB_ID_MISMATCH: expected ${expectJobId}, got ${manifest.job_id}`,
      );
    }
  }

  let sealedStatus: GothInputValidation["sealedStatus"] = "SKIPPED";
  if (options.zipPath) {
    if (!fs.existsSync(options.zipPath)) {
      errors.push(`ZIP_MISSING: ${options.zipPath}`);
    } else if (!options.sidecarPath) {
      errors.push("SIDECAR_MISSING");
    } else if (!fs.existsSync(options.sidecarPath)) {
      errors.push(`SIDECAR_MISSING: ${options.sidecarPath}`);
    } else {
      const sealed = validateSealedZipContract({
        zipPath: options.zipPath,
        sidecarPath: options.sidecarPath,
        externalManifestPath: options.externalManifestPath,
        internalManifest: manifest,
      });
      sealedStatus = sealed.status;
      if (sealed.status !== "PASS") {
        errors.push(
          `SEALED_DIGEST_INVALID: ${sealed.reasons.join("; ") || "mismatch"}`,
        );
      }
    }
  }

  let hashStatus: GothInputValidation["hashStatus"] = "SKIPPED";
  if (manifest && errors.length === 0) {
    const hash = validateGothBatchHashes(batchDir, {
      zipPath: options.zipPath,
      zipSidecarPath: options.sidecarPath,
      externalManifestPath: options.externalManifestPath,
    });
    hashStatus = hash.status;
    if (hash.status !== "PASS") {
      errors.push(
        `HASH_VALIDATION_FAILED: ${hash.mismatches
          .slice(0, 5)
          .map((m) => `${m.path}:${m.source}`)
          .join(",")}`,
      );
    }
  }

  const requiredFiles = [
    "data/developers.json",
    "data/projects.json",
    "data/news.json",
    "data/review_queue.json",
    "manifests/images_manifest.json",
    "manifests/pdfs_manifest.json",
    "manifests/batch_manifest.json",
    "manifests/file_inventory.json",
    "manifests/SHA256SUMS.txt",
  ];
  for (const rel of requiredFiles) {
    if (!fs.existsSync(path.join(batchDir, rel))) {
      errors.push(`MISSING_DATA_FILE: ${rel}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    sealedStatus,
    hashStatus,
    batchId: manifest?.batch_id ?? null,
    jobId: manifest?.job_id ?? null,
    schemaVersion: manifest?.schema_version ?? null,
  };
}

export function adaptGothBatchFromDir(
  options: GothBatchAdapterOptions,
): GothAdapterResult {
  const validation = validateGothBatchInput(options);
  const batchDir = path.resolve(options.batchDir);
  const generatedAt = new Date().toISOString();

  if (!validation.ok) {
    return {
      ok: false,
      context: {
        batchId: validation.batchId ?? "UNKNOWN",
        jobId: validation.jobId ?? "UNKNOWN",
        schemaVersion: validation.schemaVersion ?? "UNKNOWN",
        batchDir,
        generatedAt,
      },
      importBatch: {
        manifest: {
          batchId: validation.batchId ?? "UNKNOWN",
          jobId: validation.jobId ?? undefined,
          schemaVersion: validation.schemaVersion ?? undefined,
          source: "windows01",
        },
        developers: [],
        projects: [],
        images: [],
        pdfs: [],
        news: [],
      },
      developers: [],
      projects: [],
      images: [],
      pdfs: [],
      news: [],
      reviewCandidates: [],
      unsupportedFields: [],
      blockers: validation.errors,
      validationErrors: validation.errors,
    };
  }

  const manifest = loadGothBatchManifest(batchDir);
  const ctx: GothAdapterContext = {
    batchId: manifest.batch_id,
    jobId: manifest.job_id,
    schemaVersion: manifest.schema_version,
    batchDir,
    generatedAt,
  };

  let developersRaw: Record<string, unknown>[];
  let projectsRaw: Record<string, unknown>[];
  let newsRaw: Record<string, unknown>[];
  let reviewRaw: Record<string, unknown>[];
  let imagesRaw: Record<string, unknown>[];
  let pdfsRaw: Record<string, unknown>[];

  try {
    developersRaw = readJsonArray(path.join(batchDir, "data/developers.json"));
    projectsRaw = readJsonArray(path.join(batchDir, "data/projects.json"));
    newsRaw = readJsonArray(path.join(batchDir, "data/news.json"));
    reviewRaw = readJsonArray(path.join(batchDir, "data/review_queue.json"));
    imagesRaw = readJsonArray(
      path.join(batchDir, "manifests/images_manifest.json"),
    );
    pdfsRaw = readJsonArray(path.join(batchDir, "manifests/pdfs_manifest.json"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      context: ctx,
      importBatch: {
        manifest: {
          batchId: ctx.batchId,
          jobId: ctx.jobId,
          schemaVersion: ctx.schemaVersion,
          source: "windows01",
        },
        developers: [],
        projects: [],
        images: [],
        pdfs: [],
        news: [],
      },
      developers: [],
      projects: [],
      images: [],
      pdfs: [],
      news: [],
      reviewCandidates: [],
      unsupportedFields: [],
      blockers: [message],
      validationErrors: [message],
    };
  }

  const developers = adaptGothDevelopers(developersRaw, ctx);
  const knownProjectIds = new Set(
    projectsRaw
      .map((p) => String(p.project_id ?? "").trim())
      .filter(Boolean),
  );
  const images = adaptGothImages(imagesRaw, ctx, knownProjectIds);
  const pdfs = adaptGothPdfs(pdfsRaw, ctx, knownProjectIds);
  const news = adaptGothNewsList(newsRaw, ctx);

  const imageIdsByProject = new Map<string, string[]>();
  for (const img of images) {
    if (!img.projectId) continue;
    const list = imageIdsByProject.get(img.projectId) ?? [];
    list.push(img.id);
    imageIdsByProject.set(img.projectId, list);
  }
  const pdfIdsByProject = new Map<string, string[]>();
  for (const pdf of pdfs) {
    if (!pdf.projectId) continue;
    const list = pdfIdsByProject.get(pdf.projectId) ?? [];
    list.push(pdf.id);
    pdfIdsByProject.set(pdf.projectId, list);
  }

  const projects = adaptGothProjects(projectsRaw, ctx, developers, {
    imageIdsByProject,
    pdfIdsByProject,
  });

  const sourceReview = adaptGothReviewItems(reviewRaw, generatedAt);
  const entityReview = buildEntityReviewCandidates({
    developers,
    projects,
    images,
    pdfs,
    news,
    createdAt: generatedAt,
  });
  const reviewCandidates = [...sourceReview, ...entityReview];

  const importBatch: ImportBatch = {
    manifest: {
      batchId: ctx.batchId,
      jobId: ctx.jobId,
      schemaVersion: ctx.schemaVersion,
      status: manifest.status,
      generatedAt: manifest.generated_at ?? generatedAt,
      source: "windows01",
      counts: {
        developer: developers.length,
        project: projects.length,
        image: images.length,
        pdf: pdfs.length,
        news: news.length,
        developers: developers.length,
        projects: projects.length,
        images: images.length,
        pdfs: pdfs.length,
        review_items: reviewRaw.length,
      },
    },
    developers: developers.map(toImportDeveloper),
    projects: projects.map(toImportProject),
    images: images.map(toImportImage),
    pdfs: pdfs.map(toImportPdf),
    news: news.map(toImportNews),
  };

  const unsupportedFields = [
    ...developers.map((d) => ({
      entityType: "developer",
      entityId: d.id,
      fields: d.unsupportedFields,
    })),
    ...projects.map((p) => ({
      entityType: "project",
      entityId: p.id,
      fields: p.unsupportedFields,
    })),
    ...images.map((i) => ({
      entityType: "image",
      entityId: i.id,
      fields: i.unsupportedFields,
    })),
    ...pdfs.map((p) => ({
      entityType: "pdf",
      entityId: p.id,
      fields: p.unsupportedFields,
    })),
    ...news.map((n) => ({
      entityType: "news",
      entityId: n.id,
      fields: n.unsupportedFields,
    })),
  ].filter((row) => row.fields.length > 0);

  return {
    ok: true,
    context: ctx,
    importBatch,
    developers,
    projects,
    images,
    pdfs,
    news,
    reviewCandidates,
    unsupportedFields,
    blockers: [],
    validationErrors: [],
  };
}

export { GOTH_ADAPTER_VERSION, EXPECTED_GOTH_BATCH_ID, EXPECTED_GOTH_JOB_ID, EXPECTED_GOTH_SCHEMA };
