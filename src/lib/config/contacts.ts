import contactsConfig from "../../../config/contacts.json";
import type { Locale } from "@/config/locales";
import { localeLabels } from "@/config/locales";

export type I18nText = {
  en: string;
  zh: string;
  th: string;
};

/** Canonical contact-role taxonomy for Phase 8 Marketplace Foundation. */
export const CONTACT_ROLES = [
  "listing_contact",
  "project_contact",
  "developer_contact",
  "agency_contact",
  "platform_customer_success",
] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export type ContactRecord = {
  id: string;
  name: string;
  /** Strict role — Apple must be platform_customer_success only. */
  contact_role: ContactRole;
  role: I18nText;
  languages: string[];
  phone: string | null;
  whatsapp: string | null;
  line: string | null;
  /** Public path under `/public`, e.g. `/contact/apple-line.png`. Null = do not render. */
  line_qr: string | null;
  wechat: string | null;
  /** Public path under `/public`, e.g. `/contact/apple-wechat.png`. Null = do not render. */
  wechat_qr: string | null;
  email: string | null;
  availability: I18nText;
  active: boolean;
  sort_order: number;
};

export type ContactsConfiguration = {
  version: number;
  updated_at: string;
  office: {
    title: I18nText;
    body: I18nText;
  };
  contacts: ContactRecord[];
};

const LISTING_OWNER_ROLES: ContactRole[] = [
  "listing_contact",
  "project_contact",
  "developer_contact",
  "agency_contact",
];

/** Single configuration source for platform contacts (admin-editable JSON). */
export function getContactsConfiguration(): ContactsConfiguration {
  return contactsConfig as ContactsConfiguration;
}

export function getActiveContacts(): ContactRecord[] {
  return getContactsConfiguration()
    .contacts.filter((contact) => contact.active !== false)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getContactsByRole(role: ContactRole): ContactRecord[] {
  return getActiveContacts().filter((contact) => contact.contact_role === role);
}

/** Platform help / escalation only — never listing ownership. */
export function getPlatformCustomerSuccessContacts(): ContactRecord[] {
  return getContactsByRole("platform_customer_success");
}

/**
 * Primary platform customer-success contact.
 * Must NEVER be used as a silent listing-owner fallback.
 */
export function getPrimaryPlatformSupportContact(): ContactRecord | null {
  return getPlatformCustomerSuccessContacts()[0] ?? null;
}

/**
 * @deprecated Use getPrimaryPlatformSupportContact().
 * Kept only for transitional call sites — returns platform CS, never listing owner.
 */
export function getPrimaryContact(): ContactRecord | null {
  return getPrimaryPlatformSupportContact();
}

/** Contacts that may represent a listing/project/developer/agency (not Apple/platform CS). */
export function getListingOwnerRoleContacts(): ContactRecord[] {
  return getActiveContacts().filter((contact) =>
    LISTING_OWNER_ROLES.includes(contact.contact_role),
  );
}

export function isPlatformCustomerSuccess(contact: ContactRecord): boolean {
  return contact.contact_role === "platform_customer_success";
}

/** Invariant: Apple may only be platform_customer_success. */
export function assertApplePlatformCustomerSuccessOnly(
  contacts: ContactRecord[] = getContactsConfiguration().contacts,
): void {
  const apple = contacts.find((contact) => contact.id === "apple");
  if (!apple) return;
  if (apple.contact_role !== "platform_customer_success") {
    throw new Error(
      `Invariant failed: contact "apple" must be platform_customer_success (got ${apple.contact_role})`,
    );
  }
  if (LISTING_OWNER_ROLES.includes(apple.contact_role)) {
    throw new Error(
      'Invariant failed: contact "apple" must not be a listing/project/developer/agency contact',
    );
  }
}

export function pickI18n(text: I18nText, locale: Locale): string {
  return text[locale] || text.en;
}

export function formatLanguages(codes: string[], locale: Locale): string {
  return codes
    .map((code) => {
      if (code === "en" || code === "zh" || code === "th") {
        return localeLabels[code];
      }
      return code;
    })
    .join(locale === "zh" ? "、" : ", ");
}
