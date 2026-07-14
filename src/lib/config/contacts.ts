import contactsConfig from "../../../config/contacts.json";
import type { Locale } from "@/config/locales";
import { localeLabels } from "@/config/locales";

export type I18nText = {
  en: string;
  zh: string;
  th: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  role: I18nText;
  languages: string[];
  phone: string | null;
  whatsapp: string | null;
  line: string | null;
  wechat: string | null;
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

/** Primary email/phone helpers for simple surfaces (first active contact). */
export function getPrimaryContact(): ContactRecord | null {
  return getActiveContacts()[0] ?? null;
}
