/**
 * In-memory mock repository for commit simulation.
 * Never connects to any database.
 */

import type {
  StagingAsset,
  StagingAuditEvent,
  StagingConflictCandidate,
  StagingDeveloper,
  StagingDuplicateCandidate,
  StagingImportSession,
  StagingNews,
  StagingPdf,
  StagingProject,
  StagingReviewItem,
} from "./types.ts";
import type {
  AssetRepository,
  AuditRepository,
  DeveloperRepository,
  ImportSessionRepository,
  NewsRepository,
  PdfRepository,
  ProjectRepository,
  ReviewRepository,
  StagingTablesSnapshot,
  StagingUnitOfWork,
} from "./repository.ts";
import { StagingDbError } from "./errors.ts";

function clone<T>(v: T): T {
  return structuredClone(v);
}

export class MockStagingRepository implements StagingUnitOfWork {
  readonly importSessions: ImportSessionRepository;
  readonly developers: DeveloperRepository;
  readonly projects: ProjectRepository;
  readonly assets: AssetRepository;
  readonly pdfs: PdfRepository;
  readonly news: NewsRepository;
  readonly reviews: ReviewRepository;
  readonly audit: AuditRepository;

  private sessions: StagingImportSession[] = [];
  private developersRows: StagingDeveloper[] = [];
  private projectsRows: StagingProject[] = [];
  private assetsRows: StagingAsset[] = [];
  private pdfsRows: StagingPdf[] = [];
  private newsRows: StagingNews[] = [];
  private reviewRows: StagingReviewItem[] = [];
  private duplicateRows: StagingDuplicateCandidate[] = [];
  private conflictRows: StagingConflictCandidate[] = [];
  private auditRows: StagingAuditEvent[] = [];

  /** For transaction rollback snapshots. */
  private checkpoint: StagingTablesSnapshot | null = null;

  constructor() {
    this.importSessions = {
      insert: async (row) => {
        if (this.sessions.some((s) => s.idempotency_key === row.idempotency_key)) {
          throw new StagingDbError(
            "DUPLICATE_IDEMPOTENCY_KEY",
            `import session idempotency key exists: ${row.idempotency_key}`,
          );
        }
        this.sessions.push(clone(row));
      },
      updateStatus: async (importSessionId, status) => {
        const row = this.sessions.find(
          (s) => s.import_session_id === importSessionId,
        );
        if (!row) {
          throw new StagingDbError(
            "SESSION_NOT_FOUND",
            `import session not found: ${importSessionId}`,
          );
        }
        row.status = status;
        row.updated_at = row.updated_at;
      },
      findByImportSessionId: async (id) =>
        clone(this.sessions.find((s) => s.import_session_id === id) ?? null),
      findByIdempotencyKey: async (key) =>
        clone(this.sessions.find((s) => s.idempotency_key === key) ?? null),
    };

    this.developers = this.makeEntityRepo(
      () => this.developersRows,
      (rows) => {
        this.developersRows = rows;
      },
    );
    this.projects = this.makeEntityRepo(
      () => this.projectsRows,
      (rows) => {
        this.projectsRows = rows;
      },
    );
    this.assets = {
      ...this.makeEntityRepo(
        () => this.assetsRows,
        (rows) => {
          this.assetsRows = rows;
        },
      ),
      findBySha256: async (sha256) =>
        clone(
          this.assetsRows.find(
            (r) => r.sha256 === sha256 && r.deleted_at == null,
          ) ?? null,
        ),
    };
    this.pdfs = {
      ...this.makeEntityRepo(
        () => this.pdfsRows,
        (rows) => {
          this.pdfsRows = rows;
        },
      ),
      findBySha256: async (sha256) =>
        clone(
          this.pdfsRows.find(
            (r) => r.sha256 === sha256 && r.deleted_at == null,
          ) ?? null,
        ),
    };
    this.news = {
      ...this.makeEntityRepo(
        () => this.newsRows,
        (rows) => {
          this.newsRows = rows;
        },
      ),
      findBySourceUrl: async (url) =>
        clone(
          this.newsRows.find(
            (r) => r.source_url === url && r.deleted_at == null,
          ) ?? null,
        ),
    };
    this.reviews = {
      insert: async (row) => {
        if (this.reviewRows.some((r) => r.idempotency_key === row.idempotency_key)) {
          throw new StagingDbError(
            "DUPLICATE_IDEMPOTENCY_KEY",
            `review idempotency key exists: ${row.idempotency_key}`,
          );
        }
        this.reviewRows.push(clone(row));
      },
      findByIdempotencyKey: async (key) =>
        clone(this.reviewRows.find((r) => r.idempotency_key === key) ?? null),
    };
    this.audit = {
      append: async (row) => {
        this.auditRows.push(clone(row));
      },
      listBySession: async (importSessionId) =>
        clone(
          this.auditRows.filter(
            (r) => r.import_session_id === importSessionId,
          ),
        ),
    };
  }

