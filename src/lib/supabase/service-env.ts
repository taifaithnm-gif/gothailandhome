import "server-only";

/**
 * Server-only service-role credential access.
 * Must never be imported from client components or public modules.
 */

import { assertServiceRoleNotPublic } from "../env/supabase-guard.ts";
import { getSupabaseUrl } from "./public-env.ts";

export function getSupabaseServiceRoleKey(): string {
  assertServiceRoleNotPublic();
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  );
}

export function requireSupabaseServiceEnv(): {
  url: string;
  serviceRoleKey: string;
} {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }
  return { url, serviceRoleKey };
}
