/**
 * Staging repository adapters — interfaces wired for future RPC/table access.
 * No eager connection. Methods throw if staging not provisioned.
 */

import type {
  StagingAsset,
  StagingAuditEvent,
  StagingDeveloper,
  StagingImportSession,
  StagingNews,
  StagingPdf,
  StagingProject,
  StagingReviewItem,
} from "../types.ts";
import { StagingEnvironmentBlockedError } from "../errors.ts";
import { describeStagingClientAvailability } from "./client.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createStagingServiceClient } from "./client.ts";

function requireClient(env: NodeJS.ProcessEnv = process.env): SupabaseClient {
  const avail = describeStagingClientAvailability(env);
  if (!avail.allowed) {
    throw new StagingEnvironmentBlockedError(
      avail.reason ?? "Staging client unavailable",
    );
  }
  return createStagingServiceClient(env).service;
}

export async function insertImportSession(
  row: StagingImportSession,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_import_sessions").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertDeveloper(
  row: StagingDeveloper,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_developers").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertProject(
  row: StagingProject,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_projects").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertAsset(
  row: StagingAsset,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_assets").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertPdf(
  row: StagingPdf,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_pdfs").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertNews(
  row: StagingNews,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_news").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function insertReviewItem(
  row: StagingReviewItem & { version?: number },
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_review_items").insert({
    ...row,
    version: row.version ?? 1,
  });
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

export async function appendAuditEvent(
  row: StagingAuditEvent,
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  const sb = requireClient(env);
  const { error } = await sb.from("staging_audit_events").insert(row);
  if (error) throw new StagingEnvironmentBlockedError(error.message);
}

/** Multi-row client inserts are FORBIDDEN as a substitute for atomic commit. */
export function assertNoClientSideMultiInsertTransaction(): never {
  throw new StagingEnvironmentBlockedError(
    "Client-side multi-insert is not an atomic transaction — use commit_staging_import_v1 RPC",
  );
}
