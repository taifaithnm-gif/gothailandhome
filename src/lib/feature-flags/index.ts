/**
 * Phase 2 feature flags — defaults OFF to preserve Phase 1 production behavior.
 */

function envFlag(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export type Phase2FeatureFlags = {
  account: boolean;
  opsLeads: boolean;
  notifications: boolean;
  crmSync: boolean;
  acquisition: boolean;
  partnerPortal: boolean;
  map: boolean;
  tools: boolean;
  ai: boolean;
  analyticsExpansion: boolean;
};

export function getPhase2FeatureFlags(): Phase2FeatureFlags {
  return {
    account: envFlag("FEATURE_P2_ACCOUNT") || envFlag("NEXT_PUBLIC_FEATURE_P2_ACCOUNT"),
    opsLeads: envFlag("FEATURE_P2_OPS_LEADS"),
    notifications: envFlag("FEATURE_P2_NOTIFICATIONS"),
    crmSync: envFlag("FEATURE_P2_CRM_SYNC"),
    acquisition:
      envFlag("FEATURE_P2_ACQUISITION") ||
      envFlag("NEXT_PUBLIC_FEATURE_P2_ACQUISITION"),
    partnerPortal:
      envFlag("FEATURE_P2_PARTNER_PORTAL") ||
      envFlag("NEXT_PUBLIC_FEATURE_P2_PARTNER_PORTAL"),
    map: envFlag("FEATURE_P2_MAP") || envFlag("NEXT_PUBLIC_FEATURE_P2_MAP"),
    tools: envFlag("FEATURE_P2_TOOLS") || envFlag("NEXT_PUBLIC_FEATURE_P2_TOOLS"),
    ai: envFlag("FEATURE_P2_AI") || envFlag("NEXT_PUBLIC_FEATURE_P2_AI"),
    analyticsExpansion: envFlag("FEATURE_P2_ANALYTICS_EXPANSION"),
  };
}

export function isPhase2AccountEnabled(): boolean {
  return getPhase2FeatureFlags().account;
}
export function isPhase2OpsLeadsEnabled(): boolean {
  return getPhase2FeatureFlags().opsLeads;
}
export function isPhase2NotificationsEnabled(): boolean {
  return getPhase2FeatureFlags().notifications;
}
export function isPhase2CrmSyncEnabled(): boolean {
  return getPhase2FeatureFlags().crmSync;
}
export function isPhase2AcquisitionEnabled(): boolean {
  return getPhase2FeatureFlags().acquisition;
}
export function isPhase2PartnerPortalEnabled(): boolean {
  return getPhase2FeatureFlags().partnerPortal;
}
export function isPhase2MapEnabled(): boolean {
  return getPhase2FeatureFlags().map;
}
export function isPhase2ToolsEnabled(): boolean {
  return getPhase2FeatureFlags().tools;
}
export function isPhase2AiEnabled(): boolean {
  return getPhase2FeatureFlags().ai;
}
export function isPhase2AnalyticsExpansionEnabled(): boolean {
  return getPhase2FeatureFlags().analyticsExpansion;
}
