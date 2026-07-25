/**
 * Fail-closed Supabase environment isolation.
 *
 * Matrix:
 *   development / preview → must NOT use production project ref
 *   production            → must NOT use staging project ref
 *   Missing required vars → throw (no silent fallback)
 */

import { resolveDeployEnv, type DeployEnv } from "./deploy-env.ts";
import {
  extractSupabaseProjectRef,
  isValidProjectRef,
  normalizeProjectRef,
} from "./supabase-project-ref.ts";

export type SupabaseGuardInput = {
  supabaseUrl: string;
  deployEnv?: DeployEnv;
  productionProjectRef?: string;
  stagingProjectRef?: string;
  /** When true, skip isolation assertions (unit tests only). */
  skipIsolation?: boolean;
  requireUrl?: boolean;
};

export type SupabaseGuardResult = {
  ok: true;
  deployEnv: DeployEnv;
  projectRef: string | null;
};

export class EnvironmentIsolationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "EnvironmentIsolationError";
    this.code = code;
  }
}

function readMarker(
  env: NodeJS.ProcessEnv,
  name: string,
): string | undefined {
  const v = env[name];
  if (v == null || v.trim() === "") return undefined;
  return normalizeProjectRef(v);
}

/**
 * Assert URL/project-ref alignment for the current deploy environment.
 * Throws EnvironmentIsolationError on any violation.
 */
export function assertSupabaseEnvironmentIsolation(
  input: SupabaseGuardInput,
  env: NodeJS.ProcessEnv = process.env,
): SupabaseGuardResult {
  const deployEnv = input.deployEnv ?? resolveDeployEnv(env);
  const skip =
    input.skipIsolation === true ||
    env.SUPABASE_ENV_GUARD === "skip" ||
    deployEnv === "test";

  const requireUrl = input.requireUrl !== false;
  const url = (input.supabaseUrl || "").trim();

  if (requireUrl && !url) {
    throw new EnvironmentIsolationError(
      "MISSING_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) is required; refusing silent fallback.",
    );
  }

  if (!url) {
    return { ok: true, deployEnv, projectRef: null };
  }

  const projectRef = extractSupabaseProjectRef(url);
  if (!projectRef) {
    throw new EnvironmentIsolationError(
      "INVALID_SUPABASE_URL",
      "Supabase URL must be https://<project-ref>.supabase.co; refusing opaque hosts.",
    );
  }

  if (skip) {
    return { ok: true, deployEnv, projectRef };
  }

  const productionRef =
    normalizeProjectRef(input.productionProjectRef) ||
    readMarker(env, "SUPABASE_PRODUCTION_PROJECT_REF") ||
    "";
  const stagingRef =
    normalizeProjectRef(input.stagingProjectRef) ||
    readMarker(env, "SUPABASE_STAGING_PROJECT_REF") ||
    "";

  if (productionRef && !isValidProjectRef(productionRef)) {
    throw new EnvironmentIsolationError(
      "INVALID_PRODUCTION_REF_MARKER",
      "SUPABASE_PRODUCTION_PROJECT_REF is set but is not a valid project ref.",
    );
  }
  if (stagingRef && !isValidProjectRef(stagingRef)) {
    throw new EnvironmentIsolationError(
      "INVALID_STAGING_REF_MARKER",
      "SUPABASE_STAGING_PROJECT_REF is set but is not a valid project ref.",
    );
  }

  if (
    (deployEnv === "development" || deployEnv === "preview") &&
    productionRef &&
    projectRef === productionRef
  ) {
    throw new EnvironmentIsolationError(
      "NON_PROD_USES_PRODUCTION_SUPABASE",
      `${deployEnv} must not connect to Production Supabase (project ref match).`,
    );
  }

  if (deployEnv === "production" && stagingRef && projectRef === stagingRef) {
    throw new EnvironmentIsolationError(
      "PRODUCTION_USES_STAGING_SUPABASE",
      "production must not connect to Staging Supabase (project ref match).",
    );
  }

  // When markers are set, require URL ref to match the expected environment ref.
  if (
    (deployEnv === "development" || deployEnv === "preview") &&
    stagingRef &&
    projectRef !== stagingRef
  ) {
    throw new EnvironmentIsolationError(
      "NON_PROD_UNEXPECTED_REF",
      `${deployEnv} Supabase project ref must equal SUPABASE_STAGING_PROJECT_REF.`,
    );
  }

  if (
    deployEnv === "production" &&
    productionRef &&
    projectRef !== productionRef
  ) {
    throw new EnvironmentIsolationError(
      "PRODUCTION_UNEXPECTED_REF",
      "production Supabase project ref must equal SUPABASE_PRODUCTION_PROJECT_REF.",
    );
  }

  return { ok: true, deployEnv, projectRef };
}

/**
 * Assert service-role key is never passed into a browser/public context.
 * Used by static tests; also callable from server boot.
 */
export function assertServiceRoleNotPublic(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const publicService = env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (publicService != null && String(publicService).trim() !== "") {
    throw new EnvironmentIsolationError(
      "SERVICE_ROLE_PUBLIC",
      "SUPABASE_SERVICE_ROLE_KEY must never be exposed via NEXT_PUBLIC_*.",
    );
  }
}
