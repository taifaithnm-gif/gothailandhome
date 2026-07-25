/**
 * Shared Goth adapter helpers (hashing, paths, field capture).
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { ConfidenceLevel } from "../types.ts";
import type { GothSourceMeta } from "./goth-types.ts";

export const KNOWN_GOTH_DEVELOPER_FIELDS = new Set([
  "name",
  "slug",
  "source_url",
  "official_website",
  "official_website_verified",
  "project_count_observed",
  "developer_resolution",
  "captured_at",
  "aliases",
]);

export const KNOWN_GOTH_PROJECT_FIELDS = new Set([
  "project_id",
  "developer",
  "developer_resolution",
  "project_name",
  "province",
  "province_resolution",
  "price",
  "source_url",
  "source_domain",
  "status",
  "evidence",
  "captured_at",
  "location",
]);

export const KNOWN_GOTH_IMAGE_FIELDS = new Set([
  "image_id",
  "project_id",
  "project_name",
  "source_page",
  "source_url",
  "source_domain",
  "local_path",
  "sha256",
  "bytes",
  "width",
  "height",
  "format",
  "captured_at",
  "linkage_status",
  "linkage_issues",
]);

export const KNOWN_GOTH_PDF_FIELDS = new Set([
  "file",
  "doc_type",
  "source_url",
  "source_page",
  "project_id",
  "sha256",
  "bytes",
  "page_count",
  "captured_at",
]);

export const KNOWN_GOTH_NEWS_FIELDS = new Set([
  "title",
  "source_url",
  "source_domain",
  "domain",
  "sha256",
  "retrieved_at",
  "discovered_at",
  "published_at",
  "captured_at",
  "developer_id",
  "project_id",
]);

export function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugCandidate(value: string): string {
  return normalizeName(value)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0e00-\u0e7f-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function unknownFields(
  raw: Record<string, unknown>,
  known: Set<string>,
): string[] {
  return Object.keys(raw).filter((k) => !known.has(k)).sort();
}

export function toConfidence(value: unknown): ConfidenceLevel {
  const v = String(value ?? "UNKNOWN").toUpperCase();
  if (v === "HIGH" || v === "MEDIUM" || v === "LOW") return v;
  return "UNKNOWN";
}

export function safeRelativePath(
  batchDir: string,
  candidate: string | null | undefined,
): string | null {
  if (!candidate) return null;
  const normalized = candidate.replace(/\\/g, "/").replace(/^\/+/, "");
  if (
    normalized.includes("..") ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized)
  ) {
    return null;
  }
  const full = path.resolve(batchDir, normalized);
  const root = path.resolve(batchDir);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  return normalized.split(path.sep).join("/");
}

export function buildProvenance(options: {
  sourceRecordId: string;
  batchId: string;
  jobId: string;
  schemaVersion: string;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  capturedAt?: string | null;
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  confidence?: ConfidenceLevel;
  reviewReason?: string | null;
}): GothSourceMeta {
  return {
    sourceRecordId: options.sourceRecordId,
    sourceSchema: options.schemaVersion,
    sourceBatchId: options.batchId,
    sourceJobId: options.jobId,
    sourceUrl: options.sourceUrl ?? null,
    sourceDomain: options.sourceDomain ?? null,
    capturedAt: options.capturedAt ?? null,
    rawPayload: options.rawPayload,
    unsupportedFields: options.unsupportedFields,
    confidence: options.confidence,
    reviewReason: options.reviewReason ?? null,
  };
}

export function readJsonArray(filePath: string): Record<string, unknown>[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`MISSING_DATA_FILE: ${filePath}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    throw new Error(
      `INVALID_JSON: ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`INVALID_JSON_ARRAY: ${filePath}`);
  }
  return parsed as Record<string, unknown>[];
}

export function projectIdFromSourcePage(
  sourcePage: string | null | undefined,
): string | null {
  if (!sourcePage) return null;
  const m = /\/projects\/show\/(\d+)/i.exec(sourcePage);
  return m?.[1] ?? null;
}

export function sniffImageMime(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (buf.length >= 6 && buf.subarray(0, 6).toString("ascii") === "GIF87a") {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function isPdfMagic(buf: Buffer): boolean {
  return buf.length >= 4 && buf.subarray(0, 4).toString("utf8") === "%PDF";
}

export function looksLikeHtml(buf: Buffer): boolean {
  const head = buf.subarray(0, Math.min(buf.length, 512)).toString("utf8").toLowerCase();
  return (
    head.includes("<!doctype html") ||
    head.includes("<html") ||
    head.trimStart().startsWith("<")
  );
}

/** Minimal JPEG SOF dimension reader (no external deps). */
export function readJpegDimensions(
  buf: Buffer,
): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1]!;
    if (marker === 0xd9 || marker === 0xda) break;
    const len = (buf[i + 2]! << 8) + buf[i + 3]!;
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = (buf[i + 5]! << 8) + buf[i + 6]!;
      const width = (buf[i + 7]! << 8) + buf[i + 8]!;
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

export function estimatePdfPageCount(buf: Buffer): number | null {
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page\b/g);
  if (!matches || matches.length === 0) return null;
  return matches.length;
}

export function domainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function daysBetween(isoA: string, isoB: string): number | null {
  const a = Date.parse(isoA);
  const b = Date.parse(isoB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function assertNoAbsolutePathLeak(payload: unknown): void {
  const text = JSON.stringify(payload);
  if (/\/Users\/|\/Volumes\/|\\\\|C:\\\\/i.test(text)) {
    throw new Error("ABSOLUTE_PATH_LEAK_DETECTED");
  }
}
