/**
 * Staging Supabase client factory — STAGING_* only.
 * Default: no connection. Explicit createStagingServiceClient() required.
 * Must never be imported from client components / review console / browser bundles.
 * (No `server-only` import so Node CLI scripts can load this module.)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { StagingEnvironmentBlockedError } from "../errors.ts";
import {
  assertStagingClientMayConnect,
  readStagingEnv,
} from "./environment.ts";

export type StagingSupabaseClients = {
  service: SupabaseClient;
  projectRef: string;
  environmentId: string;
};

/**
 * Explicit connect. Throws if staging not provisioned / isolation fails.
 */
export function createStagingServiceClient(
  env: NodeJS.ProcessEnv = process.env,
): StagingSupabaseClients {
  const snap = assertStagingClientMayConnect(env);
  const url = snap.supabaseUrl;
  const key = (env.STAGING_SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_SUPABASE_URL and STAGING_SUPABASE_SERVICE_ROLE_KEY required",
    );
  }
  // Refuse accidental Production credential reuse by name
  if (
    env.SUPABASE_SERVICE_ROLE_KEY &&
    key === env.SUPABASE_SERVICE_ROLE_KEY.trim() &&
    env.SUPABASE_PRODUCTION_PROJECT_REF &&
    snap.projectRef === env.SUPABASE_PRODUCTION_PROJECT_REF.trim()
  ) {
    throw new StagingEnvironmentBlockedError(
      "Refusing service role that matches Production project markers",
    );
  }

  const service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    service,
    projectRef: snap.projectRef!,
    environmentId: snap.environmentId!,
  };
}

/** Soft check — does not connect. */
export function stagingClientConnectAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  try {
    assertStagingClientMayConnect(env);
    return true;
  } catch {
    return false;
  }
}

export function describeStagingClientAvailability(
  env: NodeJS.ProcessEnv = process.env,
): { allowed: boolean; provisioned: boolean; reason?: string } {
  const snap = readStagingEnv(env);
  if (!snap.provisioned) {
    return {
      allowed: false,
      provisioned: false,
      reason: "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED",
    };
  }
  if (!snap.isolationOk || snap.productionDetected) {
    return {
      allowed: false,
      provisioned: true,
      reason: "ISOLATION_OR_PRODUCTION_BLOCK",
    };
  }
  return { allowed: true, provisioned: true };
}
