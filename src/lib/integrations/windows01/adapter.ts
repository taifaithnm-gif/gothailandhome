import { createHash, randomUUID } from "node:crypto";

import type {
  DryRunImportSummary,
  DuplicateHit,
  EvidenceReviewCard,
  ImportAdapterResult,
  ImportAuditEvent,
  ImportMode,
  QuarantineItem,
  Windows01BatchV0,
  Windows01ImportAdapter,
  Windows01ManifestV0,
  Windows01RecordV0,
  Windows01ReviewState,
  Windows01SchemaVersion,
} from "./types.ts";
import { SUPPORTED_WINDOWS01_SCHEMA_VERSIONS } from "./types.ts";
import {
  assertEvidenceIntegrity,
  validateManifest,
  validateRecord,
  Windows01ValidationError,
} from "./validate.ts";
import {
  canTransition,
  initialEvidenceReviewStatus,
  initialReviewState,
} from "./review-state.ts";
import { DuplicateIndex, duplicateReason } from "./duplicate.ts";
import { buildEvidenceReviewCard } from "./evidence-review.ts";
import { resolveDeployEnv } from "../../env/deploy-env.ts";

function hashEvent(
  prevHash: string | undefined,
  payload: Record<string, unknown>,
): string {
  return createHash("sha256")
    .update(JSON.stringify({ prevHash: prevHash ?? null, ...payload }))
    .digest("hex");
}

function appendAudit(
  events: ImportAuditEvent[],
  partial: Omit<ImportAuditEvent, "id" | "at" | "eventHash" | "prevHash">,
): void {
  const prevHash = events.length ? events[events.length - 1]!.eventHash : undefined;
  const at = new Date().toISOString();
  const id = randomUUID();
  const eventHash = hashEvent(prevHash, { id, at, ...partial });
  events.push({ id, at, prevHash, eventHash, ...partial });
}

function quarantineFromError(
  batchId: string,
  err: unknown,
  recordId?: string,
): QuarantineItem {
  const code =
    err instanceof Windows01ValidationError ? err.code : "SAFETY_FAIL";
  return {
    batchId,
    recordId,
    reason: code as QuarantineItem["reason"],
    message: err instanceof Error ? err.message : String(err),
    at: new Date().toISOString(),
  };
}

/**
 * Staging-only import adapter. Production mode is hard-blocked.
 * Dry-run never writes a database and never auto-approves.
 */
export class StagingWindows01ImportAdapter implements Windows01ImportAdapter {
  readonly supportedSchemas = SUPPORTED_WINDOWS01_SCHEMA_VERSIONS;

  validateManifest(manifest: unknown): Windows01ManifestV0 {
    return validateManifest(manifest);
  }

  validateRecord(record: unknown): Windows01RecordV0 {
    return validateRecord(record);
  }

