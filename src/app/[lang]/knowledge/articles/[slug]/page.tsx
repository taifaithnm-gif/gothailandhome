import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { renderKnowledgeArticleLocale } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { collectionPageSchema, breadcrumbListSchema, articleSchema } from "@/lib/seo/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const article = renderKnowledgeArticleLocale(slug, lang);
  if (!article) return {};
  return buildPageMetadata({
    locale: lang,
    title: article.title.value,
    description: article.summary.value,
    path: `/knowledge/articles/${article.slug}`,
  });
}

export default async function KnowledgeArticleDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const k = dict.knowledge;
  const article = renderKnowledgeArticleLocale(slug, lang);
  if (!article) notFound();

  const fallback =
    article.title.fallbackFrom ||
    article.summary.fallbackFrom ||
    article.body.fallbackFrom;

  return (
    <PageShell
      title={article.title.value}
      subtitle={article.summary.value}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.knowledge, href: localePath(lang, "/knowledge") },
        {
          label: k.articlesTitle,
          href: localePath(lang, "/knowledge/articles"),
        },
        { label: article.title.value },
      ]}
    >
      <JsonLd
        data={[
          articleSchema({
            locale: lang,
            name: article.title.value,
            description: article.summary.value,
            path: `/knowledge/articles/${article.slug}`,
            dateModified: article.reviewedAt,
          }),
          collectionPageSchema({
            locale: lang,
            name: article.title.value,
            description: article.summary.value,
            path: `/knowledge/articles/${article.slug}`,
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.knowledge, path: "/knowledge" },
            { name: k.articlesTitle, path: "/knowledge/articles" },
            { name: article.title.value },
          ]),
        ]}
      />
      <article className="space-y-6" data-slot="knowledge-article-detail">
        {fallback ? (
          <SurfaceCard
            tone="soft"
            className="space-y-1 p-4!"
            data-locale-fallback="en"
          >
            <p className="text-sm text-[var(--brand-deep)]">{k.fallbackTitle}</p>
            <p className="text-xs text-stone-600">{k.fallbackBody}</p>
          </SurfaceCard>
        ) : null}
        <SurfaceCard className="space-y-4 p-5!">
          <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
            {k.articleBodyTitle}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-stone-700">
            {article.body.value.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="space-y-3 p-5!">
          <p className="text-xs text-stone-500">
            {k.verifiedOn}: {article.reviewedAt}
          </p>
          <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
            {k.citationsTitle}
          </h2>
          <ul className="space-y-2">
            {article.sources.map((source, index) => (
              <li key={`${source.url}-${index}`} className="text-sm text-stone-700">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {source.name}
                </a>{" "}
                · {source.type} · {source.verified_at}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </article>
    </PageShell>
  );
}
