export {
  analyticsNetworkAllowed,
  fakeAnalyticsSink,
  resetAnalyticsForTests,
  resolveAdapterKind,
  stripPii,
  trackEvent,
} from "@/lib/analytics/adapter";
export {
  isAnalyticsConsentGranted,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/lib/analytics/consent";
export {
  trackCompareToggle,
  trackFavoriteToggle,
  trackGenerateLead,
  trackLeadIntentSubmit,
  trackListingFilterApply,
  trackPageView,
} from "@/lib/analytics/events";
export type {
  AnalyticsConsent,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventPayload,
  LeadType,
} from "@/lib/analytics/types";
export { ANALYTICS_CONSENT_KEY, ANALYTICS_PII_KEYS } from "@/lib/analytics/types";
