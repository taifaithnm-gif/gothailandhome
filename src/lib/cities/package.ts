import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";
import type {
  DistrictAmenity,
  DistrictSource,
} from "@/lib/districts/package";
import {
  normalizeAmenities,
  normalizeSources,
} from "@/lib/districts/package";
import {
  coerceLocalizedText,
  type LocalizedText,
} from "@/lib/projects/normalize-project-content";

export type CityFaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type CityRelatedLink = {
  path: string;
  label: LocalizedText;
};

export type CityImageSlot = {
  id: string;
  alt: LocalizedText;
  /** Reserved local path for a future image asset. Never rendered until the file exists. */
  src: string | null;
};

export type CityParagraphs = Record<Locale, string[]>;

export type CityPackage = {
  slug: string;
  summary: LocalizedText | null;
  overview: CityParagraphs | null;
  lifestyle: CityParagraphs | null;
  transportation: DistrictAmenity[];
  schools: DistrictAmenity[];
  hospitals: DistrictAmenity[];
  shopping: DistrictAmenity[];
  investmentSummary: LocalizedText | null;
  rentalSummary: LocalizedText | null;
  faq: CityFaqItem[];
  knowledgeLinks: CityRelatedLink[];
  imageSlots: CityImageSlot[];
  sources: DistrictSource[];
};

const empty: CityPackage = {
  slug: "",
  summary: null,
  overview: null,
  lifestyle: null,
  transportation: [],
  schools: [],
  hospitals: [],
  shopping: [],
  investmentSummary: null,
  rentalSummary: null,
  faq: [],
  knowledgeLinks: [],
  imageSlots: [],
  sources: [],
};

function asString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function coerceParagraphs(raw: unknown): CityParagraphs | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const out: Partial<CityParagraphs> = {};
  let hasAny = false;
  for (const locale of ["en", "zh", "th"] as const) {
    const rows = Array.isArray(obj[locale])
      ? (obj[locale] as unknown[])
          .map((item) => asString(item))
          .filter((item): item is string => Boolean(item))
      : [];
    out[locale] = rows;
    if (rows.length) hasAny = true;
  }
  return hasAny ? (out as CityParagraphs) : null;
}

function coerceFaq(raw: unknown): CityFaqItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CityFaqItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const question = coerceLocalizedText(obj.question);
    const answer = coerceLocalizedText(obj.answer);
    if (!question || !answer) continue;
    out.push({ question, answer });
  }
  return out;
}

function coerceLinks(raw: unknown): CityRelatedLink[] {
  if (!Array.isArray(raw)) return [];
  const out: CityRelatedLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const path = asString(obj.path);
    const label = coerceLocalizedText(obj.label);
    if (!path || !label) continue;
    if (!path.startsWith("/") || path.startsWith("//")) continue;
    out.push({ path, label });
  }
  return out;
}

function coerceImageSlots(raw: unknown): CityImageSlot[] {
  if (!Array.isArray(raw)) return [];
  const out: CityImageSlot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const id = asString(obj.id);
    const alt = coerceLocalizedText(obj.alt);
    if (!id || !alt) continue;
    out.push({ id, alt, src: asString(obj.src) });
  }
  return out;
}

/**
 * Read-only city SEO/content package. Empty fields stay empty — never invent
 * amenities, statistics, or market figures.
 */
export function getCityPackage(citySlug: string): CityPackage {
  const path = join(process.cwd(), "content", "cities", `${citySlug}.json`);
  if (!existsSync(path)) return { ...empty, slug: citySlug };

  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<
      string,
      unknown
    >;
    return {
      slug: asString(raw.slug) ?? citySlug,
      summary: coerceLocalizedText(raw.summary),
      overview: coerceParagraphs(raw.overview),
      lifestyle: coerceParagraphs(raw.lifestyle),
      transportation: normalizeAmenities(raw.transportation),
      schools: normalizeAmenities(raw.schools),
      hospitals: normalizeAmenities(raw.hospitals),
      shopping: normalizeAmenities(raw.shopping),
      investmentSummary: coerceLocalizedText(raw.investment_summary),
      rentalSummary: coerceLocalizedText(raw.rental_summary),
      faq: coerceFaq(raw.faq),
      knowledgeLinks: coerceLinks(raw.knowledge_links),
      imageSlots: coerceImageSlots(raw.image_slots),
      sources: normalizeSources(raw.sources),
    };
  } catch {
    return { ...empty, slug: citySlug };
  }
}

export function cityParagraphs(
  blocks: CityParagraphs | null,
  locale: Locale,
): string[] {
  if (!blocks) return [];
  if (blocks[locale]?.length) return blocks[locale];
  return blocks.en?.length ? blocks.en : [];
}

export function localizedCityFaq(
  faq: CityFaqItem[],
  locale: Locale,
): { question: string; answer: string }[] {
  return faq.map((item) => ({
    question: item.question[locale] || item.question.en,
    answer: item.answer[locale] || item.answer.en,
  }));
}
