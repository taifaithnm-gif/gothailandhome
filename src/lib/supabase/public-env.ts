/**
 * Browser-safe Supabase public env getters.
 * Must never read or export service-role credentials.
 */

import { assertSupabaseEnvironmentIsolation } from "../env/supabase-guard.ts";

export function getSupabaseUrl(options?: { skipIsolation?: boolean }): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  if (!url) return "";
  assertSupabaseEnvironmentIsolation({
    supabaseUrl: url,
    skipIsolation: options?.skipIsolation,
    requireUrl: true,
  });
  return url;
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

export function hasSupabaseEnv(): boolean {
  try {
    const url = getSupabaseUrl();
    return Boolean(url && getSupabaseAnonKey());
  } catch {
    return false;
  }
}

export function requireSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing required public Supabase env (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).",
    );
  }
  return { url, anonKey };
}
