/**
 * P2-031 — Acquisition case state machine.
 * submit → enrich → review → publish | reject (with unpublish rollback).
 */

export const ACQUISITION_STATUSES = [
  "submitted",
  "enriching",
  "in_review",
  "approved",
  "published",
  "rejected",
  "withdrawn",
] as const;

export type AcquisitionStatus = (typeof ACQUISITION_STATUSES)[number];

export type AcquisitionActorRole = "submitter" | "ops" | "system";

const ALLOWED: Record<AcquisitionStatus, AcquisitionStatus[]> = {
  submitted: ["enriching", "in_review", "rejected", "withdrawn"],
  enriching: ["in_review", "rejected", "withdrawn"],
  in_review: ["enriching", "approved", "rejected"],
  approved: ["published", "rejected", "in_review"],
  published: ["rejected"], // unpublish path: published → rejected (linked draft unpublished)
  rejected: ["in_review"], // reopen for correction
  withdrawn: [],
};

export function isAcquisitionStatus(value: string): value is AcquisitionStatus {
  return (ACQUISITION_STATUSES as readonly string[]).includes(value);
}

export function canTransitionAcquisition(
  from: AcquisitionStatus,
  to: AcquisitionStatus,
  actor: AcquisitionActorRole = "ops",
): boolean {
  if (from === to) return true;
  if (actor === "submitter") {
    if (from === "submitted" && to === "withdrawn") return true;
    return false;
  }
  return ALLOWED[from]?.includes(to) ?? false;
}

export function requiresEvidenceForPublish(status: AcquisitionStatus): boolean {
  return status === "approved" || status === "published";
}
