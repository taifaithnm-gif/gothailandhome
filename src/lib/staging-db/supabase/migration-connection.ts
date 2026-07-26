/**
 * Staging migration runner connection helper.
 * Prefer Session pooler. Does NOT apply migrations by itself.
 */

import {
  resolveStagingPgConnection,
  describeStagingPgConnection,
  type StagingPgConnection,
} from "./connection.ts";
import { assertStagingClientMayConnect } from "./environment.ts";

export function resolveStagingMigrationConnection(
  env: NodeJS.ProcessEnv = process.env,
): StagingPgConnection {
  assertStagingClientMayConnect(env);
  const conn = resolveStagingPgConnection(env);
  // Prefer pooler for apply path on this Mac mini.
  if (
    (env.STAGING_DATABASE_POOLER_URL || "").trim() &&
    conn.mode !== "SESSION_POOLER"
  ) {
    throw new Error("Migration runner expected SESSION_POOLER when pooler URL set");
  }
  return conn;
}

export function describeMigrationConnection(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, unknown> {
  const conn = resolveStagingMigrationConnection(env);
  return describeStagingPgConnection(conn);
}
