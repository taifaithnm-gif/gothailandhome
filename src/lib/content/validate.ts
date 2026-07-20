import type { Locale } from "@/config/locales";
import type {
  BlogPost,
  ContentSource,
  ContentStatus,
  FaqCategory,
  FaqEntry,
  InvestmentGuide,
  LegalGuide,
  LocaleStatus,
  LocaleStatusMap,
  LocalizedParagraphs,
  LocalizedText,
} from "@/lib/content/types";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const STATUS_SET: ReadonlySet<ContentStatus> = new Set([
  "draft",
  "in_review",
  "approved",
  "archived",
  "rejected",
]);
const LOCALE_STATUS_SET: ReadonlySet<LocaleStatus> = new Set([
  "complete",
  "partial",
  "missing",
]);
const FAQ_CATEGORY_SET: ReadonlySet<FaqCategory> = new Set([
  "platform",
  "process",
  "listings",
  "contact",
  "guides",
]);
const SOURCE_TYPE_SET: ReadonlySet<string> = new Set([
  "official_operator",
  "government",
  "official_developer",
  "platform_process",
  "editorial",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

export function isContentSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

export function normalizeContentStatus(value: unknown): ContentStatus | null {
  const raw = asString(value);
  if (!raw) return null;
  return STATUS_SET.has(raw as ContentStatus) ? (raw as ContentStatus) : null;
}

export function resolveContentStatus(raw: Record<string, unknown>): ContentStatus {
  const explicit = normalizeContentStatus(raw.status);
  if (explicit) return explicit;
  if (raw.publish_ready === true) return "approved";
  return "draft";
}

function coerceLocalizedText(raw: unknown): LocalizedText | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const en = asString(obj.en);
  const zh = asString(obj.zh);
  const th = asString(obj.th);
  if (!en || !zh || !th) return null;
  return { en, zh, th };
}

function coerceLocalizedParagraphs(raw: unknown): LocalizedParagraphs | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const out: Partial<LocalizedParagraphs> = {};
  for (const locale of ["en", "zh", "th"] as const) {
    const value = obj[locale];
    if (!Array.isArray(value)) return null;
    const rows = value
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item));
    if (!rows.length) return null;
    out[locale] = rows;
  }
  return out as LocalizedParagraphs;
}

function inferLocaleStatus(text: LocalizedText, body: LocalizedParagraphs): LocaleStatusMap {
  const map: Partial<LocaleStatusMap> = {};
  for (const locale of ["en", "zh", "th"] as const) {
    map[locale] =
      text[locale].trim() && body[locale].length ? "complete" : "missing";
  }
  return map as LocaleStatusMap;
}

function coerceLocaleStatus(raw: unknown): LocaleStatusMap | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const out: Partial<LocaleStatusMap> = {};
  for (const locale of ["en", "zh", "th"] as const) {
    const value = asString(obj[locale]);
    if (!value || !LOCALE_STATUS_SET.has(value as LocaleStatus)) return null;
    out[locale] = value as LocaleStatus;
  }
  return out as LocaleStatusMap;
}

function isIsoDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function coerceSource(raw: unknown): ContentSource | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const type = asString(obj.type);
  const name = asString(obj.name);
  const url = asString(obj.url);
  const verifiedAt = asString(obj.verified_at);
  if (!type || !name || !url || !verifiedAt) return null;
  if (!SOURCE_TYPE_SET.has(type)) return null;
  if (!isIsoDate(verifiedAt)) return null;
  const note = asString(obj.note) ?? undefined;
  return { type, name, url, verified_at: verifiedAt, ...(note ? { note } : {}) };
}

