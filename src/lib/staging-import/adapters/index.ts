/**
 * Goth Batch adapters — public boundary exports.
 * Core staging-import modules should import ImportBatch only, not Windows01 fields.
 */

export {
  GOTH_ADAPTER_VERSION,
  EXPECTED_GOTH_BATCH_ID,
  EXPECTED_GOTH_JOB_ID,
  EXPECTED_GOTH_SCHEMA,
  GOTH_REVIEW_STATES,
  FORBIDDEN_GOTH_AUTOMATION_STATES,
} from "./goth-types.ts";
export type {
  GothMappedReviewState,
  GothAssetDecision,
  GothIdentityStatus,
  GothSourceMeta,
  GothDeveloperRecord,
  GothProjectRecord,
  GothImageRecord,
  GothPdfRecord,
  GothNewsRecord,
  GothReviewCandidate,
  GothPreviewActionRow,
  GothAdapterContext,
  GothAdapterResult,
  GothPerformanceMetrics,
} from "./goth-types.ts";

export {
  validateGothBatchInput,
  adaptGothBatchFromDir,
} from "./goth-batch-adapter.ts";
export type {
  GothBatchAdapterOptions,
  GothInputValidation,
} from "./goth-batch-adapter.ts";

export {
  adaptGothDeveloper,
  adaptGothDevelopers,
  stableUnknownDeveloperId,
  toImportDeveloper,
} from "./goth-developer-adapter.ts";

export {
  adaptGothProject,
  adaptGothProjects,
  toImportProject,
} from "./goth-project-adapter.ts";

export {
  adaptGothImage,
  adaptGothImages,
  toImportImage,
} from "./goth-image-adapter.ts";

export {
  adaptGothPdf,
  adaptGothPdfs,
  toImportPdf,
} from "./goth-pdf-adapter.ts";

export {
  adaptGothNews,
  adaptGothNewsList,
  toImportNews,
} from "./goth-news-adapter.ts";

export {
  mapWindows01ReasonToReview,
  adaptGothReviewItem,
  adaptGothReviewItems,
  buildEntityReviewCandidates,
  assertAutomationCeiling,
} from "./goth-review-adapter.ts";

export {
  normalizeName,
  slugCandidate,
  sha256Text,
  escapeHtml,
  safeRelativePath,
  isSafeHttpUrl,
  assertNoAbsolutePathLeak,
} from "./goth-helpers.ts";
