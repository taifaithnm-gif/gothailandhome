/**
 * Pure build-metadata resolution (no I/O).
 * Immutable fields are expected to be baked at `next build` via next.config env.
 */

export type BuildInfo = {
  version: string;
  build_time: string;
  commit_sha: string | null;
  deployment_environment: string;
};

type EnvLike = Record<string, string | undefined>;

function firstNonEmpty(env: EnvLike, keys: string[]): string | null {
  for (const key of keys) {
    const value = (env[key] || "").trim();
    if (value) return value;
  }
  return null;
}

/**
 * Resolve commit SHA from explicit build injection, then platform defaults.
 * Order: BUILD_COMMIT_SHA → GIT_COMMIT_SHA → VERCEL_GIT_COMMIT_SHA → GITHUB_SHA
 */
export function resolveCommitSha(env: EnvLike = process.env): string | null {
  return firstNonEmpty(env, [
    "BUILD_COMMIT_SHA",
    "GIT_COMMIT_SHA",
    "VERCEL_GIT_COMMIT_SHA",
    "GITHUB_SHA",
  ]);
}

/**
 * Resolve build timestamp. Prefer explicit BUILD_TIME (ISO-8601).
 * Callers that bake at build time should supply BUILD_TIME so runtime stays immutable.
 */
export function resolveBuildTime(
  env: EnvLike = process.env,
  now: () => string = () => new Date().toISOString(),
): string {
  return firstNonEmpty(env, ["BUILD_TIME"]) ?? now();
}

/**
 * Resolve version from BUILD_VERSION, else packageVersion fallback.
 */
export function resolveBuildVersion(
  env: EnvLike = process.env,
  packageVersion = "0.0.0",
): string {
  return firstNonEmpty(env, ["BUILD_VERSION"]) ?? packageVersion;
}

export function resolveBuildInfo(
  env: EnvLike,
  options: {
    packageVersion?: string;
    deploymentEnvironment: string;
    now?: () => string;
  },
): BuildInfo {
  return {
    version: resolveBuildVersion(env, options.packageVersion ?? "0.0.0"),
    build_time: resolveBuildTime(env, options.now),
    commit_sha: resolveCommitSha(env),
    deployment_environment: options.deploymentEnvironment,
  };
}
