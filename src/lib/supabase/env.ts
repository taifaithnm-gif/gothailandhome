/**
 * Compatibility re-exports.
 * Prefer importing from public-env / service-env directly.
 * Service-role getter is intentionally NOT re-exported here so browser
 * modules that import this file cannot pull the server-only graph.
 */

export {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseEnv,
  requireSupabasePublicEnv,
} from "./public-env.ts";
