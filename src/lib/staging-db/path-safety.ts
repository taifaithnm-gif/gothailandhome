/**
 * Path sanitization for storage plan candidates.
 * No absolute paths, no traversal, preserve extension, prevent overwrite collisions.
 */

import path from "node:path";

import { PathTraversalBlockedError } from "./errors.ts";

const UNSAFE_CHARS = /[^a-zA-Z0-9._-]+/g;

export function assertRelativeSafePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new PathTraversalBlockedError(input);
  }
  if (path.isAbsolute(trimmed) || /^[a-zA-Z]:[\\/]/.test(trimmed)) {
    throw new PathTraversalBlockedError(trimmed);
  }
  if (trimmed.includes("\0")) {
    throw new PathTraversalBlockedError(trimmed);
  }
  const normalized = trimmed.replace(/\\/g, "/");
  const parts = normalized.split("/");
  for (const part of parts) {
    if (part === ".." || part === ".") {
      throw new PathTraversalBlockedError(trimmed);
    }
  }
  if (normalized.startsWith("../") || normalized.includes("/../")) {
    throw new PathTraversalBlockedError(trimmed);
  }
  return normalized;
}

export function sanitizeFilename(filename: string): string {
  const base = path.basename(filename.replace(/\\/g, "/"));
  const ext = path.extname(base);
  const stem = path.basename(base, ext).replace(UNSAFE_CHARS, "_").slice(0, 80);
  const safeExt = ext.replace(UNSAFE_CHARS, "").toLowerCase().slice(0, 16);
  const safeStem = stem || "file";
  return `${safeStem}${safeExt}`;
}

export function buildStorageObjectPath(input: {
  batchId: string;
  entityType: "asset" | "pdf";
  entityId: string;
  originalFilename: string | null;
}): string {
  const batch = sanitizeFilename(input.batchId);
  const entity = sanitizeFilename(input.entityId);
  const file = sanitizeFilename(
    input.originalFilename ||
      `${input.entityType}-${input.entityId}${input.entityType === "pdf" ? ".pdf" : ".bin"}`,
  );
  const candidate = `staging/${batch}/${input.entityType}/${entity}/${file}`;
  return assertRelativeSafePath(candidate);
}
