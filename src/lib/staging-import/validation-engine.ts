/**
 * Unified Validation Engine — province, developer, evidence, hash, schema, contract, batch.
 */

import { validateImportBatch } from "./contract-validator.ts";
import { validateDeveloper } from "./developer-validator.ts";
import { validateProvince } from "./province-validator.ts";
import type { ImportBatch, ValidationIssue } from "./types.ts";

const HASH_RE = /^[a-f0-9]{64}$/i;

export type ValidationEngineResult = {
  ok: boolean;
  issues: ValidationIssue[];
  counts: {
    errors: number;
    warnings: number;
    infos: number;
  };
};

function countBySeverity(issues: ValidationIssue[]) {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    infos: issues.filter((i) => i.severity === "info").length,
  };
}

export function validateEvidence(
  entityType: ValidationIssue["entityType"],
  entityId: string,
  evidence: Array<{ path?: string; url?: string; hash?: string }> | undefined,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!evidence || evidence.length === 0) {
    issues.push({
      code: "EVIDENCE_MISSING",
      severity: "warning",
      entityType,
      entityId,
      message: "Evidence missing",
    });
    return issues;
  }
  for (const e of evidence) {
    if (e.hash && !HASH_RE.test(e.hash)) {
      issues.push({
        code: "EVIDENCE_HASH_INVALID",
        severity: "error",
        entityType,
        entityId,
        message: `Invalid evidence hash: ${e.hash}`,
      });
    }
    if (e.path && (e.path.includes("..") || e.path.startsWith("/"))) {
      issues.push({
        code: "EVIDENCE_PATH_UNSAFE",
        severity: "error",
        entityType,
        entityId,
        message: `Unsafe evidence path: ${e.path}`,
      });
    }
  }
  return issues;
}

export function validateHashes(batch: ImportBatch): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const img of batch.images) {
    if (!HASH_RE.test(img.hash)) {
      issues.push({
        code: "HASH_INVALID",
        severity: "error",
        entityType: "image",
        entityId: img.id,
        message: "Invalid image hash",
        field: "hash",
      });
    }
  }
  for (const pdf of batch.pdfs) {
    if (!HASH_RE.test(pdf.hash)) {
      issues.push({
        code: "HASH_INVALID",
        severity: "error",
        entityType: "pdf",
        entityId: pdf.id,
        message: "Invalid pdf hash",
        field: "hash",
      });
    }
  }
  return issues;
}

export function validateSchemaFields(batch: ImportBatch): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!batch.manifest.schemaVersion) {
    issues.push({
      code: "SCHEMA_VERSION_MISSING",
      severity: "warning",
      message: "schemaVersion missing on manifest",
    });
  }
  for (const n of batch.news) {
    if (!n.sourceUrl) {
      issues.push({
        code: "SCHEMA_NEWS_URL_REQUIRED",
        severity: "error",
        entityType: "news",
        entityId: n.id,
        message: "news.sourceUrl required",
      });
    }
  }
  return issues;
}

export function runValidationEngine(batch: ImportBatch): ValidationEngineResult {
  const issues: ValidationIssue[] = [];

  issues.push(...validateImportBatch(batch).issues);
  issues.push(...validateSchemaFields(batch));
  issues.push(...validateHashes(batch));

  for (const d of batch.developers) {
    issues.push(...validateDeveloper(d).issues);
    issues.push(...validateEvidence("developer", d.id, d.evidence));
  }
  for (const p of batch.projects) {
    const province = validateProvince(p.province);
    if (!province.ok) {
      issues.push({
        code: `PROVINCE_${province.code}`,
        severity: province.code === "EMPTY" ? "warning" : "error",
        entityType: "project",
        entityId: p.id,
        message: `Province ${province.code}`,
        field: "province",
      });
    }
    issues.push(...validateEvidence("project", p.id, p.evidence));
  }
  for (const n of batch.news) {
    issues.push(...validateEvidence("news", n.id, n.evidence));
  }

  const counts = countBySeverity(issues);
  return {
    ok: counts.errors === 0,
    issues,
    counts,
  };
}
