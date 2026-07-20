import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentRelatedLinks } from "@/components/content/content-related-links";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
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
    title: dict.meta.knowledgeTitle,
    description: dict.meta.knowledgeDescription,
    path: "/knowledge",
  });
}

export default async function KnowledgeHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const k = dict.knowledge;
  const h = dict.home;

  const guides = [
    {
      href: "/knowledge/investment",
      title: dict.investmentGuide.title,
      body: dict.investmentGuide.educationalLabel,
    },
    {
      href: "/knowledge/legal",
      title: dict.legalGuide.title,
      body: dict.legalGuide.notAdviceLabel,
    },
    {
      href: "/faq",
      title: dict.faqHub.title,
      body: dict.faqHub.subtitle,
    },
    {
      href: "/about",
      title: h.guidePlatformTitle,
      body: h.guidePlatformBody,
    },
    {
      href: "/marketplace",
      title: h.guideVerifiedTitle,
      body: h.guideVerifiedBody,
    },
    {
      href: "/contact",
      title: h.guideContactTitle,
      body: h.guideContactBody,
    },
    {
      href: "/blog",
      title: dict.blog.title,
      body: dict.blog.subtitle,
    },
  ] as const;

  const indexes = [
    {
      href: "/knowledge/articles",
      title: k.articlesTitle,
      body: k.articlesSubtitle,
    },
    {
      href: "/knowledge/glossary",
      title: k.glossaryTitle,
      body: k.glossaryBody,
    },
    {
      href: "/knowledge/bangkok-districts",
      title: k.districtsTitle,
      body: k.districtsBody,
    },
  ] as const;

  return (
    <PageShell
      title={k.title}
      subtitle={k.subtitle}
      notice={k.notice}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: k.title },
      ]}
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="ds-h3 text-xl">{k.guidesTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={localePath(lang, guide.href)}
                className="block h-full"
              >
                <SurfaceCard className="h-full space-y-2 p-5! transition hover:border-[var(--brand)]">
                  <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-stone-600">{guide.body}</p>
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="ds-h3 text-xl">{k.indexesTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {indexes.map((item) => (
              <Link
                key={item.href}
                href={localePath(lang, item.href)}
                className="block h-full"
              >
                <SurfaceCard className="h-full space-y-2 p-5! transition hover:border-[var(--brand)]">
                  <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600">{item.body}</p>
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>

        <ContentRelatedLinks
          locale={lang}
          dict={dict}
          currentPath="/knowledge"
        />
      </div>
    </PageShell>
  );
}
