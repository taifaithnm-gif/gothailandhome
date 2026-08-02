import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { LaunchKnowledgeCard } from "@/lib/launch/content-launch-v1";
import { localePath } from "@/lib/i18n/metadata";

type KnowledgeCardLinkProps = {
  locale: Locale;
  card: LaunchKnowledgeCard;
};

export function KnowledgeCardLink({ locale, card }: KnowledgeCardLinkProps) {
  return (
    <Link
      href={localePath(locale, `/knowledge/articles/${card.slug}`)}
      className="block h-full rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 transition outline-none hover:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
      data-launch-knowledge={card.slug}
    >
      <h3 className="font-heading text-lg text-[var(--brand-deep)]">
        {card.title[locale]}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-stone-600">
        {card.summary[locale]}
      </p>
    </Link>
  );
}
