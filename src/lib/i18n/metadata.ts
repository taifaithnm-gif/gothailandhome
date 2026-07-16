import type { Metadata } from "next";

import { localeOpenGraph, type Locale } from "@/config/locales";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BuildMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  /** Absolute URL or site-relative path. Defaults to branded OG card. */
  image?: string | null;
  robots?: Metadata["robots"];
};

const DEFAULT_OG_IMAGE = "/og/default.svg";

export function localePath(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: Locale, path = ""): string {
  return `${siteConfig.url}${localePath(locale, path)}`;
}

function resolveOgImage(image?: string | null) {
  const path = image?.trim() || DEFAULT_OG_IMAGE;
  return {
    url: path,
    width: 1200,
    height: 630,
    alt: siteConfig.name,
  };
}

export function buildPageMetadata({
  locale,
  title,
  description,
  path = "",
  image,
  robots,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(locale, path);
  const ogImage = resolveOgImage(image);

  return {
    title: {
      absolute: title,
    },
    description,
    ...(robots ? { robots } : {}),
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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
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
