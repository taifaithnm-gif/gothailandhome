export const locales = ["en", "zh", "th"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  th: "ไทย",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  zh: "zh-CN",
  th: "th",
};

export const localeOpenGraph: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  th: "th_TH",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
