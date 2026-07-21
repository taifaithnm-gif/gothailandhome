/**
 * Lead lifecycle vocabulary (P2-020) — aligned with marketplace_leads statuses.
 */

export const LEAD_STATUSES = [
  "new",
  "qualified",
  "assigned",
  "contacted",
  "viewing_scheduled",
  "negotiating",
  "won",
  "lost",
  "spam",
  "archived",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_OUTCOMES = [
  "open",
  "won",
  "lost_price",
  "lost_timing",
  "lost_other",
  "spam",
  "duplicate",
] as const;

export type LeadOutcome = (typeof LEAD_OUTCOMES)[number];

/** Soft SLA targets (hours) from entering the status. */
export const SLA_HOURS_BY_STATUS: Record<LeadStatus, number> = {
  new: 4,
  qualified: 8,
  assigned: 12,
  contacted: 24,
  viewing_scheduled: 72,
  negotiating: 120,
  won: 0,
  lost: 0,
  spam: 0,
  archived: 0,
};

const ALLOWED: Record<LeadStatus, LeadStatus[]> = {
  new: ["qualified", "assigned", "contacted", "spam", "archived", "lost"],
  qualified: ["assigned", "contacted", "spam", "archived", "lost"],
  assigned: ["contacted", "viewing_scheduled", "negotiating", "lost", "spam"],
  contacted: ["viewing_scheduled", "negotiating", "won", "lost", "archived"],
  viewing_scheduled: ["negotiating", "won", "lost", "contacted"],
  negotiating: ["won", "lost", "viewing_scheduled"],
  won: ["archived"],
  lost: ["archived", "new"],
  spam: ["archived"],
  archived: [],
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export function canTransitionLeadStatus(
  from: LeadStatus,
  to: LeadStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function isSlaBreached(input: {
  status: LeadStatus;
  statusChangedAt: string | Date;
  now?: Date;
}): boolean {
  const hours = SLA_HOURS_BY_STATUS[input.status];
  if (!hours) return false;
  const changed =
    input.statusChangedAt instanceof Date
      ? input.statusChangedAt
      : new Date(input.statusChangedAt);
  const now = input.now ?? new Date();
  const elapsedMs = now.getTime() - changed.getTime();
  return elapsedMs > hours * 60 * 60 * 1000;
}
