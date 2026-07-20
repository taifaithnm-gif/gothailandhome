import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { renderBlogPostLocale } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { articleSchema, breadcrumbListSchema, collectionPageSchema } from "@/lib/seo/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = renderBlogPostLocale(slug, lang);
  if (!post) return {};
  return buildPageMetadata({
    locale: lang,
    title: post.title.value,
    description: post.summary.value,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const post = renderBlogPostLocale(slug, lang);
  if (!post) notFound();
  const fallback =
    post.title.fallbackFrom || post.summary.fallbackFrom || post.body.fallbackFrom;

  return (
    <PageShell
      title={post.title.value}
      subtitle={post.summary.value}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.blog.title, href: localePath(lang, "/blog") },
        { label: post.title.value },
      ]}
    >
      <JsonLd
        data={[
          articleSchema({
            locale: lang,
            name: post.title.value,
            description: post.summary.value,
            path: `/blog/${post.slug}`,
            dateModified: post.updatedAt,
            datePublished: post.publishedAt,
            authorName: post.author,
          }),
          collectionPageSchema({
            locale: lang,
            name: post.title.value,
            description: post.summary.value,
            path: `/blog/${post.slug}`,
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.blog.title, path: "/blog" },
            { name: post.title.value },
          ]),
        ]}
      />
      <article className="space-y-5" data-slot="blog-post-detail">
        <SurfaceCard className="space-y-2 p-5!">
          <p className="text-xs text-stone-500">
            {dict.blog.authorLabel}: {post.author}
          </p>
          <p className="text-xs text-stone-500">
            {dict.blog.publishedLabel}: {post.publishedAt} · {dict.blog.updatedLabel}:{" "}
            {post.updatedAt}
          </p>
          <p className="text-xs text-stone-500">
            {dict.blog.reviewedLabel}: {post.reviewedAt}
          </p>
          <p className="text-xs text-[var(--brand)]">{dict.blog.editorialLabel}</p>
        </SurfaceCard>
        {fallback ? (
          <SurfaceCard tone="soft" className="space-y-1 p-4!" data-locale-fallback="en">
            <p className="text-sm text-[var(--brand-deep)]">{dict.blog.fallbackTitle}</p>
            <p className="text-xs text-stone-600">{dict.blog.fallbackBody}</p>
          </SurfaceCard>
        ) : null}
        <SurfaceCard className="space-y-3 p-5!">
          <h2 className="ds-h3 text-lg">{dict.blog.bodyTitle}</h2>
          <div className="space-y-3 text-sm leading-relaxed text-stone-700">
            {post.body.value.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="space-y-3 p-5!">
          <h2 className="ds-h3 text-lg">{dict.blog.citationsTitle}</h2>
          <ul className="space-y-2">
            {post.sources.map((source, index) => (
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
