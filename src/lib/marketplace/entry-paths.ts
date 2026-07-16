import type { Dictionary } from "@/lib/i18n/get-dictionary";

export type MarketplaceEntryId =
  | "find_my_home"
  | "list_your_property"
  | "developer_partnership"
  | "agency_partnership"
  | "viewing_request";

export type MarketplaceEntry = {
  id: MarketplaceEntryId;
  href: string;
  title: string;
  body: string;
  role: string;
  cta: string;
};

/** Five Phase 9 entry points — viewing lives on property detail pages. */
export function getMarketplaceEntries(
  dict: Dictionary,
): MarketplaceEntry[] {
  const m = dict.marketplace;
  return [
    {
      id: "find_my_home",
      href: "/find-my-home",
      title: m.findTitle,
      body: m.findSubtitle,
      role: m.roleBuyer,
      cta: m.hubOpen,
    },
    {
      id: "list_your_property",
      href: "/list-your-property",
      title: m.listTitle,
      body: m.listSubtitle,
      role: m.roleOwner,
      cta: m.hubOpen,
    },
    {
      id: "developer_partnership",
      href: "/partners/developers",
      title: m.developerPartnerTitle,
      body: m.developerPartnerSubtitle,
      role: m.roleDeveloper,
      cta: m.hubOpen,
    },
    {
      id: "agency_partnership",
      href: "/partners/agencies",
      title: m.agencyPartnerTitle,
      body: m.agencyPartnerSubtitle,
      role: m.roleAgency,
      cta: m.hubOpen,
    },
    {
      id: "viewing_request",
      href: "/properties",
      title: m.viewingEntryTitle,
      body: m.viewingEntrySubtitle,
      role: m.roleViewing,
      cta: m.viewingEntryCta,
    },
  ];
}
