import type { NextConfig } from "next";

/**
 * Build-time isolation (plain logic; mirrors src/lib/env/supabase-guard.ts).
 * Preview/Development must not target the production project ref.
 * Production must not target the staging project ref.
 */
function extractRef(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const m = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return m?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function resolveDeployEnv(): string {
  const explicit = (process.env.APP_DEPLOY_ENV || "").trim().toLowerCase();
  if (
    explicit === "development" ||
    explicit === "preview" ||
    explicit === "production" ||
    explicit === "test"
  ) {
    return explicit;
  }
  if (process.env.NODE_ENV === "test") return "test";
  const vercel = (process.env.VERCEL_ENV || "").trim().toLowerCase();
  if (vercel === "production" || vercel === "preview" || vercel === "development") {
    return vercel;
  }
  if (process.env.FORCE_PRODUCTION_ENV === "1" || process.env.FORCE_PRODUCTION_ENV === "true") {
    return "production";
  }
  if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
    return "production";
  }
  return "development";
}

function assertBuildTimeSupabaseIsolation() {
  if (process.env.SUPABASE_ENV_GUARD === "skip") return;
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must never be exposed via NEXT_PUBLIC_*.",
    );
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  if (!url) return;

  const deployEnv = resolveDeployEnv();
  if (deployEnv === "test") return;

  const projectRef = extractRef(url);
  if (!projectRef) {
    throw new Error(
      "Supabase URL must be https://<project-ref>.supabase.co",
    );
  }

  const productionRef = (
    process.env.SUPABASE_PRODUCTION_PROJECT_REF || ""
  )
    .trim()
    .toLowerCase();
  const stagingRef = (process.env.SUPABASE_STAGING_PROJECT_REF || "")
    .trim()
    .toLowerCase();

  if (
    (deployEnv === "development" || deployEnv === "preview") &&
    productionRef &&
    projectRef === productionRef
  ) {
    throw new Error(
      `${deployEnv} must not connect to Production Supabase (ref match).`,
    );
  }

  if (deployEnv === "production" && stagingRef && projectRef === stagingRef) {
    throw new Error(
      "production must not connect to Staging Supabase (ref match).",
    );
  }

  if (
    (deployEnv === "development" || deployEnv === "preview") &&
    stagingRef &&
    projectRef !== stagingRef
  ) {
    throw new Error(
      `${deployEnv} Supabase ref must equal SUPABASE_STAGING_PROJECT_REF.`,
    );
  }

  if (
    deployEnv === "production" &&
    productionRef &&
    projectRef !== productionRef
  ) {
    throw new Error(
      "production Supabase ref must equal SUPABASE_PRODUCTION_PROJECT_REF.",
    );
  }
}

try {
  assertBuildTimeSupabaseIsolation();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  throw new Error(`[env-isolation] build blocked: ${message}`);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
