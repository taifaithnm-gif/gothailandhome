import {
  ANALYTICS_CONSENT_KEY,
  type AnalyticsConsent,
} from "@/lib/analytics/types";

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    return null;
  }
  return null;
}

export function writeAnalyticsConsent(value: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // Ignore quota / private-mode failures — treat as no persistence.
  }
}

export function isAnalyticsConsentGranted(): boolean {
  return readAnalyticsConsent() === "granted";
}
