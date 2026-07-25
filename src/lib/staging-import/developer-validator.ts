/**
 * Developer validation — aliases, UNKNOWN, website/DNS, confidence.
 * Never auto-approves.
 */

import type {
  ConfidenceLevel,
  DeveloperCandidate,
  ValidationIssue,
} from "./types.ts";

function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type DeveloperValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
  normalizedName: string | null;
  isUnknown: boolean;
  confidence: ConfidenceLevel;
  needsReview: boolean;
};

export function validateDeveloper(
  candidate: DeveloperCandidate,
): DeveloperValidationResult {
  const issues: ValidationIssue[] = [];
  const name = (candidate.name ?? "").trim();
  const isUnknown =
    Boolean(candidate.unknown) ||
    !name ||
    normalizeName(name) === "unknown" ||
    candidate.id === "dev-unknown";

  if (!candidate.id) {
    issues.push({
      code: "DEVELOPER_MISSING_ID",
      severity: "error",
      entityType: "developer",
      message: "Developer id is required",
    });
  }
  if (!name) {
    issues.push({
      code: "DEVELOPER_MISSING_NAME",
      severity: "error",
      entityType: "developer",
      entityId: candidate.id,
      message: "Developer name is required",
      field: "name",
    });
  }
  if (isUnknown) {
    issues.push({
      code: "DEVELOPER_UNKNOWN",
      severity: "warning",
      entityType: "developer",
      entityId: candidate.id,
      message: "Developer marked UNKNOWN — requires human review",
    });
  }
  if (candidate.dnsFailure) {
    issues.push({
      code: "DEVELOPER_DNS_FAILURE",
      severity: "warning",
      entityType: "developer",
      entityId: candidate.id,
      message: "Official website DNS failure — review required",
      field: "officialWebsite",
    });
  }
  if (
    candidate.officialWebsite &&
    !/^https?:\/\//i.test(candidate.officialWebsite)
  ) {
    issues.push({
      code: "DEVELOPER_WEBSITE_INVALID",
      severity: "error",
      entityType: "developer",
      entityId: candidate.id,
      message: "Official website must be http(s) URL",
      field: "officialWebsite",
    });
  }
  if (!candidate.evidence || candidate.evidence.length === 0) {
    issues.push({
      code: "DEVELOPER_MISSING_EVIDENCE",
      severity: "warning",
      entityType: "developer",
      entityId: candidate.id,
      message: "No evidence attached",
    });
  }

  let confidence: ConfidenceLevel =
    candidate.confidence ?? (isUnknown ? "UNKNOWN" : "MEDIUM");
  if (candidate.dnsFailure || isUnknown) confidence = "LOW";
  if (
    !isUnknown &&
    candidate.officialWebsite &&
    !candidate.dnsFailure &&
    (candidate.evidence?.length ?? 0) > 0
  ) {
    confidence = candidate.confidence === "HIGH" ? "HIGH" : "MEDIUM";
  }

  const needsReview =
    isUnknown ||
    candidate.dnsFailure ||
    confidence === "LOW" ||
    confidence === "UNKNOWN" ||
    issues.some((i) => i.severity === "error");

  const ok = !issues.some((i) => i.severity === "error");

  return {
    ok,
    issues,
    normalizedName: name ? normalizeName(name) : null,
    isUnknown,
    confidence,
    needsReview,
  };
}

export function expandDeveloperAliases(
  candidate: DeveloperCandidate,
): string[] {
  const set = new Set<string>();
  if (candidate.name) set.add(normalizeName(candidate.name));
  for (const a of candidate.aliases ?? []) {
    if (a.trim()) set.add(normalizeName(a));
  }
  if (candidate.slug) set.add(normalizeName(candidate.slug));
  return [...set];
}
