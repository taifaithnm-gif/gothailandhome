import type { EvidenceReviewCard, ImportAdapterResult } from "./types.ts";

/**
 * Preview review data package — prepared for a future Preview UI.
 * Must not connect to Production.
 */
export type PreviewReviewPackage = {
  generatedAt: string;
  productionConnected: false;
  batchId: string;
  cards: EvidenceReviewCard[];
  fields: readonly [
    "Developer",
    "Project",
    "Province",
    "Source URL",
    "Evidence",
    "Image",
    "PDF",
    "News",
    "Hash",
    "Review Status",
  ];
  note: string;
};

export function buildPreviewReviewPackage(
  batchId: string,
  result: ImportAdapterResult,
): PreviewReviewPackage {
  return {
    generatedAt: new Date().toISOString(),
    productionConnected: false,
    batchId,
    cards: result.reviewCards ?? [],
    fields: [
      "Developer",
      "Project",
      "Province",
      "Source URL",
      "Evidence",
      "Image",
      "PDF",
      "News",
      "Hash",
      "Review Status",
    ],
    note: "Human review required. Adapter never auto-approves. Production not connected.",
  };
}

export function previewCardRows(cards: EvidenceReviewCard[]): Array<Record<string, string>> {
  return cards.map((c) => ({
    Developer: c.developer ?? "",
    Project: c.project ?? "",
    Province: c.province ?? "",
    "Source URL": c.sourceUrl ?? "",
    Evidence: c.evidence.join(", "),
    Image: c.image ?? "",
    PDF: c.pdf ?? "",
    News: c.news ?? "",
    Hash: c.hash,
    "Review Status": c.reviewStatus,
  }));
}