export function normalizeKnowledgeArticle(raw: unknown) {
  const obj = asRecord(raw);
  if (!obj) return null;
  const slug = asString(obj.slug);
  const type = asString(obj.type);
  const title = coerceLocalizedText(obj.title);
  const summary = coerceLocalizedText(obj.summary);
  const body = coerceLocalizedParagraphs(obj.body);
  const reviewedAt = asString(obj.reviewed_at) ?? asString(obj.verified_at);
  const sourcesRaw = Array.isArray(obj.sources) ? obj.sources : [];
  const sources = sourcesRaw
    .map((item) => coerceSource(item))
    .filter((item): item is ContentSource => Boolean(item));
  if (
    !slug ||
    !isContentSlug(slug) ||
    type !== "knowledge_article" ||
    !title ||
    !summary ||
    !body ||
    !reviewedAt ||
    !isIsoDate(reviewedAt) ||
    !sources.length
  ) {
    return null;
  }
  const localeStatus = coerceLocaleStatus(obj.locale_status) ?? inferLocaleStatus(title, body);
  return {
    slug,
    type: "knowledge_article" as const,
    status: resolveContentStatus(obj),
    title,
    summary,
    body,
    reviewed_at: reviewedAt,
    locale_status: localeStatus,
    sources,
  };
}

export function normalizeBlogPost(raw: unknown): BlogPost | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const slug = asString(obj.slug);
  const type = asString(obj.type);
  const title = coerceLocalizedText(obj.title);
  const summary = coerceLocalizedText(obj.summary);
  const body = coerceLocalizedParagraphs(obj.body);
  const author = asString(obj.author);
  const publishedAt = asString(obj.published_at);
  const updatedAt = asString(obj.updated_at);
  const reviewedAt = asString(obj.reviewed_at);
  const sourcesRaw = Array.isArray(obj.sources) ? obj.sources : [];
  const sources = sourcesRaw
    .map((item) => coerceSource(item))
    .filter((item): item is ContentSource => Boolean(item));
  if (
    !slug ||
    !isContentSlug(slug) ||
    type !== "blog_post" ||
    !title ||
    !summary ||
    !body ||
    !author ||
    !publishedAt ||
    !updatedAt ||
    !reviewedAt ||
    !isIsoDate(publishedAt) ||
    !isIsoDate(updatedAt) ||
    !isIsoDate(reviewedAt) ||
    !sources.length
  ) {
    return null;
  }
  const localeStatus = coerceLocaleStatus(obj.locale_status) ?? inferLocaleStatus(title, body);
  return {
    slug,
    type: "blog_post",
    status: resolveContentStatus(obj),
    title,
    summary,
    body,
    author,
    published_at: publishedAt,
    updated_at: updatedAt,
    reviewed_at: reviewedAt,
    locale_status: localeStatus,
    sources,
  };
}

function inferLocaleStatusFromText(text: LocalizedText): LocaleStatusMap {
  const map: Partial<LocaleStatusMap> = {};
  for (const locale of ["en", "zh", "th"] as const) {
    map[locale] = text[locale].trim() ? "complete" : "missing";
  }
  return map as LocaleStatusMap;
}

export function normalizeInvestmentGuide(raw: unknown): InvestmentGuide | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const slug = asString(obj.slug);
  const type = asString(obj.type);
  const version = asString(obj.version);
  const owner = asString(obj.owner);
  const title = coerceLocalizedText(obj.title);
  const summary = coerceLocalizedText(obj.summary);
  const disclaimer = coerceLocalizedText(obj.disclaimer);
  const forecastDisclaimer = coerceLocalizedText(obj.forecast_disclaimer);
  const body = coerceLocalizedParagraphs(obj.body);
  const reviewedAt = asString(obj.reviewed_at);
  const sourcesRaw = Array.isArray(obj.sources) ? obj.sources : [];
  const sources = sourcesRaw
    .map((item) => coerceSource(item))
    .filter((item): item is ContentSource => Boolean(item));
  if (
    !slug ||
    !isContentSlug(slug) ||
    type !== "investment_guide" ||
    !version ||
    !owner ||
    !title ||
    !summary ||
    !disclaimer ||
    !forecastDisclaimer ||
    !body ||
    !reviewedAt ||
    !isIsoDate(reviewedAt) ||
    !sources.length
  ) {
    return null;
  }
  const localeStatus =
    coerceLocaleStatus(obj.locale_status) ?? inferLocaleStatus(title, body);
  return {
    slug,
    type: "investment_guide",
    status: resolveContentStatus(obj),
    version,
    owner,
    title,
    summary,
    disclaimer,
    forecast_disclaimer: forecastDisclaimer,
    body,
    reviewed_at: reviewedAt,
    locale_status: localeStatus,
    sources,
  };
}

