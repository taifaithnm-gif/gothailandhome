import Link from "next/link";

import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

type ContentRelatedLinksProps = {
  locale: Locale;
  dict: Dictionary;
  /** Current path without locale prefix, e.g. `/knowledge/investment` */
  currentPath: string;
};

const LINK_DEFS = [
  { id: "knowledge", path: "/knowledge", labelKey: "knowledge" as const },
  { id: "articles", path: "/knowledge/articles", labelKey: "articles" as const },
  { id: "investment", path: "/knowledge/investment", labelKey: "investment" as const },
  { id: "legal", path: "/knowledge/legal", labelKey: "legal" as const },
  { id: "faq", path: "/faq", labelKey: "faq" as const },
  { id: "blog", path: "/blog", labelKey: "blog" as const },
] as const;

/**
 * Contextual cross-links between Phase 1 content surfaces.
 * Omits the current path to avoid circular self-links.
 */
export function ContentRelatedLinks({
  locale,
  dict,
  currentPath,
}: ContentRelatedLinksProps) {
  const labels = {
    knowledge: dict.nav.knowledge,
    articles: dict.knowledge.articlesTitle,
    investment: dict.investmentGuide.title,
    legal: dict.legalGuide.title,
    faq: dict.faqHub.title,
    blog: dict.blog.title,
  };
  const links = LINK_DEFS.filter((item) => item.path !== currentPath);

  return (
    <SurfaceCard className="space-y-3 p-5!" data-slot="content-related-links">
      <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
        {dict.contentLinks.title}
      </h2>
      <ul className="flex flex-wrap gap-3 text-sm">
        {links.map((item) => (
          <li key={item.id}>
            <Link
              href={localePath(locale, item.path)}
              className="text-[var(--brand)] underline-offset-2 hover:underline"
              data-internal-link={item.id}
            >
              {labels[item.labelKey]}
            </Link>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
