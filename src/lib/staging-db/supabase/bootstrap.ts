/**
 * Staging env bootstrap — project discovery, pooler URI build, atomic env write.
 * Never logs passwords or full database URIs.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import readline from "node:readline";

export const STAGING_PROJECT_NAME = "gothailandhome-staging";
export const FORBIDDEN_PROJECT_NAMES = new Set([
  "gothailandhome-db",
  "gothailandhome-production",
  "gothailandhome-prod",
]);

export type StagingProjectMeta = {
  id: string;
  name: string;
  region: string;
  status: string;
  organization_id?: string;
};

export type PoolerMetadata = {
  hostname: string;
  port: 5432;
  username: string;
  database: "postgres";
  projectRef: string;
  region: string;
  source: "management_api_pooler" | "region_derived_verified";
};

export type BuiltPoolerUri = {
  /** Never log this. */
  uri: string;
  host: string;
  port: number;
  username: string;
  database: string;
};

function maskRef(ref: string): string {
  if (ref.length < 8) return "…";
  return `${ref.slice(0, 4)}…${ref.slice(-4)}`;
}

export function findExactStagingProjects(
  projects: StagingProjectMeta[],
  expectedRef?: string | null,
): {
  status: "PASS" | "FAIL";
  project?: StagingProjectMeta;
  reason?: string;
} {
  const exact = projects.filter((p) => p.name === STAGING_PROJECT_NAME);
  if (exact.length === 0) {
    return { status: "FAIL", reason: "PROJECT_NOT_FOUND" };
  }
  if (exact.length > 1) {
    return { status: "FAIL", reason: "AMBIGUOUS_DUPLICATE_NAME" };
  }
  const project = exact[0]!;
  if (FORBIDDEN_PROJECT_NAMES.has(project.name)) {
    return { status: "FAIL", reason: "FORBIDDEN_PROJECT_NAME" };
  }
  if (/prod|production/i.test(project.name) && project.name !== STAGING_PROJECT_NAME) {
    return { status: "FAIL", reason: "PRODUCTION_NAME_REJECTED" };
  }
  if (expectedRef && project.id !== expectedRef) {
    return {
      status: "FAIL",
      reason: `PROJECT_REF_MISMATCH expected=${maskRef(expectedRef)} got=${maskRef(project.id)}`,
    };
  }
  return { status: "PASS", project };
}

export function rejectProductionProject(
  project: StagingProjectMeta,
  productionRef?: string | null,
): boolean {
  if (productionRef && project.id === productionRef) return true;
  if (FORBIDDEN_PROJECT_NAMES.has(project.name)) return true;
  return false;
}

/**
 * Build Session pooler URI with URL API encoding (no manual replace).
 */
export function buildSessionPoolerUri(input: {
  projectRef: string;
  hostname: string;
  password: string;
  port?: number;
  database?: string;
}): BuiltPoolerUri {
  const port = input.port ?? 5432;
  const database = input.database ?? "postgres";
  const username = `postgres.${input.projectRef}`;
  if (!input.hostname.endsWith(".pooler.supabase.com")) {
    throw new Error("POOLER_HOST_REJECTED");
  }
  if (port !== 5432) {
    throw new Error("POOLER_PORT_MUST_BE_5432_SESSION");
  }
  const uri = `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(input.password)}@${input.hostname}:${port}/${database}`;
  // Self-check via URL parser
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error("POOLER_URI_PARSE_FAILED");
  }
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("POOLER_URI_PROTOCOL_FAILED");
  }
  if (parsed.hostname !== input.hostname) {
    throw new Error("POOLER_URI_HOST_MISMATCH");
  }
  if (Number(parsed.port || "5432") !== 5432) {
    throw new Error("POOLER_URI_PORT_MISMATCH");
  }
  if (decodeURIComponent(parsed.username) !== username) {
    throw new Error("POOLER_URI_USERNAME_MISMATCH");
  }
  if ((parsed.pathname || "/").replace(/^\//, "") !== database) {
    throw new Error("POOLER_URI_DATABASE_MISMATCH");
  }
  return {
    uri,
    host: parsed.hostname,
    port: 5432,
    username,
    database,
  };
}

export function summarizePoolerBuild(built: BuiltPoolerUri): Record<string, string> {
  return {
    POOLER_URI_BUILD: "PASS",
    POOLER_HOST: built.host,
    POOLER_PORT: String(built.port),
    POOLER_USERNAME_FORMAT: built.username.startsWith("postgres.")
      ? "PASS"
      : "FAIL",
    PASSWORD_ENCODING: "PASS",
  };
}

