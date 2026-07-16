import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  getGlossarySections,
  termLabel,
} from "@/lib/knowledge/glossary";

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
    title: dict.meta.knowledgeGlossaryTitle,
    description: dict.meta.knowledgeGlossaryDescription,
    path: "/knowledge/glossary",
  });
}

export default async function KnowledgeGlossaryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const k = dict.knowledge;
  const sections = getGlossarySections();
  const sectionTitles = k.glossarySections as Record<string, string>;

  return (
    <PageShell
      title={k.glossaryTitle}
      subtitle={k.glossaryBody}
      notice={k.glossaryNotice}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: k.title, href: localePath(lang, "/knowledge") },
        { label: k.glossaryTitle },
      ]}
    >
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <h2 className="ds-h3 text-xl">
              {sectionTitles[section.id] || section.id}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {section.terms.map((term) => (
                <li key={term.code}>
                  <SurfaceCard className="flex items-center justify-between gap-3 p-3!">
                    <span className="text-sm font-medium text-[var(--brand-deep)]">
                      {termLabel(term, lang)}
                    </span>
                    <Badge tone="neutral">{term.code}</Badge>
                  </SurfaceCard>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
