/**
 * Unified frontend Lead Foundation — no CRM automation.
 * Channels connected to marketplace entry forms.
 */

export const LEAD_CHANNELS = [
  "find_my_home",
  "list_your_property",
  "viewing_request",
  "developer_partnership",
  "agency_partnership",
] as const;

export type LeadChannel = (typeof LEAD_CHANNELS)[number];

export type LeadSubmitMode = "stored" | "placeholder";

export const LEAD_CHANNEL_PREFIX: Record<LeadChannel, string> = {
  find_my_home: "FMH",
  list_your_property: "LYP",
  viewing_request: "VIEW",
  developer_partnership: "DEV",
  agency_partnership: "AGY",
};

/** Map DB / storage lead_type → frontend channel. */
export const LEAD_TYPE_TO_CHANNEL: Record<string, LeadChannel> = {
  find_home: "find_my_home",
  list_property: "list_your_property",
  viewing_request: "viewing_request",
  developer_partnership: "developer_partnership",
  agency_partnership: "agency_partnership",
};

export function isLeadChannel(value: string | null | undefined): value is LeadChannel {
  return Boolean(value && (LEAD_CHANNELS as readonly string[]).includes(value));
}

export function leadReturnPath(channel: LeadChannel): string {
  switch (channel) {
    case "find_my_home":
      return "/find-my-home";
    case "list_your_property":
      return "/list-your-property";
    case "developer_partnership":
      return "/partners/developers";
    case "agency_partnership":
      return "/partners/agencies";
    case "viewing_request":
      return "/properties";
  }
}