/**
 * Extract password from an existing Direct DATABASE_URL using URL parser.
 * Returns null if unparseable. Caller must clear the string after use.
 */
export function extractPasswordFromDatabaseUrl(
  databaseUrl: string | null | undefined,
): string | null {
  if (!databaseUrl?.trim()) return null;
  try {
    const u = new URL(databaseUrl.trim());
    const pass = decodeURIComponent(u.password || "");
    return pass || null;
  } catch {
    return null;
  }
}

export async function readHiddenPassword(
  prompt = "Enter Staging database password: ",
): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error("PASSWORD_TTY_REQUIRED");
  }
  return await new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    // Hide echo via muted stdout write for password (Node readline does not mute;
    // use stdin setRawMode for simple hidden input).
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    const chars: string[] = [];
    process.stdout.write(prompt);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\n" || ch === "\r" || ch === "\u0004") {
          cleanup();
          process.stdout.write("\n");
          const pwd = chars.join("");
          chars.length = 0;
          resolve(pwd);
          return;
        }
        if (ch === "\u0003") {
          cleanup();
          reject(new Error("PASSWORD_INPUT_CANCELLED"));
          return;
        }
        if (ch === "\u007f" || ch === "\b") {
          chars.pop();
          continue;
        }
        chars.push(ch);
      }
    };
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode?.(wasRaw ?? false);
      rl.close();
    };
    stdin.on("data", onData);
  });
}

export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\n/)) {
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
    out[k] = v;
  }
  return out;
}

export function serializeEnvFile(
  map: Record<string, string>,
  order: string[],
): string {
  const lines: string[] = [
    "# Staging-only local secrets — generated by staging:env:bootstrap",
    "# DO NOT COMMIT. DO NOT paste into chat.",
    "",
  ];
  const seen = new Set<string>();
  for (const k of order) {
    if (k in map) {
      lines.push(`${k}=${map[k]}`);
      seen.add(k);
    }
  }
  for (const k of Object.keys(map).sort()) {
    if (!seen.has(k)) lines.push(`${k}=${map[k]}`);
  }
  lines.push("");
  return lines.join("\n");
}

export const BOOTSTRAP_ENV_ORDER = [
  "STAGING_IMPORT_ENABLED",
  "STAGING_COMMIT_ENABLED",
  "STAGING_STORAGE_UPLOAD_ENABLED",
  "STAGING_INTEGRATION_TEST_ENABLED",
  "STAGING_REVIEWER_GATE_ENABLED",
  "STAGING_ENVIRONMENT_ID",
  "STAGING_PROJECT_REF",
  "STAGING_ALLOWED_HOST",
  "STAGING_ALLOWED_POOLER_HOST",
  "STAGING_SUPABASE_URL",
  "STAGING_SUPABASE_ANON_KEY",
  "STAGING_SUPABASE_SERVICE_ROLE_KEY",
  "STAGING_DATABASE_URL",
  "STAGING_DATABASE_POOLER_URL",
  "STAGING_STORAGE_BUCKET",
  "SUPABASE_PRODUCTION_PROJECT_REF",
  "PRODUCTION_SUPABASE_URL",
  "PRODUCTION_DATABASE_URL",
];

/**
 * Atomic write with mode 600. Never logs contents.
 */
export function atomicWriteEnvFile(
  targetPath: string,
  contents: string,
): { ok: true; mode: string } {
  const dir = path.dirname(targetPath);
  const tmp = path.join(
    dir,
    `.env.staging.local.${process.pid}.${Date.now()}.tmp`,
  );
  const fd = fs.openSync(tmp, "w", 0o600);
  try {
    fs.writeSync(fd, contents, undefined, "utf8");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, targetPath);
  fs.chmodSync(targetPath, 0o600);
  const mode = (fs.statSync(targetPath).mode & 0o777).toString(8);
  return { ok: true, mode };
}

