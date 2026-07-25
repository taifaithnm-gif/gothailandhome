/**
 * Deploy environment detection for Local / Preview / Production isolation.
 * Never embeds secrets — only classifies the runtime target.
 */

export type DeployEnv = "development" | "preview" | "production" | "test";

export function resolveDeployEnv(
  env: NodeJS.ProcessEnv = process.env,
): DeployEnv {
  const explicit = (env.APP_DEPLOY_ENV || "").trim().toLowerCase();
  if (
    explicit === "development" ||
    explicit === "preview" ||
    explicit === "production" ||
    explicit === "test"
  ) {
    return explicit;
  }

  if (env.NODE_ENV === "test") return "test";

  const vercelEnv = (env.VERCEL_ENV || "").trim().toLowerCase();
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv === "development") return "development";

  // Local `next build` sets NODE_ENV=production without VERCEL_ENV.
  // Prefer explicit APP_DEPLOY_ENV; otherwise treat non-Vercel production NODE_ENV
  // as development for isolation purposes unless FORCE_PRODUCTION_ENV=1.
  if (env.VERCEL === "1" && env.NODE_ENV === "production") {
    return "production";
  }

  if (env.FORCE_PRODUCTION_ENV === "1" || env.FORCE_PRODUCTION_ENV === "true") {
    return "production";
  }

  if (env.NODE_ENV === "production" && env.VERCEL === "1") {
    return "production";
  }

  return "development";
}

export function isNonProductionDeployEnv(deployEnv: DeployEnv): boolean {
  return deployEnv === "development" || deployEnv === "preview";
}
