import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { siteConfig } from "@/config/site";

const PRIVATE_BASES = [
  "/admin",
  "/admin/",
  "/leads",
  "/leads/",
  "/account",
  "/account/",
  "/auth",
  "/auth/",
  "/partners/app",
  "/partners/app/",
] as const;

export default function robots(): MetadataRoute.Robots {
  // Cover both bare paths and locale-prefixed variants (/en/admin, /zh/admin, ...).
  const disallow = PRIVATE_BASES.flatMap((base) => [
    base,
    ...locales.map((locale) => `/${locale}${base}`),
  ]);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallow,
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.domain,
  };
}
