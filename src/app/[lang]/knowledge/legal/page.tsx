import { notFound } from "next/navigation";

import { ContentRelatedLinks } from "@/components/content/content-related-links";
import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { renderLegalGuideLocale } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { breadcrumbListSchema, collectionPageSchema } from "@/lib/seo/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const guide = renderLegalGuideLocale(lang);
  if (!guide) return {};
  return buildPageMetadata({
    locale: lang,
    title: guide.title.value,
    description: guide.summary.value,
    path: "/knowledge/legal",
  });
}

export default async function LegalGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const g = dict.legalGuide;
  const guide = renderLegalGuideLocale(lang);
  if (!guide) notFound();

  const fallback =
    guide.title.fallbackFrom ||
    guide.summary.fallbackFrom ||
    guide.body.fallbackFrom ||
    guide.disclaimer.fallbackFrom;

  return (
    <PageShell
      title={guide.title.value}
      subtitle={guide.summary.value}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.knowledge, href: localePath(lang, "/knowledge") },
        { label: g.title },
      ]}
    >
      <JsonLd
        data={[
          collectionPageSchema({
            locale: lang,
            name: guide.title.value,
            description: guide.summary.value,
            path: "/knowledge/legal",
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.knowledge, path: "/knowledge" },
            { name: g.title },
          ]),
        ]}
      />
      <article className="space-y-6" data-slot="legal-guide">
        <SurfaceCard tone="soft" className="space-y-2 p-5!">
          <p className="text-xs font-medium text-[var(--brand)]">{guide.jurisdiction.value}</p>
          <p className="text-xs text-stone-600">{g.notAdviceLabel}</p>
          <p className="text-sm leading-relaxed text-stone-700">{guide.disclaimer.value}</p>
          <p className="text-xs text-stone-500">
            {g.versionLabel}: {guide.version} · {g.ownerLabel}: {guide.owner} · {g.reviewedLabel}:{" "}
            {guide.reviewedAt}
          </p>
        </SurfaceCard>
        {fallback ? (
          <SurfaceCard
            tone="soft"
            className="space-y-1 p-4!"
            data-locale-fallback="en"
          >
            <p className="text-sm text-[var(--brand-deep)]">{g.fallbackTitle}</p>
            <p className="text-xs text-stone-600">{g.fallbackBody}</p>
          </SurfaceCard>
        ) : null}
        <SurfaceCard className="space-y-4 p-5!">
          <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">{g.bodyTitle}</h2>
          <div className="space-y-3 text-sm leading-relaxed text-stone-700">
            {guide.body.value.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="space-y-3 p-5!">
          <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">{g.citationsTitle}</h2>
          <ul className="space-y-2">
            {guide.sources.map((source, index) => (
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
        <ContentRelatedLinks
          locale={lang}
          dict={dict}
          currentPath="/knowledge/legal"
        />
      </article>
    </PageShell>
  );
}
