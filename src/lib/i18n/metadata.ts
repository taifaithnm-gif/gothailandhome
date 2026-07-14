import type { Metadata } from "next";

import { localeOpenGraph, type Locale } from "@/config/locales";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BuildMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
};

export function localePath(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: Locale, path = ""): string {
  return `${siteConfig.url}${localePath(locale, path)}`;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  path = "",
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(locale, path);

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: absoluteUrl("en", path),
        "zh-CN": absoluteUrl("zh", path),
        th: absoluteUrl("th", path),
        "x-default": absoluteUrl("en", path),
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      locale: localeOpenGraph[locale],
      alternateLocale: Object.values(localeOpenGraph).filter(
        (value) => value !== localeOpenGraph[locale],
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}

export function propertyTypeLabel(dict: Dictionary, type: string): string {
  switch (type) {
    case "condo":
      return dict.common.condo;
    case "house":
      return dict.common.house;
    case "villa":
      return dict.common.villa;
    case "land":
      return dict.common.land;
    case "commercial":
      return dict.common.commercial;
    default:
      return type;
  }
}
