import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { siteConfig } from "@/config/site";
import { listBlogPosts, listKnowledgeArticles } from "@/lib/content";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { listCities, listDistricts } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedPropertySlugsForSitemap } from "@/lib/data/properties";
import {
  isPhase2MapEnabled,
  isPhase2ToolsEnabled,
} from "@/lib/feature-flags";
import { buildLocalizedPropertySitemapEntries } from "@/lib/seo/sitemap-inventory";

/** Indexable static public routes — excludes drafts, leads, search, admin, compare (device-state). Favorites remains a public feature landing. */
const staticPaths = [
  "",
  "/buy",
  "/rent",
  "/properties",
  "/favorites",
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
  "/blog",
  "/knowledge/articles",
  "/knowledge/investment",
  "/knowledge/legal",
  "/faq",
  "/knowledge/glossary",
  "/knowledge/bangkok-districts",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [
    propertySlugs,
    projects,
    cities,
    districts,
    developers,
    knowledgeArticles,
    blogPosts,
  ] = await Promise.all([
    listPublishedPropertySlugsForSitemap(),
    listPublishedProjects(),
    listCities(),
    listDistricts(),
    listPublishedDevelopers(),
    Promise.resolve(listKnowledgeArticles()),
    Promise.resolve(listBlogPosts()),
  ]);

  const phase2Static: string[] = [];
  if (isPhase2MapEnabled()) {
    phase2Static.push("/map");
  }
  if (isPhase2ToolsEnabled()) {
    phase2Static.push(
      "/tools",
      "/tools/mortgage",
      "/tools/legal",
      "/tools/investment-assist",
    );
  }
  const allStatic = [...staticPaths, ...phase2Static];

  const pages = locales.flatMap((locale) =>
    allStatic.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );

  const knowledgeArticlePages = locales.flatMap((locale) =>
    knowledgeArticles.map((article) => ({
      url: `${siteConfig.url}/${locale}/knowledge/articles/${article.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  );

  const blogPostPages = locales.flatMap((locale) =>
    blogPosts.map((post) => ({
      url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.65,
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

  const mapDistrictPages = isPhase2MapEnabled()
    ? locales.flatMap((locale) =>
        districts.map((district) => ({
          url: `${siteConfig.url}/${locale}/map/districts/${district.slug}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.55,
        })),
      )
    : [];

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

  const propertyPages = buildLocalizedPropertySitemapEntries({
    siteUrl: siteConfig.url,
    locales,
    slugs: propertySlugs,
    lastModified,
  });

  return [
    ...pages,
    ...knowledgeArticlePages,
    ...blogPostPages,
    ...cityPages,
    ...districtPages,
    ...mapDistrictPages,
    ...developerPages,
    ...projectPages,
    ...propertyPages,
  ];
}
