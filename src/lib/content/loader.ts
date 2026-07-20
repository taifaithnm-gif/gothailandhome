import "server-only";

import { readFileSync } from "node:fs";
import { join, normalize, sep } from "node:path";

import type { Locale } from "@/config/locales";
import type { BlogPost, FaqEntry, InvestmentGuide, LegalGuide } from "@/lib/content/types";
import {
  normalizeBlogPost,
  normalizeFaqEntry,
  normalizeInvestmentGuide,
  normalizeKnowledgeArticle,
  normalizeLegalGuide,
  pickLocalizedText,
} from "@/lib/content/validate";

const CONTENT_ROOT = join(process.cwd(), "content");
const KNOWLEDGE_ROOT = join(CONTENT_ROOT, "knowledge", "articles");
const KNOWLEDGE_INDEX_PATH = join(KNOWLEDGE_ROOT, "INDEX.json");
const BLOG_ROOT = join(CONTENT_ROOT, "blog", "posts");
const BLOG_INDEX_PATH = join(BLOG_ROOT, "INDEX.json");
const INVESTMENT_ROOT = join(CONTENT_ROOT, "guides", "investment");
const INVESTMENT_INDEX_PATH = join(INVESTMENT_ROOT, "INDEX.json");
const LEGAL_ROOT = join(CONTENT_ROOT, "guides", "legal");
const LEGAL_INDEX_PATH = join(LEGAL_ROOT, "INDEX.json");
const FAQ_ROOT = join(CONTENT_ROOT, "faq");
const FAQ_INDEX_PATH = join(FAQ_ROOT, "INDEX.json");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolveScopedPath(root: string, relPath: string): string | null {
  const abs = normalize(join(process.cwd(), relPath));
  const scopedRoot = `${normalize(root)}${sep}`;
  return abs.startsWith(scopedRoot) ? abs : null;
}

type IndexRow = {
  slug: string;
  path: string;
};

type FaqIndexRow = {
  id: string;
  path: string;
};

function parseIndexRows(input: unknown): IndexRow[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) return [];
  const record = input as {
    articles?: unknown;
    posts?: unknown;
    guides?: unknown;
  };
  const rowsRaw = record.articles ?? record.posts ?? record.guides;
  if (!Array.isArray(rowsRaw)) return [];
  const rows: IndexRow[] = [];
  for (const item of rowsRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const slug = typeof row.slug === "string" ? row.slug.trim() : "";
    const path = typeof row.path === "string" ? row.path.trim() : "";
    if (!slug || !path) continue;
    rows.push({ slug, path });
  }
  return rows;
}

function parseFaqIndexRows(input: unknown): FaqIndexRow[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) return [];
  const rowsRaw = (input as { entries?: unknown }).entries;
  if (!Array.isArray(rowsRaw)) return [];
  const rows: FaqIndexRow[] = [];
  for (const item of rowsRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const path = typeof row.path === "string" ? row.path.trim() : "";
    if (!id || !path) continue;
    rows.push({ id, path });
  }
  return rows;
}

