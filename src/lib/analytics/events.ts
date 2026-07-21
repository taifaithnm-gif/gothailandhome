import { trackEvent } from "@/lib/analytics/adapter";
import { isPhase2AnalyticsExpansionEnabled } from "@/lib/feature-flags";
import type { LeadType } from "@/lib/analytics/types";

export function trackPageView(locale: string, path: string): void {
  trackEvent("page_view", { locale, path });
}

export function trackListingFilterApply(
  locale: string,
  filterKeys: string[],
): void {
  trackEvent("listing_filter_apply", {
    locale,
    filter_keys: [...filterKeys].sort(),
  });
}

export function trackFavoriteToggle(
  locale: string,
  propertySlug: string,
  action: "add" | "remove",
): void {
  trackEvent("favorite_toggle", {
    locale,
    property_slug: propertySlug,
    action,
  });
}

export function trackCompareToggle(
  locale: string,
  propertySlug: string,
  action: "add" | "remove",
): void {
  trackEvent("compare_toggle", {
    locale,
    property_slug: propertySlug,
    action,
  });
}

export function trackLeadIntentSubmit(
  locale: string,
  leadType: LeadType,
  surface: string,
): void {
  trackEvent("lead_intent_submit", {
    locale,
    lead_type: leadType,
    surface,
  });
}

export function trackGenerateLead(
  locale: string,
  projectSlug: string,
): void {
  trackEvent("generate_lead", {
    locale,
    project_slug: projectSlug,
    surface: "project",
  });
}

/** Phase 2 expanded events — no-op unless FEATURE_P2_ANALYTICS_EXPANSION is on. */
function phase2Track(
  name:
    | "map_view"
    | "map_pin_select"
    | "tool_mortgage_calculate"
    | "tool_legal_checklist_toggle"
    | "ai_recommend_impression"
    | "ai_recommend_click"
    | "ai_invest_disclaimer_ack"
    | "ai_invest_session_start"
    | "partner_portal_view"
    | "acquisition_case_submit",
  properties: Parameters<typeof trackEvent>[1],
): void {
  if (!isPhase2AnalyticsExpansionEnabled()) return;
  trackEvent(name, properties);
}

export function trackMapView(locale: string, path: string): void {
  phase2Track("map_view", { locale, path, surface: "map" });
}

export function trackMapPinSelect(locale: string, propertySlug: string): void {
  phase2Track("map_pin_select", {
    locale,
    property_slug: propertySlug,
    surface: "map",
  });
}

export function trackToolMortgageCalculate(locale: string): void {
  phase2Track("tool_mortgage_calculate", {
    locale,
    tool: "mortgage",
    surface: "tools",
  });
}

export function trackToolLegalChecklistToggle(locale: string): void {
  phase2Track("tool_legal_checklist_toggle", {
    locale,
    tool: "legal",
    surface: "tools",
  });
}

export function trackAiRecommendImpression(
  locale: string,
  propertySlug: string,
  aiMode: string,
): void {
  phase2Track("ai_recommend_impression", {
    locale,
    property_slug: propertySlug,
    ai_mode: aiMode,
    surface: "ai",
  });
}

export function trackAiRecommendClick(
  locale: string,
  propertySlug: string,
): void {
  phase2Track("ai_recommend_click", {
    locale,
    property_slug: propertySlug,
    surface: "ai",
  });
}

export function trackAiInvestDisclaimerAck(locale: string): void {
  phase2Track("ai_invest_disclaimer_ack", {
    locale,
    tool: "investment_assist",
    surface: "ai",
  });
}

export function trackAiInvestSessionStart(locale: string): void {
  phase2Track("ai_invest_session_start", {
    locale,
    tool: "investment_assist",
    surface: "ai",
  });
}

export function trackPartnerPortalView(locale: string, path: string): void {
  phase2Track("partner_portal_view", { locale, path, surface: "partners" });
}

export function trackAcquisitionCaseSubmit(locale: string): void {
  phase2Track("acquisition_case_submit", {
    locale,
    surface: "acquisition",
  });
}
