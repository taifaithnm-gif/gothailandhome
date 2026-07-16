import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { siteConfig } from "@/config/site";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { listCities, listDistricts } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedProperties } from "@/lib/data/properties";

const staticPaths = [
  "",
  "/buy",
  "/rent",
  "/properties",
  "/projects",
  "/cities",
  "/developers",
  "/about",
  "/contact",
  "/marketplace",
  "/find-my-home",
  "/list-your-property",
  "/partners/developers",
  "/partners/agencies",
  "/knowledge",
  "/knowledge/glossary",
  "/knowledge/bangkok-districts",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [properties, projects, cities, districts, developers] =
    await Promise.all([
      listPublishedProperties({ verifiedOnly: true }),
      listPublishedProjects(),
      listCities(),
      listDistricts(),
      listPublishedDevelopers(),
    ]);

  const pages = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );

  const cityPages = locales.flatMap((locale) =>
    cities.map((city) => ({
      url: `${siteConfig.url}/${locale}/cities/${city.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );

  const districtPages = locales.flatMap((locale) =>
    districts.map((district) => ({
      url: `${siteConfig.url}/${locale}/districts/${district.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const developerPages = locales.flatMap((locale) =>
    developers.map((developer) => ({
      url: `${siteConfig.url}/${locale}/developers/${developer.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
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

  const propertyPages = locales.flatMap((locale) =>
    properties.map((property) => ({
      url: `${siteConfig.url}/${locale}/properties/${property.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [
    ...pages,
    ...cityPages,
    ...districtPages,
    ...developerPages,
    ...projectPages,
    ...propertyPages,
  ];
}
