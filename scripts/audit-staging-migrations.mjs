#!/usr/bin/env node
/**
 * Static audit for database/staging-migrations/*.sql
 * Never connects to a database.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "database/staging-migrations");

const FORBIDDEN = [
  { re: /\bDROP\s+TABLE\b/i, code: "FORBIDDEN_DROP_TABLE" },
  { re: /\bTRUNCATE\b/i, code: "FORBIDDEN_TRUNCATE" },
  { re: /\bCASCADE\b/i, code: "FORBIDDEN_CASCADE" },
  { re: /\bDELETE\s+FROM\b(?![\s\S]*WHERE)/i, code: "FORBIDDEN_UNBOUNDED_DELETE" },
  { re: /GRANT\s+.*\s+TO\s+(PUBLIC|anon|authenticated)\b/i, code: "FORBIDDEN_PUBLIC_GRANT" },
  { re: /\bALTER\s+TABLE\s+public\.(developers|property_projects|properties|property_media)\b/i, code: "FORBIDDEN_PRODUCTION_TABLE" },
  { re: /\bINSERT\s+INTO\s+public\.(developers|property_projects|properties)\b/i, code: "FORBIDDEN_PRODUCTION_INSERT" },
  { re: /\bUPDATE\s+public\.(developers|property_projects|properties)\b/i, code: "FORBIDDEN_PRODUCTION_UPDATE" },
];

const REQUIRED_HEADERS = ["STAGING ONLY", "DO NOT APPLY TO PRODUCTION"];

function auditFile(filePath) {
  const body = fs.readFileSync(filePath, "utf8");
  const issues = [];
  for (const h of REQUIRED_HEADERS) {
    if (!body.includes(h)) {
      issues.push({ code: "MISSING_STAGING_HEADER", message: `Missing header: ${h}` });
    }
  }
  for (const f of FORBIDDEN) {
    if (f.re.test(body)) {
      issues.push({ code: f.code, message: f.code });
    }
  }
  // RLS enablement expected in rls migration
  if (filePath.includes("_006_staging_rls") && !/ENABLE ROW LEVEL SECURITY/i.test(body)) {
    issues.push({ code: "RLS_REQUIRED", message: "RLS enable missing" });
  }
  // SECURITY DEFINER must be flagged if present
  if (/SECURITY\s+DEFINER/i.test(body)) {
    issues.push({
      code: "SECURITY_DEFINER_PRESENT",
      message: "SECURITY DEFINER requires human review",
      severity: "warning",
    });
  }
  // search_path fixed for functions
  if (/CREATE\s+OR\s+REPLACE\s+FUNCTION/i.test(body) && !/SET\s+search_path\s*=/i.test(body)) {
    issues.push({ code: "SEARCH_PATH_REQUIRED", message: "RPC missing SET search_path" });
  }
  if (/CREATE\s+OR\s+REPLACE\s+FUNCTION/i.test(body) && !/REVOKE\s+ALL\s+ON\s+FUNCTION/i.test(body)) {
    issues.push({ code: "REVOKE_PUBLIC_REQUIRED", message: "RPC must REVOKE ALL FROM PUBLIC" });
  }
  // Only staging_* tables for CREATE TABLE
  const creates = [...body.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi)];
  for (const m of creates) {
    if (!m[1].startsWith("staging_")) {
      issues.push({ code: "NON_STAGING_TABLE", message: m[1] });
    }
  }
  return issues;
}

function main() {
  if (!fs.existsSync(dir)) {
    console.error(JSON.stringify({ ok: false, error: "missing staging-migrations dir" }));
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const results = [];
  let errors = 0;
  let warnings = 0;
  for (const f of files) {
    const issues = auditFile(path.join(dir, f));
    const err = issues.filter((i) => i.severity !== "warning");
    const warn = issues.filter((i) => i.severity === "warning");
    errors += err.length;
    warnings += warn.length;
    results.push({ file: f, issues, ok: err.length === 0 });
  }
  const report = {
    ok: errors === 0,
    errors,
    warnings,
    files: results,
    applied: false,
    note: "Static audit only — does not apply migrations",
  };
  const outDir = path.join(
    root,
    ".work/staging-db/BATCH-GTH-20260724-001/implementation",
  );
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "migration-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  process.exit(errors === 0 ? 0 : 1);
}

main();
