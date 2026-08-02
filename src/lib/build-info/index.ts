import "server-only";

import { resolveDeployEnv } from "@/lib/env/deploy-env";
import {
  resolveBuildInfo,
  type BuildInfo,
} from "@/lib/build-info/resolve";

export type { BuildInfo };

/**
 * Runtime build identity for ops / release verification.
 *
 * Immutable fields must use static `process.env.BUILD_*` access so Next can
 * inline values baked by next.config `env` at `next build`. Dynamic lookups
 * like `env[key]` are NOT replaced and would lose identity after `next start`.
 *
 * deployment_environment remains a true runtime classification.
 * Does not expose secrets or arbitrary environment data.
 */
export function getBuildInfo(): BuildInfo {
  // Static property access — required for build-time inlining.
  const bakedEnv = {
    BUILD_COMMIT_SHA: process.env.BUILD_COMMIT_SHA,
    BUILD_TIME: process.env.BUILD_TIME,
    BUILD_VERSION: process.env.BUILD_VERSION,
    GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    GITHUB_SHA: process.env.GITHUB_SHA,
  };

  return resolveBuildInfo(bakedEnv, {
    packageVersion: "0.0.0",
    deploymentEnvironment: resolveDeployEnv(process.env),
  });
}
