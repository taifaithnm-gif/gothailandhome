/**
 * Batch / package contract validation.
 */

import { ContractValidationError } from "./errors.ts";
import type { BatchManifest, ImportBatch, ValidationIssue } from "./types.ts";

/** Must stay aligned with GOTH_BATCH_MANIFEST_SCHEMA_V1 (windows01/contract-versions). */
export const SUPPORTED_BATCH_SCHEMA_VERSIONS = [
  "goth_batch_manifest.v1",
  "staging_import_batch.v1",
  "windows01.manifest.v0",
] as const;

export type ContractValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export function validateBatchManifest(
  manifest: BatchManifest,
): ContractValidationResult {
  const issues: ValidationIssue[] = [];
  if (!manifest.batchId || !String(manifest.batchId).trim()) {
    issues.push({
      code: "MANIFEST_MISSING_BATCH_ID",
      severity: "error",
      message: "batchId is required",
      field: "batchId",
    });
  }
  if (
    manifest.schemaVersion &&
    !(SUPPORTED_BATCH_SCHEMA_VERSIONS as readonly string[]).includes(
      manifest.schemaVersion,
    )
  ) {
    issues.push({
      code: "MANIFEST_UNSUPPORTED_SCHEMA",
      severity: "error",
      message: `Unsupported schemaVersion: ${manifest.schemaVersion}`,
      field: "schemaVersion",
    });
  }
  if (
    manifest.status &&
    !["READY_FOR_STAGING_REVIEW", "CONDITIONAL_READY", "MOCK"].includes(
      manifest.status,
    )
  ) {
    issues.push({
      code: "MANIFEST_STATUS_REVIEW",
      severity: "warning",
      message: `Unexpected batch status: ${manifest.status}`,
      field: "status",
    });
  }
  return { ok: issues.every((i) => i.severity !== "error"), issues };
}

export function validateImportBatch(batch: ImportBatch): ContractValidationResult {
  const issues: ValidationIssue[] = [
    ...validateBatchManifest(batch.manifest).issues,
  ];

  const counts = {
    developer: batch.developers.length,
    project: batch.projects.length,
    image: batch.images.length,
    pdf: batch.pdfs.length,
    news: batch.news.length,
  };

  for (const [key, actual] of Object.entries(counts)) {
    const expected = batch.manifest.counts?.[key];
    if (typeof expected === "number" && expected !== actual) {
      issues.push({
        code: "COUNT_MISMATCH",
        severity: "warning",
        entityType: key as ValidationIssue["entityType"],
        message: `Manifest counts.${key}=${expected} but loaded ${actual}`,
      });
    }
  }

  const seenIds = new Set<string>();
  for (const entity of [
    ...batch.developers.map((d) => ({ type: "developer" as const, id: d.id })),
    ...batch.projects.map((p) => ({ type: "project" as const, id: p.id })),
    ...batch.images.map((i) => ({ type: "image" as const, id: i.id })),
    ...batch.pdfs.map((p) => ({ type: "pdf" as const, id: p.id })),
    ...batch.news.map((n) => ({ type: "news" as const, id: n.id })),
  ]) {
    if (!entity.id) {
      issues.push({
        code: "ENTITY_MISSING_ID",
        severity: "error",
        entityType: entity.type,
        message: `${entity.type} missing id`,
      });
      continue;
    }
    const key = `${entity.type}:${entity.id}`;
    if (seenIds.has(key)) {
      issues.push({
        code: "ENTITY_DUPLICATE_ID_IN_BATCH",
        severity: "error",
        entityType: entity.type,
        entityId: entity.id,
        message: `Duplicate ${entity.type} id in batch: ${entity.id}`,
      });
    }
    seenIds.add(key);
  }

  return { ok: issues.every((i) => i.severity !== "error"), issues };
}

export function assertContractOk(result: ContractValidationResult): void {
  if (!result.ok) {
    throw new ContractValidationError("Batch contract validation failed", {
      issues: result.issues,
    });
  }
}
