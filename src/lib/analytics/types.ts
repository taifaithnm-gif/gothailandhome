export const ANALYTICS_CONSENT_KEY = "gth_analytics_consent";

export type AnalyticsConsent = "granted" | "denied";

export type AnalyticsEventName =
  | "page_view"
  | "listing_filter_apply"
  | "favorite_toggle"
  | "compare_toggle"
  | "lead_intent_submit"
  | "generate_lead"
  | "map_view"
  | "map_pin_select"
  | "tool_mortgage_calculate"
  | "tool_legal_checklist_toggle"
  | "ai_recommend_impression"
  | "ai_recommend_click"
  | "ai_invest_disclaimer_ack"
  | "ai_invest_session_start"
  | "partner_portal_view"
  | "acquisition_case_submit";

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
  district_slug?: string;
  tool?: string;
  ai_mode?: string;
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
