import { trackEvent } from "@/lib/analytics/adapter";
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
