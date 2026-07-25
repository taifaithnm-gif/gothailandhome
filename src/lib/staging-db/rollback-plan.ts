/**
 * Rollback plan design — soft-delete by import_session_id.
 * Never executes real rollback against a database.
 */

export type RollbackPlan = {
  status: "SIMULATED_ONLY";
  strategy: "soft_delete_by_import_session_id";
  import_session_id: string;
  source_batch_id: string;
  steps: Array<{
    step: string;
    action: string;
    notes: string;
  }>;
  preserve_audit_events: true;
  preserve_batch_reference: true;
  cancel_pending_storage_uploads: true;
  prohibit_after_production_publication: true;
  dry_run: true;
  executed: false;
  database_writes: 0;
};

export function buildRollbackPlan(input: {
  importSessionId: string;
  sourceBatchId: string;
}): RollbackPlan {
  return {
    status: "SIMULATED_ONLY",
    strategy: "soft_delete_by_import_session_id",
    import_session_id: input.importSessionId,
    source_batch_id: input.sourceBatchId,
    steps: [
      {
        step: "1",
        action: "VALIDATE_NOT_PUBLISHED",
        notes: "Refuse rollback if any entity reached production publication",
      },
      {
        step: "2",
        action: "CANCEL_PENDING_STORAGE",
        notes: "Mark planned uploads cancelled; never delete remote objects blindly",
      },
      {
        step: "3",
        action: "SOFT_DELETE_ENTITIES",
        notes:
          "Set deleted_at on staging_developers/projects/assets/pdfs/news/duplicates/conflicts",
      },
      {
        step: "4",
        action: "UPDATE_SESSION_STATUS",
        notes: "Set import session status to ROLLED_BACK",
      },
      {
        step: "5",
        action: "APPEND_AUDIT",
        notes: "Preserve and append rollback audit events (append-only)",
      },
      {
        step: "6",
        action: "PRESERVE_BATCH_REFERENCE",
        notes: "Keep source_batch_id / sealed zip hashes for forensics",
      },
    ],
    preserve_audit_events: true,
    preserve_batch_reference: true,
    cancel_pending_storage_uploads: true,
    prohibit_after_production_publication: true,
    dry_run: true,
    executed: false,
    database_writes: 0,
  };
}
