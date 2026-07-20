export {
  getBlogPost,
  getInvestmentGuide,
  getKnowledgeArticle,
  getLegalGuide,
  listBlogPosts,
  listFaqEntries,
  listKnowledgeArticles,
  renderBlogPostLocale,
  renderFaqEntriesLocale,
  renderInvestmentGuideLocale,
  renderKnowledgeArticleLocale,
  renderLegalGuideLocale,
  contentLoaderPaths,
} from "@/lib/content/loader";

export {
  isContentSlug,
  normalizeBlogPost,
  normalizeContentStatus,
  normalizeFaqEntry,
  normalizeInvestmentGuide,
  normalizeKnowledgeArticle,
  normalizeLegalGuide,
  pickLocalizedText,
  resolveContentStatus,
} from "@/lib/content/validate";

export type {
  BlogPost,
  ContentStatus,
  ContentType,
  FaqCategory,
  FaqEntry,
  InvestmentGuide,
  KnowledgeArticle,
  LegalGuide,
  LocaleStatus,
  LocaleStatusMap,
  LocalizedParagraphs,
  LocalizedRenderField,
  LocalizedText,
  PublicContent,
} from "@/lib/content/types";
