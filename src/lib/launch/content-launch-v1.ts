import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";

import areaContent from "../../../CONTENT_LAUNCH_V1/area_content.json";
import ctaContent from "../../../CONTENT_LAUNCH_V1/cta_content.json";
import developerContent from "../../../CONTENT_LAUNCH_V1/developer_content.json";
import featuredProjects from "../../../CONTENT_LAUNCH_V1/featured_projects.json";
import homepageContent from "../../../CONTENT_LAUNCH_V1/homepage_content.json";
import imageManifest from "../../../CONTENT_LAUNCH_V1/image_manifest.json";
import knowledgeCards from "../../../CONTENT_LAUNCH_V1/knowledge_cards.json";

export type LocalizedString = Record<Locale, string>;

export type LaunchFeaturedProject = {
  project_id: string;
  project_name: LocalizedString;
  developer_name: LocalizedString;
  developer_id: string;
  area_name: LocalizedString;
  area_id: string;
  city: LocalizedString;
  property_type: string;
  price_display: LocalizedString;
  short_summary_en: string;
  short_summary_zh: string;
  short_summary_th: string;
  image_requirement: string;
  image_alt_en: string;
  image_alt_zh: string;
  image_alt_th: string;
};

export type LaunchDeveloper = {
  developer_id: string;
  developer_name: LocalizedString;
  short_profile_en: string;
  short_profile_zh: string;
  short_profile_th: string;
  project_count: number;
  featured_projects: string[];
  logo_status: string;
  logo_path: string | null;
};

export type LaunchKnowledgeCard = {
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  publish_ready: boolean;
};

export type LaunchArea = {
  area_id: string;
  area_name: LocalizedString;
  status: "PRODUCTION_READY" | "NOT_PRODUCTION_READY" | string;
  status_note?: LocalizedString;
  overview: LocalizedString;
  suitable_buyer_profile?: LocalizedString;
  main_property_types?: LocalizedString;
  lifestyle_characteristics?: LocalizedString;
  transport_summary?: LocalizedString;
  investment_considerations?: LocalizedString;
  featured_projects: string[];
  consultation_cta?: LocalizedString;
};

export type LaunchImageEntry = {
  page: string;
  section: string;
  entity_id: string;
  required_image_type: string;
  approved_local_asset: string | null;
  placeholder_allowed: string;
  alt_text_en: string;
  alt_text_zh: string;
  alt_text_th: string;
};

type HomepageContent = typeof homepageContent;

type CtaContent = typeof ctaContent;

const packageData = {
  homepage: homepageContent as HomepageContent,
  projects: featuredProjects.projects as LaunchFeaturedProject[],
  developers: developerContent.developers as LaunchDeveloper[],
  knowledge: (knowledgeCards.cards as LaunchKnowledgeCard[]).filter(
    (c) => c.publish_ready,
  ),
  areas: areaContent.areas as LaunchArea[],
  cta: ctaContent as CtaContent,
  images: imageManifest.entries as LaunchImageEntry[],
};

export function getHomepageLaunch() {
  return packageData.homepage;
}

export function getFeaturedLaunchProjects(): LaunchFeaturedProject[] {
  return packageData.projects;
}

export function getLaunchDevelopers(): LaunchDeveloper[] {
  return packageData.developers;
}

export function getLaunchKnowledgeCards(): LaunchKnowledgeCard[] {
  return packageData.knowledge;
}

export function getLaunchAreas(): LaunchArea[] {
  return packageData.areas;
}

export function getLaunchAreaById(areaId: string): LaunchArea | null {
  return getLaunchAreas().find((a) => a.area_id === areaId) ?? null;
}

export function getLaunchCta(key: string, locale: Locale): string {
  const blocks = packageData.cta.cta_blocks as Record<string, LocalizedString>;
  const block = blocks[key];
  return block?.[locale] ?? block?.en ?? "";
}

/** Convert `public/...` manifest path to a site-relative URL when the file exists. */
export function publicAssetUrl(approvedLocalAsset: string | null): string | null {
  if (!approvedLocalAsset) return null;
  const rel = approvedLocalAsset.replace(/^public\//, "");
  const abs = join(process.cwd(), "public", rel);
  if (!existsSync(abs)) return null;
  return `/${rel}`;
}

export function getProjectHeroImage(projectId: string): {
  src: string | null;
  alt: LocalizedString;
  usesPlaceholder: boolean;
} {
  const entry = packageData.images.find(
    (e) =>
      e.entity_id === projectId && e.required_image_type === "project_hero",
  );
  const project = getFeaturedLaunchProjects().find(
    (p) => p.project_id === projectId,
  );
  const alt: LocalizedString = {
    en: entry?.alt_text_en ?? project?.image_alt_en ?? projectId,
    zh: entry?.alt_text_zh ?? project?.image_alt_zh ?? projectId,
    th: entry?.alt_text_th ?? project?.image_alt_th ?? projectId,
  };
  const src = publicAssetUrl(entry?.approved_local_asset ?? null);
  return { src, alt, usesPlaceholder: !src };
}

export function getDeveloperLogoSrc(developer: LaunchDeveloper): string | null {
  if (!developer.logo_path) return null;
  const abs = join(
    process.cwd(),
    "public",
    developer.logo_path.replace(/^\//, ""),
  );
  const official = join(
    process.cwd(),
    "public",
    "developers",
    developer.developer_id,
    "official-logo.jpg",
  );
  if (existsSync(official)) {
    return `/developers/${developer.developer_id}/official-logo.jpg`;
  }
  if (existsSync(abs)) return developer.logo_path;
  return null;
}

export function projectSummary(
  project: LaunchFeaturedProject,
  locale: Locale,
): string {
  if (locale === "zh") return project.short_summary_zh;
  if (locale === "th") return project.short_summary_th;
  return project.short_summary_en;
}

export function developerProfile(
  developer: LaunchDeveloper,
  locale: Locale,
): string {
  if (locale === "zh") return developer.short_profile_zh;
  if (locale === "th") return developer.short_profile_th;
  return developer.short_profile_en;
}

/**
 * Sale-price display. Low/missing confidence → contact CTA (never rental).
 */
export function projectPriceDisplay(
  project: LaunchFeaturedProject,
  locale: Locale,
): { text: string; isFallback: boolean } {
  const raw = project.price_display?.[locale] || project.price_display?.en || "";
  const trimmed = raw.trim();
  const lowConfidence =
    !trimmed ||
    /contact for|请联系|ติดต่อสอบถาม/i.test(trimmed) ||
    /n\/a|unavailable|tba|tbd/i.test(trimmed);
  if (lowConfidence) {
    return {
      text: getLaunchCta("price_unavailable_fallback", locale),
      isFallback: true,
    };
  }
  return { text: trimmed, isFallback: false };
}

export function categoryNote(
  category: HomepageContent["sections"]["property_categories"]["categories"][number],
  locale: Locale,
): string {
  if (locale === "zh") return category.note_zh;
  if (locale === "th") return category.note_th;
  return category.note_en;
}

export function categoryLabel(
  category: HomepageContent["sections"]["property_categories"]["categories"][number],
  locale: Locale,
): string {
  return category[locale] || category.en;
}
