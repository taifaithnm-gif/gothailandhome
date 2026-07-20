import type { Locale } from "@/config/locales";

export type ContentType =
  | "knowledge_article"
  | "blog_post"
  | "faq_entry"
  | "investment_guide"
  | "legal_guide";

export type ContentStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "archived"
  | "rejected";

export type LocaleStatus = "complete" | "partial" | "missing";

export type LocalizedText = Record<Locale, string>;
export type LocalizedParagraphs = Record<Locale, string[]>;
export type LocaleStatusMap = Record<Locale, LocaleStatus>;

export type ContentSource = {
  type: string;
  name: string;
  url: string;
  verified_at: string;
  note?: string;
};

export type KnowledgeArticle = {
  slug: string;
  type: "knowledge_article";
  status: ContentStatus;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedParagraphs;
  reviewed_at: string;
  locale_status: LocaleStatusMap;
  sources: ContentSource[];
};

export type BlogPost = {
  slug: string;
  type: "blog_post";
  status: ContentStatus;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedParagraphs;
  author: string;
  published_at: string;
  updated_at: string;
  reviewed_at: string;
  locale_status: LocaleStatusMap;
  sources: ContentSource[];
};

export type InvestmentGuide = {
  slug: string;
  type: "investment_guide";
  status: ContentStatus;
  version: string;
  owner: string;
  title: LocalizedText;
  summary: LocalizedText;
  disclaimer: LocalizedText;
  forecast_disclaimer: LocalizedText;
  body: LocalizedParagraphs;
  reviewed_at: string;
  locale_status: LocaleStatusMap;
  sources: ContentSource[];
};

export type LegalGuide = {
  slug: string;
  type: "legal_guide";
  status: ContentStatus;
  version: string;
  owner: string;
  jurisdiction: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  disclaimer: LocalizedText;
  body: LocalizedParagraphs;
  reviewed_at: string;
  locale_status: LocaleStatusMap;
  sources: ContentSource[];
};

export type FaqCategory =
  | "platform"
  | "process"
  | "listings"
  | "contact"
  | "guides";

export type FaqEntry = {
  id: string;
  type: "faq_entry";
  status: ContentStatus;
  category: FaqCategory;
  sort_order: number;
  question: LocalizedText;
  answer: LocalizedText;
  source_class: string;
  reviewed_at: string;
  locale_status: LocaleStatusMap;
};

export type PublicContent =
  | KnowledgeArticle
  | BlogPost
  | InvestmentGuide
  | LegalGuide
  | FaqEntry;

export type LocalizedRenderField = {
  value: string;
  locale: Locale;
  fallbackFrom: Locale | null;
};
