/**
 * Next.js instrumentation — fail closed on unsafe Supabase targeting.
 * Runs on server boot / build registration.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  // Soft skip when no Supabase URL is configured (local typecheck / empty CI scaffolding).
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  if (!url) return;

  const { assertServiceRoleNotPublic, assertSupabaseEnvironmentIsolation } =
    await import("./src/lib/env/supabase-guard.ts");

  assertServiceRoleNotPublic();
  assertSupabaseEnvironmentIsolation({
    supabaseUrl: url,
    requireUrl: true,
  });
}
