/**
 * Repository interfaces for staging DB (design). Implementations may be mock-only.
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

export type StagingTablesSnapshot = {
  import_sessions: StagingImportSession[];
  developers: StagingDeveloper[];
  projects: StagingProject[];
  assets: StagingAsset[];
  pdfs: StagingPdf[];
  news: StagingNews[];
  review_items: StagingReviewItem[];
  duplicate_candidates: StagingDuplicateCandidate[];
  conflict_candidates: StagingConflictCandidate[];
  audit_events: StagingAuditEvent[];
};

export interface ImportSessionRepository {
  insert(row: StagingImportSession): Promise<void>;
  updateStatus(
    importSessionId: string,
    status: StagingImportSession["status"],
  ): Promise<void>;
  findByImportSessionId(
    importSessionId: string,
  ): Promise<StagingImportSession | null>;
  findByIdempotencyKey(
    key: string,
  ): Promise<StagingImportSession | null>;
}

export interface DeveloperRepository {
  insert(row: StagingDeveloper): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingDeveloper | null>;
  softDeleteBySession(importSessionId: string, at: string): Promise<number>;
}

export interface ProjectRepository {
  insert(row: StagingProject): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingProject | null>;
  softDeleteBySession(importSessionId: string, at: string): Promise<number>;
}

export interface AssetRepository {
  insert(row: StagingAsset): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingAsset | null>;
  findBySha256(sha256: string): Promise<StagingAsset | null>;
  softDeleteBySession(importSessionId: string, at: string): Promise<number>;
}

export interface PdfRepository {
  insert(row: StagingPdf): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingPdf | null>;
  findBySha256(sha256: string): Promise<StagingPdf | null>;
  softDeleteBySession(importSessionId: string, at: string): Promise<number>;
}

export interface NewsRepository {
  insert(row: StagingNews): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingNews | null>;
  findBySourceUrl(url: string): Promise<StagingNews | null>;
  softDeleteBySession(importSessionId: string, at: string): Promise<number>;
}

export interface ReviewRepository {
  insert(row: StagingReviewItem): Promise<void>;
  findByIdempotencyKey(key: string): Promise<StagingReviewItem | null>;
}

export interface AuditRepository {
  /** Append-only. No update/delete methods. */
  append(row: StagingAuditEvent): Promise<void>;
  listBySession(importSessionId: string): Promise<readonly StagingAuditEvent[]>;
}

export interface StagingUnitOfWork {
  importSessions: ImportSessionRepository;
  developers: DeveloperRepository;
  projects: ProjectRepository;
  assets: AssetRepository;
  pdfs: PdfRepository;
  news: NewsRepository;
  reviews: ReviewRepository;
  audit: AuditRepository;
  insertDuplicate(row: StagingDuplicateCandidate): Promise<void>;
  insertConflict(row: StagingConflictCandidate): Promise<void>;
  snapshot(): StagingTablesSnapshot;
}
