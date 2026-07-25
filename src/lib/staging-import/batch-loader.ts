/**
 * Batch loader — loads ImportBatch from mock JSON or in-memory structures.
 * Does not unpack sealed ZIP to Production paths; dry-run / mock only.
 */

import fs from "node:fs";
import path from "node:path";

import { BatchLoadError } from "./errors.ts";
import type {
  BatchManifest,
  DeveloperCandidate,
  ImageCandidate,
  ImportBatch,
  NewsCandidate,
  PdfCandidate,
  ProjectCandidate,
} from "./types.ts";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function emptyBatch(batchId: string): ImportBatch {
  return {
    manifest: {
      batchId,
      schemaVersion: "staging_import_batch.v1",
      status: "MOCK",
      source: "mock",
      counts: {
        developer: 0,
        project: 0,
        image: 0,
        pdf: 0,
        news: 0,
      },
    },
    developers: [],
    projects: [],
    images: [],
    pdfs: [],
    news: [],
  };
}

export function createBatchFromParts(
  manifest: BatchManifest,
  parts: {
    developers?: DeveloperCandidate[];
    projects?: ProjectCandidate[];
    images?: ImageCandidate[];
    pdfs?: PdfCandidate[];
    news?: NewsCandidate[];
  },
): ImportBatch {
  const batch: ImportBatch = {
    manifest: {
      ...manifest,
      counts: {
        developer: parts.developers?.length ?? 0,
        project: parts.projects?.length ?? 0,
        image: parts.images?.length ?? 0,
        pdf: parts.pdfs?.length ?? 0,
        news: parts.news?.length ?? 0,
        ...manifest.counts,
      },
    },
    developers: parts.developers ?? [],
    projects: parts.projects ?? [],
    images: parts.images ?? [],
    pdfs: parts.pdfs ?? [],
    news: parts.news ?? [],
  };
  return batch;
}

/**
 * Load a staging_import_batch.v1 JSON file:
 * { manifest, developers, projects, images, pdfs, news }
 */
export function loadBatchFromJsonFile(filePath: string): ImportBatch {
  if (!fs.existsSync(filePath)) {
    throw new BatchLoadError(`Batch file not found: ${filePath}`);
  }
  const raw = readJson<Record<string, unknown>>(filePath);
  const manifestRaw = (raw.manifest ?? raw) as Record<string, unknown>;
  const batchId =
    String(manifestRaw.batchId ?? manifestRaw.batch_id ?? path.basename(filePath));
  return createBatchFromParts(
    {
      batchId,
      schemaVersion: String(
        manifestRaw.schemaVersion ??
          manifestRaw.schema_version ??
          "staging_import_batch.v1",
      ),
      jobId: manifestRaw.jobId
        ? String(manifestRaw.jobId)
        : manifestRaw.job_id
          ? String(manifestRaw.job_id)
          : undefined,
      status: manifestRaw.status ? String(manifestRaw.status) : "MOCK",
      generatedAt: manifestRaw.generatedAt
        ? String(manifestRaw.generatedAt)
        : manifestRaw.generated_at
          ? String(manifestRaw.generated_at)
          : undefined,
      source: "manual",
      counts: (manifestRaw.counts as BatchManifest["counts"]) ?? {},
    },
    {
      developers: asArray(raw.developers),
      projects: asArray(raw.projects),
      images: asArray(raw.images),
      pdfs: asArray(raw.pdfs),
      news: asArray(raw.news),
    },
  );
}

/** Build a synthetic large mock batch for performance baselines. */
export function buildPerformanceMockBatch(options: {
  batchId?: string;
  projects?: number;
  images?: number;
  pdfs?: number;
  developers?: number;
  news?: number;
}): ImportBatch {
  const projectCount = options.projects ?? 1000;
  const imageCount = options.images ?? 5000;
  const pdfCount = options.pdfs ?? 1000;
  const developerCount = options.developers ?? 50;
  const newsCount = options.news ?? 200;
  const batchId = options.batchId ?? "PERF-MOCK-1000";

  const developers: DeveloperCandidate[] = Array.from(
    { length: developerCount },
    (_, i) => ({
      id: `dev-${i + 1}`,
      name: `Developer ${i + 1}`,
      aliases: [`Dev Alias ${i + 1}`],
      confidence: "MEDIUM",
      evidence: [{ kind: "other", path: `evidence/dev-${i + 1}.txt` }],
    }),
  );

  const projects: ProjectCandidate[] = Array.from(
    { length: projectCount },
    (_, i) => ({
      id: `proj-${i + 1}`,
      name: `Project ${i + 1}`,
      developerId: `dev-${(i % developerCount) + 1}`,
      province: i % 7 === 0 ? "Bangkok" : i % 5 === 0 ? "Phuket" : "Chonburi",
      slug: `project-${i + 1}`,
      confidence: "MEDIUM",
      evidence: [
        {
          kind: "image",
          hash: `c${String(i + 1).padStart(63, "0")}`,
        },
      ],
    }),
  );

  const images: ImageCandidate[] = Array.from({ length: imageCount }, (_, i) => ({
    id: `img-${i + 1}`,
    hash: `a${String(i + 1).padStart(63, "0")}`,
    projectId: `proj-${(i % projectCount) + 1}`,
    storagePathMock: `mock/storage/images/img-${i + 1}.jpg`,
    mime: "image/jpeg",
    width: 1200,
    height: 800,
  }));

  const pdfs: PdfCandidate[] = Array.from({ length: pdfCount }, (_, i) => ({
    id: `pdf-${i + 1}`,
    hash: `b${String(i + 1).padStart(63, "0")}`,
    mime: "application/pdf",
    pages: (i % 20) + 1,
    category: i % 3 === 0 ? "brochure" : i % 3 === 1 ? "price_list" : "floor_plan",
    projectId: `proj-${(i % projectCount) + 1}`,
  }));

  const news: NewsCandidate[] = Array.from({ length: newsCount }, (_, i) => ({
    id: `news-${i + 1}`,
    sourceUrl: `https://example.com/news/${i + 1}`,
    developerId: `dev-${(i % developerCount) + 1}`,
    projectId: `proj-${(i % projectCount) + 1}`,
    title: `News ${i + 1}`,
    freshnessDays: i % 90,
  }));

  return createBatchFromParts(
    {
      batchId,
      schemaVersion: "staging_import_batch.v1",
      status: "MOCK",
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
    { developers, projects, images, pdfs, news },
  );
}
