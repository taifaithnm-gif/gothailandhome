import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { listKnowledgeArticles, pickLocalizedText } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

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
    title: dict.meta.knowledgeArticlesTitle,
    description: dict.meta.knowledgeArticlesDescription,
    path: "/knowledge/articles",
  });
}

export default async function KnowledgeArticlesIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const k = dict.knowledge;
  const items = listKnowledgeArticles();

  return (
    <PageShell
      title={k.articlesTitle}
      subtitle={k.articlesSubtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.knowledge, href: localePath(lang, "/knowledge") },
        { label: k.articlesTitle },
      ]}
    >
      {items.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const title = pickLocalizedText(item.title, lang);
            const summary = pickLocalizedText(item.summary, lang);
            return (
              <li key={item.slug}>
                <Link href={localePath(lang, `/knowledge/articles/${item.slug}`)}>
                  <SurfaceCard className="h-full space-y-2 p-5! transition hover:border-[var(--brand)]">
                    <h2 className="font-heading text-lg text-[var(--brand-deep)]">
                      {title.value}
                    </h2>
                    <p className="text-sm text-stone-600">{summary.value}</p>
                    <p className="text-xs text-stone-500">
                      {k.verifiedOn}: {item.reviewed_at}
                    </p>
                  </SurfaceCard>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <SurfaceCard className="space-y-2 p-5!">
          <h2 className="ds-h3 text-lg">{k.articlesEmptyTitle}</h2>
          <p className="text-sm text-stone-600">{k.articlesEmptyBody}</p>
        </SurfaceCard>
      )}
    </PageShell>
  );
}
