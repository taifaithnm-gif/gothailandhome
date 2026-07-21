/**
 * Notification preference helpers (P2-023 / P2-024).
 */

export type NotificationEventType =
  | "lead_received"
  | "lead_status_changed"
  | "saved_search_match"
  | "account_security";

export type NotificationPrefs = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  /** 0–23 UTC inclusive start of quiet hours; null = none */
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  savedSearchAlerts: boolean;
  leadUpdates: boolean;
};

export function defaultNotificationPrefs(): NotificationPrefs {
  return {
    emailEnabled: true,
    pushEnabled: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    savedSearchAlerts: true,
    leadUpdates: true,
  };
}

function inQuietHours(
  prefs: NotificationPrefs,
  at: Date,
): boolean {
  if (prefs.quietHoursStart == null || prefs.quietHoursEnd == null) {
    return false;
  }
  const hour = at.getUTCHours();
  const start = prefs.quietHoursStart;
  const end = prefs.quietHoursEnd;
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  // wraps midnight
  return hour >= start || hour < end;
}

export function shouldSendNotification(
  prefs: NotificationPrefs,
  event: NotificationEventType,
  at: Date = new Date(),
): boolean {
  if (!prefs.emailEnabled && !prefs.pushEnabled) return false;
  if (event === "saved_search_match" && !prefs.savedSearchAlerts) return false;
  if (
    (event === "lead_received" || event === "lead_status_changed") &&
    !prefs.leadUpdates
  ) {
    return false;
  }
  if (event !== "account_security" && inQuietHours(prefs, at)) return false;
  return true;
}