  private makeEntityRepo<
    T extends {
      idempotency_key: string;
      import_session_id: string;
      deleted_at: string | null;
      updated_at: string;
    },
  >(
    getRows: () => T[],
    setRows: (rows: T[]) => void,
  ): {
    insert: (row: T) => Promise<void>;
    findByIdempotencyKey: (key: string) => Promise<T | null>;
    softDeleteBySession: (importSessionId: string, at: string) => Promise<number>;
  } {
    return {
      insert: async (row) => {
        const rows = getRows();
        if (rows.some((r) => r.idempotency_key === row.idempotency_key)) {
          throw new StagingDbError(
            "DUPLICATE_IDEMPOTENCY_KEY",
            `idempotency key exists: ${row.idempotency_key}`,
          );
        }
        setRows([...rows, clone(row)]);
      },
      findByIdempotencyKey: async (key) =>
        clone(getRows().find((r) => r.idempotency_key === key) ?? null),
      softDeleteBySession: async (importSessionId, at) => {
        let count = 0;
        const next = getRows().map((r) => {
          if (r.import_session_id === importSessionId && r.deleted_at == null) {
            count += 1;
            return { ...r, deleted_at: at, updated_at: at };
          }
          return r;
        });
        setRows(next);
        return count;
      },
    };
  }

  async insertDuplicate(row: StagingDuplicateCandidate): Promise<void> {
    this.duplicateRows.push(clone(row));
  }

  async insertConflict(row: StagingConflictCandidate): Promise<void> {
    this.conflictRows.push(clone(row));
  }

  snapshot(): StagingTablesSnapshot {
    return {
      import_sessions: clone(this.sessions),
      developers: clone(this.developersRows),
      projects: clone(this.projectsRows),
      assets: clone(this.assetsRows),
      pdfs: clone(this.pdfsRows),
      news: clone(this.newsRows),
      review_items: clone(this.reviewRows),
      duplicate_candidates: clone(this.duplicateRows),
      conflict_candidates: clone(this.conflictRows),
      audit_events: clone(this.auditRows),
    };
  }

  beginCheckpoint(): void {
    this.checkpoint = this.snapshot();
  }

  rollbackCheckpoint(): void {
    if (!this.checkpoint) return;
    this.sessions = this.checkpoint.import_sessions;
    this.developersRows = this.checkpoint.developers;
    this.projectsRows = this.checkpoint.projects;
    this.assetsRows = this.checkpoint.assets;
    this.pdfsRows = this.checkpoint.pdfs;
    this.newsRows = this.checkpoint.news;
    this.reviewRows = this.checkpoint.review_items;
    this.duplicateRows = this.checkpoint.duplicate_candidates;
    this.conflictRows = this.checkpoint.conflict_candidates;
    // Audit events are preserved across rollback by design for real DB;
    // simulation of rollback restores pre-tx audit unless preserveAuditOnRollback.
    this.auditRows = this.checkpoint.audit_events;
    this.checkpoint = null;
  }

  /**
   * Soft-delete rollback simulation that preserves audit events.
   */
  async softDeleteSessionKeepingAudit(
    importSessionId: string,
    at: string,
  ): Promise<{ softDeleted: number }> {
    let softDeleted = 0;
    softDeleted += await this.developers.softDeleteBySession(importSessionId, at);
    softDeleted += await this.projects.softDeleteBySession(importSessionId, at);
    softDeleted += await this.assets.softDeleteBySession(importSessionId, at);
    softDeleted += await this.pdfs.softDeleteBySession(importSessionId, at);
    softDeleted += await this.news.softDeleteBySession(importSessionId, at);
    const session = this.sessions.find(
      (s) => s.import_session_id === importSessionId,
    );
    if (session) {
      session.status = "ROLLED_BACK";
      session.updated_at = at;
    }
    return { softDeleted };
  }

  clear(): void {
    this.sessions = [];
    this.developersRows = [];
    this.projectsRows = [];
    this.assetsRows = [];
    this.pdfsRows = [];
    this.newsRows = [];
    this.reviewRows = [];
    this.duplicateRows = [];
    this.conflictRows = [];
    this.auditRows = [];
    this.checkpoint = null;
  }
}