export function normalizeLegalGuide(raw: unknown): LegalGuide | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const slug = asString(obj.slug);
  const type = asString(obj.type);
  const version = asString(obj.version);
  const owner = asString(obj.owner);
  const jurisdiction = coerceLocalizedText(obj.jurisdiction);
  const title = coerceLocalizedText(obj.title);
  const summary = coerceLocalizedText(obj.summary);
  const disclaimer = coerceLocalizedText(obj.disclaimer);
  const body = coerceLocalizedParagraphs(obj.body);
  const reviewedAt = asString(obj.reviewed_at);
  const sourcesRaw = Array.isArray(obj.sources) ? obj.sources : [];
  const sources = sourcesRaw
    .map((item) => coerceSource(item))
    .filter((item): item is ContentSource => Boolean(item));
  if (
    !slug ||
    !isContentSlug(slug) ||
    type !== "legal_guide" ||
    !version ||
    !owner ||
    !jurisdiction ||
    !title ||
    !summary ||
    !disclaimer ||
    !body ||
    !reviewedAt ||
    !isIsoDate(reviewedAt) ||
    !sources.some((s) => s.type === "government")
  ) {
    return null;
  }
  const localeStatus =
    coerceLocaleStatus(obj.locale_status) ?? inferLocaleStatus(title, body);
  return {
    slug,
    type: "legal_guide",
    status: resolveContentStatus(obj),
    version,
    owner,
    jurisdiction,
    title,
    summary,
    disclaimer,
    body,
    reviewed_at: reviewedAt,
    locale_status: localeStatus,
    sources,
  };
}

export function normalizeFaqEntry(raw: unknown): FaqEntry | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const id = asString(obj.id);
  const type = asString(obj.type);
  const category = asString(obj.category);
  const sortOrder =
    typeof obj.sort_order === "number" && Number.isFinite(obj.sort_order)
      ? obj.sort_order
      : null;
  const question = coerceLocalizedText(obj.question);
  const answer = coerceLocalizedText(obj.answer);
  const sourceClass = asString(obj.source_class);
  const reviewedAt = asString(obj.reviewed_at);
  if (
    !id ||
    !isContentSlug(id) ||
    type !== "faq_entry" ||
    !category ||
    !FAQ_CATEGORY_SET.has(category as FaqCategory) ||
    sortOrder == null ||
    !question ||
    !answer ||
    !sourceClass ||
    !reviewedAt ||
    !isIsoDate(reviewedAt)
  ) {
    return null;
  }
  const localeStatus =
    coerceLocaleStatus(obj.locale_status) ?? inferLocaleStatusFromText(question);
  return {
    id,
    type: "faq_entry",
    status: resolveContentStatus(obj),
    category: category as FaqCategory,
    sort_order: sortOrder,
    question,
    answer,
    source_class: sourceClass,
    reviewed_at: reviewedAt,
    locale_status: localeStatus,
  };
}

export function pickLocalizedText(
  text: LocalizedText,
  locale: Locale,
): { value: string; locale: Locale; fallbackFrom: Locale | null } {
  const direct = text[locale];
  if (direct) return { value: direct, locale, fallbackFrom: null };
  if (text.en) return { value: text.en, locale: "en", fallbackFrom: locale };
  if (text.zh) return { value: text.zh, locale: "zh", fallbackFrom: locale };
  if (text.th) return { value: text.th, locale: "th", fallbackFrom: locale };
  return { value: "", locale, fallbackFrom: null };
}
