import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentRelatedLinks } from "@/components/content/content-related-links";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { listBlogPosts, pickLocalizedText } from "@/lib/content";
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
    title: dict.meta.blogTitle,
    description: dict.meta.blogDescription,
    path: "/blog",
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const blog = dict.blog;
  const items = listBlogPosts();

  return (
    <PageShell
      title={blog.title}
      subtitle={blog.subtitle}
      notice={blog.notice}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: blog.title },
      ]}
    >
      {items.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const title = pickLocalizedText(item.title, lang);
            const summary = pickLocalizedText(item.summary, lang);
            return (
              <li key={item.slug}>
                <Link href={localePath(lang, `/blog/${item.slug}`)}>
                  <SurfaceCard className="h-full space-y-2 p-5! transition hover:border-[var(--brand)]">
                    <p className="text-xs text-stone-500">
                      {blog.authorLabel}: {item.author}
                    </p>
                    <h2 className="font-heading text-lg text-[var(--brand-deep)]">
                      {title.value}
                    </h2>
                    <p className="text-sm text-stone-600">{summary.value}</p>
                    <p className="text-xs text-stone-500">
                      {blog.updatedLabel}: {item.updated_at}
                    </p>
                  </SurfaceCard>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <SurfaceCard className="space-y-2 p-5!" data-slot="blog-empty-state">
          <h2 className="ds-h3 text-lg">{blog.emptyTitle}</h2>
          <p className="text-sm text-stone-600">{blog.emptyBody}</p>
        </SurfaceCard>
      )}
      <div className="mt-8">
        <ContentRelatedLinks locale={lang} dict={dict} currentPath="/blog" />
      </div>
    </PageShell>
  );
}