export function listKnowledgeArticles() {
  const indexRows = parseIndexRows(readJson(KNOWLEDGE_INDEX_PATH));
  const approved = [];
  for (const row of indexRows) {
    const scoped = resolveScopedPath(KNOWLEDGE_ROOT, row.path);
    if (!scoped) continue;
    const normalized = normalizeKnowledgeArticle(readJson(scoped));
    if (!normalized || normalized.slug !== row.slug) continue;
    if (normalized.status !== "approved") continue;
    approved.push(normalized);
  }
  return approved.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getKnowledgeArticle(slug: string) {
  return listKnowledgeArticles().find((item) => item.slug === slug) ?? null;
}

export function listBlogPosts(): BlogPost[] {
  const indexRows = parseIndexRows(readJson(BLOG_INDEX_PATH));
  const approved: BlogPost[] = [];
  for (const row of indexRows) {
    const scoped = resolveScopedPath(BLOG_ROOT, row.path);
    if (!scoped) continue;
    const normalized = normalizeBlogPost(readJson(scoped));
    if (!normalized || normalized.slug !== row.slug) continue;
    if (normalized.status !== "approved") continue;
    approved.push(normalized);
  }
  return approved.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export function getBlogPost(slug: string): BlogPost | null {
  return listBlogPosts().find((item) => item.slug === slug) ?? null;
}

function listApprovedGuides(
  indexPath: string,
  root: string,
  normalize: (raw: unknown) => InvestmentGuide | LegalGuide | null,
): (InvestmentGuide | LegalGuide)[] {
  const indexRows = parseIndexRows(readJson(indexPath));
  const approved: (InvestmentGuide | LegalGuide)[] = [];
  for (const row of indexRows) {
    const scoped = resolveScopedPath(root, row.path);
    if (!scoped) continue;
    const normalized = normalize(readJson(scoped));
    if (!normalized || normalized.slug !== row.slug) continue;
    if (normalized.status !== "approved") continue;
    approved.push(normalized);
  }
  return approved.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getInvestmentGuide(): InvestmentGuide | null {
  const guides = listApprovedGuides(
    INVESTMENT_INDEX_PATH,
    INVESTMENT_ROOT,
    normalizeInvestmentGuide,
  );
  return (guides[0] as InvestmentGuide | undefined) ?? null;
}

export function getLegalGuide(): LegalGuide | null {
  const guides = listApprovedGuides(
    LEGAL_INDEX_PATH,
    LEGAL_ROOT,
    normalizeLegalGuide,
  );
  return (guides[0] as LegalGuide | undefined) ?? null;
}

export function listFaqEntries(): FaqEntry[] {
  const indexRows = parseFaqIndexRows(readJson(FAQ_INDEX_PATH));
  const approved: FaqEntry[] = [];
  for (const row of indexRows) {
    const scoped = resolveScopedPath(FAQ_ROOT, row.path);
    if (!scoped) continue;
    const normalized = normalizeFaqEntry(readJson(scoped));
    if (!normalized || normalized.id !== row.id) continue;
    if (normalized.status !== "approved") continue;
    approved.push(normalized);
  }
  return approved.sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
}

export function renderKnowledgeArticleLocale(
  slug: string,
  locale: Locale,
): {
  slug: string;
  title: { value: string; fallbackFrom: Locale | null };
  summary: { value: string; fallbackFrom: Locale | null };
  body: { value: string[]; fallbackFrom: Locale | null };
  reviewedAt: string;
  sources: { type: string; name: string; url: string; verified_at: string; note?: string }[];
} | null {
  const article = getKnowledgeArticle(slug);
  if (!article) return null;
  const title = pickLocalizedText(article.title, locale);
  const summary = pickLocalizedText(article.summary, locale);
  const bodyDirect = article.body[locale];
  const bodyLocale = bodyDirect?.length
    ? locale
    : article.body.en?.length
      ? "en"
      : article.body.zh?.length
        ? "zh"
        : article.body.th?.length
          ? "th"
          : locale;
  const body = article.body[bodyLocale] ?? [];
  const fallbackFrom = bodyLocale === locale ? null : locale;
  return {
    slug: article.slug,
    title: { value: title.value, fallbackFrom: title.fallbackFrom },
    summary: { value: summary.value, fallbackFrom: summary.fallbackFrom },
    body: { value: body, fallbackFrom },
    reviewedAt: article.reviewed_at,
    sources: article.sources,
  };
}

export function renderBlogPostLocale(
  slug: string,
  locale: Locale,
): {
  slug: string;
  title: { value: string; fallbackFrom: Locale | null };
  summary: { value: string; fallbackFrom: Locale | null };
  body: { value: string[]; fallbackFrom: Locale | null };
  author: string;
  publishedAt: string;
  updatedAt: string;
  reviewedAt: string;
  sources: { type: string; name: string; url: string; verified_at: string; note?: string }[];
} | null {
  const post = getBlogPost(slug);
  if (!post) return null;
  const title = pickLocalizedText(post.title, locale);
  const summary = pickLocalizedText(post.summary, locale);
  const bodyDirect = post.body[locale];
  const bodyLocale = bodyDirect?.length ? locale : "en";
  const body = post.body[bodyLocale] ?? [];
  return {
    slug: post.slug,
    title: { value: title.value, fallbackFrom: title.fallbackFrom },
    summary: { value: summary.value, fallbackFrom: summary.fallbackFrom },
    body: {
      value: body,
      fallbackFrom: bodyLocale === locale ? null : locale,
    },
    author: post.author,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    reviewedAt: post.reviewed_at,
    sources: post.sources,
  };
}

export function renderInvestmentGuideLocale(locale: Locale) {
  const guide = getInvestmentGuide();
  if (!guide) return null;
  const title = pickLocalizedText(guide.title, locale);
  const summary = pickLocalizedText(guide.summary, locale);
  const disclaimer = pickLocalizedText(guide.disclaimer, locale);
  const forecastDisclaimer = pickLocalizedText(guide.forecast_disclaimer, locale);
  const bodyDirect = guide.body[locale];
  const bodyLocale = bodyDirect?.length ? locale : "en";
  const body = guide.body[bodyLocale] ?? [];
  return {
    slug: guide.slug,
    version: guide.version,
    owner: guide.owner,
    title: { value: title.value, fallbackFrom: title.fallbackFrom },
    summary: { value: summary.value, fallbackFrom: summary.fallbackFrom },
    disclaimer: { value: disclaimer.value, fallbackFrom: disclaimer.fallbackFrom },
    forecastDisclaimer: {
      value: forecastDisclaimer.value,
      fallbackFrom: forecastDisclaimer.fallbackFrom,
    },
    body: {
      value: body,
      fallbackFrom: bodyLocale === locale ? null : locale,
    },
    reviewedAt: guide.reviewed_at,
    sources: guide.sources,
  };
}

export function renderLegalGuideLocale(locale: Locale) {
  const guide = getLegalGuide();
  if (!guide) return null;
  const title = pickLocalizedText(guide.title, locale);
  const summary = pickLocalizedText(guide.summary, locale);
  const disclaimer = pickLocalizedText(guide.disclaimer, locale);
  const jurisdiction = pickLocalizedText(guide.jurisdiction, locale);
  const bodyDirect = guide.body[locale];
  const bodyLocale = bodyDirect?.length ? locale : "en";
  const body = guide.body[bodyLocale] ?? [];
  return {
    slug: guide.slug,
    version: guide.version,
    owner: guide.owner,
    jurisdiction: { value: jurisdiction.value, fallbackFrom: jurisdiction.fallbackFrom },
    title: { value: title.value, fallbackFrom: title.fallbackFrom },
    summary: { value: summary.value, fallbackFrom: summary.fallbackFrom },
    disclaimer: { value: disclaimer.value, fallbackFrom: disclaimer.fallbackFrom },
    body: {
      value: body,
      fallbackFrom: bodyLocale === locale ? null : locale,
    },
    reviewedAt: guide.reviewed_at,
    sources: guide.sources,
  };
}

export function renderFaqEntriesLocale(locale: Locale) {
  return listFaqEntries().map((entry) => {
    const question = pickLocalizedText(entry.question, locale);
    const answer = pickLocalizedText(entry.answer, locale);
    return {
      id: entry.id,
      category: entry.category,
      sortOrder: entry.sort_order,
      question: { value: question.value, fallbackFrom: question.fallbackFrom },
      answer: { value: answer.value, fallbackFrom: answer.fallbackFrom },
      reviewedAt: entry.reviewed_at,
    };
  });
}

export const contentLoaderPaths = {
  knowledgeRoot: KNOWLEDGE_ROOT,
  knowledgeIndexPath: KNOWLEDGE_INDEX_PATH,
  blogRoot: BLOG_ROOT,
  blogIndexPath: BLOG_INDEX_PATH,
  investmentRoot: INVESTMENT_ROOT,
  investmentIndexPath: INVESTMENT_INDEX_PATH,
  legalRoot: LEGAL_ROOT,
  legalIndexPath: LEGAL_INDEX_PATH,
  faqRoot: FAQ_ROOT,
  faqIndexPath: FAQ_INDEX_PATH,
} as const;
