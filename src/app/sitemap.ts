import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { siteConfig } from "@/config/site";
import { properties } from "@/lib/properties";

const staticPaths = ["", "/properties", "/search", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );

  const propertyPages = locales.flatMap((locale) =>
    properties.map((property) => ({
      url: `${siteConfig.url}/${locale}/properties/${property.id}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [...pages, ...propertyPages];
}
