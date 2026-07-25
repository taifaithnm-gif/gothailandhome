/**
 * Staging DB environment guards + Production hard block.
 * Hard-coded — not documentation-only.
 */

import { resolveDeployEnv } from "../env/deploy-env.ts";
import {
  ProductionWriteBlockedError,
  StagingCommitDisabledError,
  StagingEnvironmentBlockedError,
} from "./errors.ts";
import type { StagingAuditEvent } from "./types.ts";
import { createHash } from "node:crypto";

export type GuardEnv = NodeJS.ProcessEnv;

export type ProductionBlockCheck = {
  blocked: boolean;
  reasons: string[];
};

export type StagingWriteGateInput = {
  confirmStaging?: boolean;
  batchStatus?: string;
  sealedZipValidated?: boolean;
  commitPlanValidated?: boolean;
  reviewerGateConfigured?: boolean;
  /** Simulation mode does not require STAGING_DATABASE_URL. */
  simulation?: boolean;
};

const DEFAULT_PRODUCTION_URL_MARKERS = [
  "supabase.co",
];

function lower(v: string | undefined | null): string {
  return (v ?? "").trim().toLowerCase();
}

function hostnameLooksProduction(hostname: string): boolean {
  const h = lower(hostname);
  return (
    h.includes("production") ||
    h.includes("prod.") ||
    h.endsWith(".prod") ||
    h.includes("-prod-") ||
    h.includes("prod-")
  );
}

function urlLooksProduction(url: string, env: GuardEnv): boolean {
  const u = lower(url);
  if (!u) return false;
  const productionUrl = lower(env.PRODUCTION_DATABASE_URL);
  const productionSupabase = lower(
    env.PRODUCTION_SUPABASE_URL || env.SUPABASE_PRODUCTION_URL,
  );
  if (productionUrl && u === productionUrl) return true;
  if (productionSupabase && u === productionSupabase) return true;

  try {
    const parsed = new URL(url);
    if (hostnameLooksProduction(parsed.hostname)) return true;
  } catch {
    if (u.includes("production")) return true;
  }
  return false;
}

/**
 * Hard Production write block. Any matching signal → throw / blocked.
 */
