/**
 * P2-062/064 — Legal workflow checklist (informational only).
 */

export const LEGAL_WORKFLOW_DISCLAIMER =
  "Informational checklist only. Not legal advice. Laws change; confirm with a licensed professional and official sources. GoThailandHome does not represent your eligibility or outcomes.";

export type LegalChecklistItemId =
  | "read_foreign_ownership_guide"
  | "confirm_tenure_type"
  | "request_title_documents"
  | "budget_transfer_fees"
  | "licensed_counsel_consult";

export type LegalChecklistItem = {
  id: LegalChecklistItemId;
  titleKey: string;
  helpKey: string;
  guidePath?: string;
};

export const LEGAL_CHECKLIST: LegalChecklistItem[] = [
  {
    id: "read_foreign_ownership_guide",
    titleKey: "itemOwnershipGuide",
    helpKey: "helpOwnershipGuide",
    guidePath: "/knowledge/legal",
  },
  {
    id: "confirm_tenure_type",
    titleKey: "itemTenure",
    helpKey: "helpTenure",
  },
  {
    id: "request_title_documents",
    titleKey: "itemTitleDocs",
    helpKey: "helpTitleDocs",
  },
  {
    id: "budget_transfer_fees",
    titleKey: "itemFees",
    helpKey: "helpFees",
  },
  {
    id: "licensed_counsel_consult",
    titleKey: "itemCounsel",
    helpKey: "helpCounsel",
  },
];

export const LEGAL_FORBIDDEN_SUBSTRINGS = [
  "you qualify",
  "you can legally",
  "we recommend you",
  "legal advice for your",
  "guaranteed ownership",
  "tax avoidance",
] as const;

export function containsForbiddenLegalAdvice(text: string): boolean {
  const lower = text.toLowerCase();
  return LEGAL_FORBIDDEN_SUBSTRINGS.some((token) => lower.includes(token));
}
