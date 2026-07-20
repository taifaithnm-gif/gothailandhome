import type { Locale } from "@/config/locales";

type LocalizedText = Partial<Record<Locale, string | null | undefined>> & {
  en?: string | null;
  zh?: string | null;
  th?: string | null;
};

export type ProjectFaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type VisibleProjectFaq = {
  question: string;
  answer: string;
};

function localizedText(
  value: LocalizedText | null | undefined,
  locale: Locale,
): string {
  const raw =
    value?.[locale] || value?.en || value?.zh || value?.th || "";
  return String(raw).trim();
}

/**
 * Visible FAQ rows for project detail and FAQPage schema.
 * Locale → en → zh → th fallback; empty question/answer pairs are omitted.
 */
export function visibleProjectFaqs(
  locale: Locale,
  faqs: ProjectFaqItem[] | null | undefined,
): VisibleProjectFaq[] {
  if (!faqs?.length) return [];
  const out: VisibleProjectFaq[] = [];
  for (const item of faqs) {
    const question = localizedText(item.question, locale);
    const answer = localizedText(item.answer, locale);
    if (!question || !answer) continue;
    out.push({ question, answer });
  }
  return out;
}
