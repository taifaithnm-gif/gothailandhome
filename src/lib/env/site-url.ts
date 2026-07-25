/**
 * Resolve public site origin for auth redirects.
 * Preview/development must not silently fall back to production domain.
 */

import { resolveDeployEnv } from "./deploy-env.ts";

export function resolvePublicSiteUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = (env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const deployEnv = resolveDeployEnv(env);
  if (deployEnv === "preview") {
    const vercelUrl = (env.VERCEL_URL || "").trim();
    if (vercelUrl) {
      const host = vercelUrl.replace(/^https?:\/\//, "");
      return `https://${host}`;
    }
  }

  if (deployEnv === "production") {
    return "https://www.gothailandhome.com";
  }

  // Local/dev: require explicit config rather than inventing production.
  return "http://localhost:3000";
}
