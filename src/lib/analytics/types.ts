export const ANALYTICS_CONSENT_KEY = "gth_analytics_consent";

export type AnalyticsConsent = "granted" | "denied";

export type AnalyticsEventName =
  | "page_view"
  | "listing_filter_apply"
  | "favorite_toggle"
  | "compare_toggle"
  | "lead_intent_submit"
  | "generate_lead";

export type LeadType =
  | "find_my_home"
  | "list_property"
  | "viewing"
  | "project"
  | "developer_partner"
  | "agency_partner"
  | "platform_support"
  | "contact";

export type AnalyticsEventPayload = {
  locale?: string;
  path?: string;
  filter_keys?: string[];
  property_slug?: string;
  project_slug?: string;
  action?: "add" | "remove";
  lead_type?: LeadType;
  surface?: string;
};

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  properties: AnalyticsEventPayload;
};

/** Properties that must never appear in analytics payloads. */
export const ANALYTICS_PII_KEYS = [
  "name",
  "email",
  "phone",
  "line",
  "whatsapp",
  "message",
  "notes",
  "budget",
  "budget_min",
  "budget_max",
] as const;