export function isPathGitIgnored(
  repoRoot: string,
  relativePath: string,
): boolean {
  const r = spawnSync("git", ["check-ignore", "-q", relativePath], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return r.status === 0;
}

export function assertApiKeyShape(
  key: string | undefined,
  kind: "anon" | "service",
): "PRESENT_OK" | "MISSING" | "INVALID_FORMAT" {
  if (!key?.trim()) return "MISSING";
  const v = key.trim();
  if (kind === "anon") {
    if (v.startsWith("sb_publishable_") || v.startsWith("eyJ")) return "PRESENT_OK";
    return "INVALID_FORMAT";
  }
  if (v.startsWith("sb_secret_") || v.startsWith("eyJ")) return "PRESENT_OK";
  return "INVALID_FORMAT";
}

/**
 * Derive candidate session pooler hosts from region metadata, then caller verifies.
 * Prefer Management API hostname when provided.
 */
export function candidateSessionPoolerHosts(input: {
  region: string;
  apiHostname?: string | null;
}): string[] {
  const out: string[] = [];
  if (input.apiHostname?.endsWith(".pooler.supabase.com")) {
    out.push(input.apiHostname.toLowerCase());
  }
  const region = input.region.trim().toLowerCase();
  if (region) {
    // Official docs: aws-0-<region>.pooler.supabase.com — also try aws-1/aws-2 clusters.
    for (const n of [0, 1, 2]) {
      const h = `aws-${n}-${region}.pooler.supabase.com`;
      if (!out.includes(h)) out.push(h);
    }
  }
  return out;
}

export function redactSecretsFromText(
  text: string,
  secrets: string[],
): { clean: boolean; hits: string[] } {
  const hits: string[] = [];
  for (const s of secrets) {
    if (!s || s.length < 6) continue;
    if (text.includes(s)) hits.push("SECRET_LITERAL");
  }
  if (/sb_secret_[A-Za-z0-9_]+/.test(text)) hits.push("SB_SECRET_PATTERN");
  if (/postgresql:\/\/[^:\s]+:[^@\s]+@/.test(text)) hits.push("DB_URI_PATTERN");
  return { clean: hits.length === 0, hits };
}

export function discoverProjectsViaCli(): {
  ok: boolean;
  projects: StagingProjectMeta[];
  error?: string;
} {
  const r = spawnSync(
    "supabase",
    ["projects", "list", "--output-format", "json"],
    { encoding: "utf8", env: process.env },
  );
  if (r.status !== 0) {
    return {
      ok: false,
      projects: [],
      error: (r.stderr || r.stdout || "CLI_FAILED").split("\n")[0],
    };
  }
  try {
    const parsed = JSON.parse(r.stdout || "[]");
    const list = Array.isArray(parsed) ? parsed : parsed?.projects || [];
    const projects: StagingProjectMeta[] = list.map(
      (p: Record<string, unknown>) => ({
        id: String(p.id || p.ref || ""),
        name: String(p.name || ""),
        region: String(p.region || p.cloud_provider_region || ""),
        status: String(p.status || "UNKNOWN"),
        organization_id: p.organization_id
          ? String(p.organization_id)
          : undefined,
      }),
    );
    return { ok: true, projects };
  } catch {
    return { ok: false, projects: [], error: "CLI_JSON_PARSE_FAILED" };
  }
}

export function readSupabaseAccessToken(): string | null {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  const candidates = [
    path.join(os.homedir(), ".supabase", "access-token"),
    path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "supabase",
      "access-token",
    ),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const t = fs.readFileSync(p, "utf8").trim();
        if (t) return t;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function fetchPoolerHostnameFromManagementApi(
  projectRef: string,
  accessToken: string,
): Promise<string | null> {
  const endpoints = [
    `https://api.supabase.com/v1/projects/${projectRef}/config/database/pooler`,
    `https://api.supabase.com/v1/projects/${projectRef}/config/database/pgbouncer`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) continue;
      const body = (await res.json()) as Record<string, unknown> | unknown[];
      const rows = Array.isArray(body) ? body : [body];
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        const r = row as Record<string, unknown>;
        const host = String(
          r.db_host || r.host || r.hostname || r.connection_string || "",
        );
        // connection_string may contain host — extract if needed
        if (host.includes("pooler.supabase.com")) {
          try {
            if (host.includes("://")) {
              return new URL(host).hostname.toLowerCase();
            }
            return host.toLowerCase();
          } catch {
            const m = host.match(
              /([a-z0-9.-]+\.pooler\.supabase\.com)/i,
            );
            if (m) return m[1]!.toLowerCase();
          }
        }
      }
    } catch {
      // try next
    }
  }
  return null;
}

export function clearString(s: { value: string }) {
  s.value = "";
}

export { maskRef, os };
