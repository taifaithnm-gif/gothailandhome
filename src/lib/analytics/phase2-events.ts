/**
 * P2-080 — Expanded analytics event names (consent-gated at adapter).
 */

export const PHASE2_ANALYTICS_EVENTS = [
  "map_view",
  "map_pin_select",
  "tool_mortgage_calculate",
  "tool_legal_checklist_toggle",
  "ai_recommend_impression",
  "ai_recommend_click",
  "ai_invest_disclaimer_ack",
  "ai_invest_session_start",
  "partner_portal_view",
  "acquisition_case_submit",
] as const;

export type Phase2AnalyticsEventName =
  (typeof PHASE2_ANALYTICS_EVENTS)[number];

export function isPhase2AnalyticsEvent(
  name: string,
): name is Phase2AnalyticsEventName {
  return (PHASE2_ANALYTICS_EVENTS as readonly string[]).includes(name);
}
