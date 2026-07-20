import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentRelatedLinks } from "@/components/content/content-related-links";
import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale, type Locale } from "@/config/locales";
import { renderFaqEntriesLocale } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { breadcrumbListSchema, platformFaqSchema } from "@/lib/seo/schema";

const CATEGORY_ORDER = [
  "platform",
  "process",
  "listings",
  "contact",
  "guides",
] as const;

function guideLinkForEntry(
  locale: Locale,
  id: string,
): { href: string; label: string } | null {
  if (id === "faq-investment-questions") {
    return { href: localePath(locale, "/knowledge/investment"), label: "investment" };
  }
  if (id === "faq-legal-questions") {
    return { href: localePath(locale, "/knowledge/legal"), label: "legal" };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.faqHub.title,
    description: dict.faqHub.subtitle,
    path: "/faq",
  });
}

export default async function FaqHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const f = dict.faqHub;
  const entries = renderFaqEntriesLocale(lang);
  const byCategory = new Map<string, typeof entries>();
  for (const entry of entries) {
    const rows = byCategory.get(entry.category) ?? [];
    rows.push(entry);
    byCategory.set(entry.category, rows);
  }

  const schemaFaqs = entries.map((entry) => ({
    question: entry.question.value,
    answer: entry.answer.value,
  }));

  return (
    <PageShell
      title={f.title}
      subtitle={f.subtitle}
      notice={f.notice}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: f.title },
      ]}
    >
      <JsonLd
        data={[
          ...(platformFaqSchema(lang, schemaFaqs)
            ? [platformFaqSchema(lang, schemaFaqs)!]
            : []),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: f.title },
          ]),
        ]}
      />
      <div className="space-y-8" data-slot="faq-hub">
        {CATEGORY_ORDER.map((categoryId) => {
          const rows = byCategory.get(categoryId);
          if (!rows?.length) return null;
          const label = f.categories[categoryId];
          return (
            <section
              key={categoryId}
              id={`faq-${categoryId}`}
              aria-labelledby={`faq-heading-${categoryId}`}
              className="space-y-3"
            >
              <h2
                id={`faq-heading-${categoryId}`}
                className="ds-h3 text-xl text-[var(--brand-deep)]"
              >
                {label}
              </h2>
              <div className="space-y-2">
                {rows.map((entry) => {
                  const guideLink = guideLinkForEntry(lang, entry.id);
                  return (
                    <SurfaceCard key={entry.id} className="p-0!">
                      <details
                        id={entry.id}
                        className="group"
                        data-faq-entry={entry.id}
                      >
                        <summary className="cursor-pointer list-none px-5 py-4 font-medium text-[var(--brand-deep)] marker:content-none [&::-webkit-details-marker]:hidden">
                          {entry.question.value}
                        </summary>
                        <div className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed text-stone-700">
                          <p>{entry.answer.value}</p>
                          {guideLink ? (
                            <p className="mt-2">
                              <Link
                                href={guideLink.href}
                                className="text-[var(--brand)] underline-offset-2 hover:underline"
                              >
                                {guideLink.label === "investment"
                                  ? f.investmentGuideLink
                                  : f.legalGuideLink}
                              </Link>
                            </p>
                          ) : null}
                        </div>
                      </details>
                    </SurfaceCard>
                  );
                })}
              </div>
            </section>
          );
        })}
        <ContentRelatedLinks locale={lang} dict={dict} currentPath="/faq" />
      </div>
    </PageShell>
  );
}