  runImport(batch: Windows01BatchV0, mode: ImportMode): ImportAdapterResult {
    const audit: ImportAuditEvent[] = [];
    const quarantined: QuarantineItem[] = [];
    const nextStates: Array<{ recordId: string; state: Windows01ReviewState }> =
      [];
    const duplicates: DuplicateHit[] = [];
    const reviewCards: EvidenceReviewCard[] = [];

    const deployEnv = resolveDeployEnv();
    if (mode === "blocked-production" || deployEnv === "production") {
      appendAudit(audit, {
        actor: "system",
        action: "production_import_hard_block",
        batchId: batch.manifest.batchId,
        detail: { mode, deployEnv },
      });
      quarantined.push({
        batchId: batch.manifest.batchId,
        reason: "PRODUCTION_HARD_BLOCK",
        message: "Windows01 import is hard-blocked in production.",
        at: new Date().toISOString(),
      });
      return {
        mode: "blocked-production",
        accepted: 0,
        quarantined,
        audit,
        nextStates,
        duplicates,
        reviewCards,
      };
    }

    if (mode !== "dry-run" && mode !== "staging") {
      throw new Error(`Unsupported import mode: ${mode}`);
    }

    let manifest: Windows01ManifestV0;
    try {
      manifest = this.validateManifest(batch.manifest);
    } catch (err) {
      quarantined.push(quarantineFromError(batch.manifest.batchId, err));
      appendAudit(audit, {
        actor: "system",
        action: "manifest_rejected",
        batchId: batch.manifest.batchId,
        detail: { error: err instanceof Error ? err.message : String(err) },
      });
      return {
        mode,
        accepted: 0,
        quarantined,
        audit,
        nextStates,
        duplicates,
        reviewCards,
        dryRunSummary:
          mode === "dry-run"
            ? emptyDryRunSummary(batch.manifest.batchId, batch.records.length, quarantined.length)
            : undefined,
      };
    }

    appendAudit(audit, {
      actor: "system",
      action: "manifest_validated",
      batchId: manifest.batchId,
      detail: {
        recordCount: manifest.recordCount,
        workerVersion: manifest.workerVersion,
        contentHash: manifest.contentHash,
      },
    });

    if (batch.records.length !== manifest.recordCount) {
      quarantined.push({
        batchId: manifest.batchId,
        reason: "INVALID_MANIFEST",
        message: "manifest.recordCount does not match records length",
        at: new Date().toISOString(),
      });
      return {
        mode,
        accepted: 0,
        quarantined,
        audit,
        nextStates,
        duplicates,
        reviewCards,
        dryRunSummary:
          mode === "dry-run"
            ? emptyDryRunSummary(manifest.batchId, batch.records.length, quarantined.length)
            : undefined,
      };
    }

    const dupIndex = new DuplicateIndex();
    let accepted = 0;
    let schemaValid = 0;
    let schemaInvalid = 0;
    let duplicateSkipped = 0;

    for (const raw of batch.records) {
      let record: Windows01RecordV0;
      try {
        record = this.validateRecord(raw);
        assertEvidenceIntegrity(manifest, record);
        schemaValid += 1;
      } catch (err) {
        schemaInvalid += 1;
        quarantined.push(
          quarantineFromError(
            manifest.batchId,
            err,
            typeof (raw as { recordId?: string })?.recordId === "string"
              ? (raw as { recordId: string }).recordId
              : undefined,
          ),
        );
        continue;
      }

      const hits = dupIndex.check(record);
      if (hits.length > 0) {
        duplicateSkipped += 1;
        duplicates.push(...hits);
        const primary = hits[0]!;
        quarantined.push({
          batchId: manifest.batchId,
          recordId: record.recordId,
          reason: duplicateReason(primary.key),
          message: `Duplicate ${primary.key}=${primary.value} (prior ${primary.priorRecordId}); skipped`,
          at: new Date().toISOString(),
        });
        appendAudit(audit, {
          actor: "system",
          action: "duplicate_skip",
          batchId: manifest.batchId,
          recordId: record.recordId,
          detail: { hits },
        });
        continue;
      }
      dupIndex.index(record);

      let state = initialReviewState();
      const path: Windows01ReviewState[] = [
        "MANIFEST_VALIDATED",
        "SCHEMA_VALIDATED",
        "SAFETY_CHECKED",
        "DEDUPED",
        "ENTITY_MATCHED",
        mode === "dry-run" ? "AWAITING_HUMAN_REVIEW" : "STAGING_IMPORTED",
      ];
      for (const next of path) {
        if (!canTransition(state, next)) {
          quarantined.push({
            batchId: manifest.batchId,
            recordId: record.recordId,
            reason: "CONFLICT",
            message: `Illegal review transition ${state} → ${next}`,
            at: new Date().toISOString(),
          });
          state = "QUARANTINED";
          break;
        }
        state = next;
      }

      if (state === "QUARANTINED") {
        nextStates.push({ recordId: record.recordId, state });
        continue;
      }

      // Evidence review always NEW — never auto APPROVED.
      const reviewStatus = initialEvidenceReviewStatus();
      const card = buildEvidenceReviewCard(record, state, reviewStatus);
      reviewCards.push(card);

      accepted += 1;
      nextStates.push({ recordId: record.recordId, state });
      appendAudit(audit, {
        actor: "system",
        action: mode === "dry-run" ? "dry_run_accept" : "staging_import_accept",
        batchId: manifest.batchId,
        recordId: record.recordId,
        detail: {
          state,
          reviewStatus,
          contentHash: record.contentHash,
          databaseWrite: false,
          autoApproved: false,
        },
      });
    }

    const dryRunSummary: DryRunImportSummary | undefined =
      mode === "dry-run"
        ? {
            mode: "dry-run",
            batchId: manifest.batchId,
            ranAt: new Date().toISOString(),
            databaseWrites: 0,
            productionChanged: false,
            autoApproved: false,
            totalRecords: batch.records.length,
            schemaValid,
            schemaInvalid,
            duplicateSkipped,
            quarantined: quarantined.length,
            reviewCardsPrepared: reviewCards.length,
            // Simulated 100% of accepted records as import-ready candidates only.
            simulatedImportReady: accepted,
            simulatedImported: accepted,
            coveragePercent:
              batch.records.length === 0
                ? 100
                : Math.round((accepted / batch.records.length) * 1000) / 10,
            nextStates,
            reviewStatuses: reviewCards.map((c) => ({
              recordId: c.recordId,
              status: c.reviewStatus,
            })),
          }
        : undefined;

    return {
      mode,
      accepted,
      quarantined,
      audit,
      nextStates,
      duplicates,
      reviewCards,
      dryRunSummary,
    };
  }
}

function emptyDryRunSummary(
  batchId: string,
  totalRecords: number,
  quarantined: number,
): DryRunImportSummary {
  return {
    mode: "dry-run",
    batchId,
    ranAt: new Date().toISOString(),
    databaseWrites: 0,
    productionChanged: false,
    autoApproved: false,
    totalRecords,
    schemaValid: 0,
    schemaInvalid: totalRecords,
    duplicateSkipped: 0,
    quarantined,
    reviewCardsPrepared: 0,
    simulatedImportReady: 0,
    simulatedImported: 0,
    coveragePercent: 0,
    nextStates: [],
    reviewStatuses: [],
  };
}

export function createWindows01ImportAdapter(): Windows01ImportAdapter {
  return new StagingWindows01ImportAdapter();
}

export type { Windows01SchemaVersion };