export function checkProductionWriteBlock(
  env: GuardEnv = process.env,
  options: {
    databaseUrl?: string;
    hostname?: string;
  } = {},
): ProductionBlockCheck {
  const reasons: string[] = [];

  const nodeEnv = lower(env.NODE_ENV);
  if (nodeEnv === "production") {
    reasons.push("NODE_ENV=production");
  }

  const vercelEnv = lower(env.VERCEL_ENV);
  if (vercelEnv === "production") {
    reasons.push("VERCEL_ENV=production");
  }

  const deployEnv = resolveDeployEnv(env);
  if (deployEnv === "production") {
    reasons.push("deployEnv=production");
  }

  const nextPublicEnv = lower(
    env.NEXT_PUBLIC_APP_ENV || env.NEXT_PUBLIC_DEPLOY_ENV || env.NEXT_PUBLIC_VERCEL_ENV,
  );
  if (nextPublicEnv === "production") {
    reasons.push("NEXT_PUBLIC_* environment marked production");
  }

  const hostname = lower(options.hostname || env.HOSTNAME || env.VERCEL_URL);
  if (hostname && hostnameLooksProduction(hostname)) {
    reasons.push(`hostname contains production marker: ${hostname}`);
  }

  // Active write targets only — do not treat PRODUCTION_DATABASE_URL as active
  // merely because the marker env var is configured for comparison.
  const candidateUrls = [
    options.databaseUrl,
    env.STAGING_DATABASE_URL,
    env.DATABASE_URL,
    env.SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter((x): x is string => Boolean(x && String(x).trim()));

  for (const url of candidateUrls) {
    if (urlLooksProduction(url, env)) {
      reasons.push(`URL equals/looks like Production: ${maskUrl(url)}`);
    }
  }

  // Explicit production project ref match against active URL
  const productionRef = lower(env.SUPABASE_PRODUCTION_PROJECT_REF);
  if (productionRef) {
    for (const url of candidateUrls) {
      if (lower(url).includes(productionRef)) {
        reasons.push("URL project ref matches SUPABASE_PRODUCTION_PROJECT_REF");
      }
    }
  }

  // Service role present with production markers → treat as blocked for staging writes
  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "";
  if (serviceKey && (nodeEnv === "production" || vercelEnv === "production")) {
    reasons.push("service_role key present under production environment");
  }

  const productionDbUrl = (env.PRODUCTION_DATABASE_URL || "").trim();
  if (productionDbUrl) {
    for (const url of candidateUrls) {
      if (url.trim() === productionDbUrl) {
        reasons.push("PRODUCTION_DATABASE_URL is the active write target");
      }
    }
  }

  return { blocked: reasons.length > 0, reasons: [...new Set(reasons)] };
}

export function assertProductionWriteBlocked(
  env: GuardEnv = process.env,
  options: { databaseUrl?: string; hostname?: string } = {},
): void {
  const check = checkProductionWriteBlock(env, options);
  if (check.blocked) {
    throw new ProductionWriteBlockedError(check.reasons.join("; "), {
      reasons: check.reasons,
    });
  }
}

/**
 * Future real write gate. Simulation skips STAGING_DATABASE_URL requirement.
 */
export function assertStagingWriteAllowed(
  input: StagingWriteGateInput,
  env: GuardEnv = process.env,
): void {
  assertProductionWriteBlocked(env);

  if (input.simulation === true) {
    return;
  }

  if (lower(env.NODE_ENV) === "production") {
    throw new StagingEnvironmentBlockedError("NODE_ENV must not be production");
  }

  if (lower(env.STAGING_IMPORT_ENABLED) !== "true") {
    throw new StagingEnvironmentBlockedError(
      "STAGING_IMPORT_ENABLED must be true",
    );
  }

  if (!env.STAGING_DATABASE_URL || !String(env.STAGING_DATABASE_URL).trim()) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_DATABASE_URL is required for real staging writes",
    );
  }

  if (
    env.PRODUCTION_DATABASE_URL &&
    env.STAGING_DATABASE_URL.trim() === env.PRODUCTION_DATABASE_URL.trim()
  ) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_DATABASE_URL must not equal PRODUCTION_DATABASE_URL",
    );
  }

  // Refuse if active URL is production
  assertProductionWriteBlocked(env, {
    databaseUrl: env.STAGING_DATABASE_URL,
  });

  if (input.confirmStaging !== true) {
    throw new StagingEnvironmentBlockedError(
      "explicit --confirm-staging is required",
    );
  }

  if (input.batchStatus !== "READY_FOR_STAGING_REVIEW") {
    throw new StagingEnvironmentBlockedError(
      "batch status must be READY_FOR_STAGING_REVIEW",
      { batchStatus: input.batchStatus },
    );
  }

  if (input.sealedZipValidated !== true) {
    throw new StagingEnvironmentBlockedError("sealed ZIP must be validated");
  }

  if (input.commitPlanValidated !== true) {
    throw new StagingEnvironmentBlockedError("commit plan must be validated");
  }

  if (input.reviewerGateConfigured !== true) {
    throw new StagingEnvironmentBlockedError(
      "reviewer gate must be configured",
    );
  }
}

/**
 * Real commit path — always disabled this milestone.
 */
export function assertRealCommitEnabled(): never {
  throw new StagingCommitDisabledError();
}

export function createProductionBlockAuditEvent(
  importSessionId: string,
  reasons: string[],
  at: string,
): StagingAuditEvent {
  const payload = { reasons, blocked: true };
  return {
    id: `audit-prod-block-${createHash("sha256").update(reasons.join("|")).digest("hex").slice(0, 16)}`,
    import_session_id: importSessionId,
    event_type: "PRODUCTION_WRITE_BLOCKED",
    entity_type: "import_session",
    entity_id: importSessionId,
    actor_type: "SYSTEM",
    actor_id: "environment-guard",
    previous_state: null,
    next_state: "BLOCKED",
    reason: reasons.join("; "),
    payload_hash: createHash("sha256")
      .update(stableStringify(payload))
      .digest("hex"),
    metadata_json: payload,
    created_at: at,
  };
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/…`;
  } catch {
    return "[unparseable-url]";
  }
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}

export { DEFAULT_PRODUCTION_URL_MARKERS };
