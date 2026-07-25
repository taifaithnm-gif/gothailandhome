/**
 * Goth Batch Adapter types — Windows01 Goth schema boundary.
 * staging-import core must not depend on Windows01 raw field names.
 */

import type {
  ConfidenceLevel,
  EvidenceRef,
  ImportBatch,
  PreviewAction,
  SourceProvenance,
} from "../types.ts";
import { GOTH_BATCH_MANIFEST_SCHEMA_V1 } from "../../integrations/windows01/contract-versions.ts";

export const GOTH_ADAPTER_VERSION = "1.0.0" as const;
export const EXPECTED_GOTH_BATCH_ID = "BATCH-GTH-20260724-001" as const;
export const EXPECTED_GOTH_JOB_ID = "JOB-GTH-DISCOVERY-20260724-001" as const;
export const EXPECTED_GOTH_SCHEMA = GOTH_BATCH_MANIFEST_SCHEMA_V1;

export const GOTH_REVIEW_STATES = [
  "RECEIVED",
  "VALIDATED",
  "REVIEW_REQUIRED",
  "CONFLICT",
  "DUPLICATE",
  "READY_FOR_APPROVAL",
  "REJECTED",
  "QUARANTINED",
] as const;

export type GothMappedReviewState = (typeof GOTH_REVIEW_STATES)[number];

export const FORBIDDEN_GOTH_AUTOMATION_STATES = [
  "APPROVED",
  "READY_FOR_PRODUCTION",
  "PUBLISHED",
] as const;

export type GothAssetDecision =
  | "ACCEPT_CANDIDATE"
  | "REVIEW_REQUIRED"
  | "DUPLICATE_CANDIDATE"
  | "REJECTED"
  | "QUARANTINED";

export type GothIdentityStatus = "KNOWN" | "UNKNOWN" | "CANDIDATE";

export type GothSourceMeta = SourceProvenance & {
  sourceRecordId: string;
  sourceSchema: string;
  sourceBatchId: string;
  sourceJobId: string;
};

export type GothDeveloperRecord = {
  id: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  officialWebsite: string | null;
  officialWebsiteVerified: boolean;
  resolutionMethod: string | null;
  confidence: ConfidenceLevel;
  evidence: EvidenceRef[];
  dnsStatus: "ok" | "failed" | "unknown" | "unverified";
  sourceUrl: string | null;
  reviewState: GothMappedReviewState;
  identityStatus: GothIdentityStatus;
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  provenance: GothSourceMeta;
};

export type GothProjectRecord = {
  id: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  slugCandidate: string;
  developerCandidateId: string | null;
  developerIdentityStatus: GothIdentityStatus;
  province: string | null;
  provinceConfidence: ConfidenceLevel;
  provinceConflict: boolean;
  location: string | null;
  sourceUrl: string | null;
  sourceDomain: string | null;
  evidence: EvidenceRef[];
  imageIds: string[];
  pdfIds: string[];
  newsIds: string[];
  reviewState: GothMappedReviewState;
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  provenance: GothSourceMeta;
};

export type GothImageRecord = {
  id: string;
  sourceId: string;
  hash: string;
  projectId: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
  relativePreviewPath: string | null;
  fileExists: boolean;
  extensionConsistent: boolean;
  linkageOk: boolean;
  isPlaceholder: boolean;
  isTrackingPixel: boolean;
  isLogoCandidate: boolean;
  decision: GothAssetDecision;
  issues: string[];
  evidence: EvidenceRef[];
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  provenance: GothSourceMeta;
};

export type GothPdfRecord = {
  id: string;
  sourceId: string;
  hash: string;
  mime: string | null;
  pages: number | null;
  category: "brochure" | "floor_plan" | "price_list" | "company_profile" | "unknown";
  projectId: string | null;
  relativePreviewPath: string | null;
  fileExists: boolean;
  pdfMagicOk: boolean;
  htmlDisguised: boolean;
  decision: GothAssetDecision;
  issues: string[];
  evidence: EvidenceRef[];
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  provenance: GothSourceMeta;
};

export type GothNewsRecord = {
  id: string;
  sourceId: string;
  title: string | null;
  normalizedTitle: string | null;
  sourceUrl: string;
  sourceDomain: string | null;
  publishedAt: string | null;
  capturedAt: string | null;
  freshnessDays: number | null;
  freshness: "fresh" | "stale" | "unknown";
  developerCandidateId: string | null;
  projectCandidateId: string | null;
  duplicateUrl: boolean;
  duplicateTitle: boolean;
  reviewState: GothMappedReviewState;
  evidence: EvidenceRef[];
  rawPayload: Record<string, unknown>;
  unsupportedFields: string[];
  provenance: GothSourceMeta;
};

export type GothReviewCandidate = {
  candidateId: string;
  entityType: "developer" | "project" | "image" | "pdf" | "news" | "review_item";
  entityId: string;
  sourceReason: string;
  mappedReason: string;
  severity: "low" | "medium" | "high";
  evidence: EvidenceRef[];
  suggestedAction: string;
  blocking: boolean;
  reviewerNotes: string;
  createdAt: string;
  reviewState: GothMappedReviewState;
  /** Automation may never set these. */
  approved: false;
  published: false;
};

export type GothPreviewActionRow = {
  action: PreviewAction;
  entityType: "developer" | "project" | "image" | "pdf" | "news";
  entityId: string;
  reason: string;
  confidence: ConfidenceLevel;
  evidence: EvidenceRef[];
  blocking: boolean;
  sourceRecordId: string;
};

export type GothAdapterContext = {
  batchId: string;
  jobId: string;
  schemaVersion: string;
  batchDir: string;
  generatedAt: string;
};

export type GothAdapterResult = {
  ok: boolean;
  context: GothAdapterContext;
  importBatch: ImportBatch;
  developers: GothDeveloperRecord[];
  projects: GothProjectRecord[];
  images: GothImageRecord[];
  pdfs: GothPdfRecord[];
  news: GothNewsRecord[];
  reviewCandidates: GothReviewCandidate[];
  unsupportedFields: Array<{
    entityType: string;
    entityId: string;
    fields: string[];
  }>;
  blockers: string[];
  validationErrors: string[];
};

export type GothPerformanceMetrics = {
  zipVerifyMs: number;
  extractionMs: number;
  adapterMs: number;
  validationMs: number;
  duplicateMs: number;
  previewMs: number;
  totalMs: number;
  peakMemoryMbEstimate: number;
};
