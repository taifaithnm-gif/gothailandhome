import { isAnalyticsConsentGranted } from "@/lib/analytics/consent";
import {
  ANALYTICS_PII_KEYS,
  type AnalyticsEvent,
  type AnalyticsEventPayload,
} from "@/lib/analytics/types";

const DEDUPE_WINDOW_MS = 2000;

type AdapterKind = "fake" | "ga4";

type TrackRecord = {
  fingerprint: string;
  at: number;
};

const recent: TrackRecord[] = [];
let scriptLoaded = false;

function getMeasurementId(): string {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
  if (!id || id.includes("PLACEHOLDER")) return "";
  return id;
}

/** Adapter kind when consent is already granted. */
export function resolveAdapterKind(): AdapterKind {
  if (!isAnalyticsConsentGranted()) return "fake";
  if (!getMeasurementId()) return "fake";
  if (process.env.NODE_ENV === "test") return "fake";
  return "ga4";
}

function fingerprint(event: AnalyticsEvent): string {
  return `${event.name}:${JSON.stringify(event.properties)}`;
}

function isDuplicate(event: AnalyticsEvent): boolean {
  const fp = fingerprint(event);
  const now = Date.now();
  while (recent.length && now - recent[0]!.at > DEDUPE_WINDOW_MS) {
    recent.shift();
  }
  if (recent.some((row) => row.fingerprint === fp)) return true;
  recent.push({ fingerprint: fp, at: now });
  return false;
}

export function stripPii(properties: AnalyticsEventPayload): AnalyticsEventPayload {
  const out: AnalyticsEventPayload = { ...properties };
  for (const key of ANALYTICS_PII_KEYS) {
    if (key in out) {
      delete (out as Record<string, unknown>)[key];
    }
  }
  return out;
}

function loadGa4Script(measurementId: string): void {
  if (typeof window === "undefined" || scriptLoaded) return;
  scriptLoaded = true;
  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  };
  w.gtag("js", new Date());
  w.gtag("config", measurementId, { send_page_view: false });

  const existing = document.getElementById("gth-ga4");
  if (existing) return;
  const script = document.createElement("script");
  script.id = "gth-ga4";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/** In-memory sink for tests / fake adapter inspection. */
export const fakeAnalyticsSink: AnalyticsEvent[] = [];

export function resetAnalyticsForTests(): void {
  recent.length = 0;
  fakeAnalyticsSink.length = 0;
  scriptLoaded = false;
}

/**
 * Track an approved analytics event. Never throws to callers.
 * Denied/unset consent → no calls. Missing IDs → fake sink only.
 */
export function trackEvent(
  name: AnalyticsEvent["name"],
  properties: AnalyticsEventPayload = {},
): void {
  try {
    if (!isAnalyticsConsentGranted()) return;

    const safe = stripPii(properties);
    const event: AnalyticsEvent = { name, properties: safe };
    if (isDuplicate(event)) return;

    const kind = resolveAdapterKind();
    if (kind === "fake") {
      fakeAnalyticsSink.push(event);
      return;
    }

    const measurementId = getMeasurementId();
    loadGa4Script(measurementId);
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", name, safe);
  } catch {
    // Provider failure must not break pages.
  }
}

export function analyticsNetworkAllowed(): boolean {
  return (
    isAnalyticsConsentGranted() &&
    Boolean(getMeasurementId()) &&
    process.env.NODE_ENV !== "test"
  );
}
