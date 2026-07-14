import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { siteConfig } from "@/config/site";
import { listPublishedProperties } from "@/lib/data/properties";
import { listPublishedProjects } from "@/lib/data/projects";

const staticPaths = [
  "",
  "/properties",
  "/projects",
  "/search",
  "/about",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [properties, projects] = await Promise.all([
    listPublishedProperties(),
    listPublishedProjects(),
  ]);

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
      url: `${siteConfig.url}/${locale}/properties/${property.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  const projectPages = locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${siteConfig.url}/${locale}/projects/${project.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  return [...pages, ...projectPages, ...propertyPages];
}
