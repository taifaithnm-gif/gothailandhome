import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { getBangkokDistrictGlossary } from "@/lib/knowledge/glossary";

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
    title: dict.meta.knowledgeDistrictsTitle,
    description: dict.meta.knowledgeDistrictsDescription,
    path: "/knowledge/bangkok-districts",
  });
}

export default async function KnowledgeBangkokDistrictsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const k = dict.knowledge;
  const districts = getBangkokDistrictGlossary();

  return (
    <PageShell
      title={k.districtsTitle}
      subtitle={k.districtsBody}
      notice={k.districtsNotice}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: k.title, href: localePath(lang, "/knowledge") },
        { label: k.districtsTitle },
      ]}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((district) => {
          const name =
            district.name[lang] ||
            district.name.en ||
            district.name.th ||
            district.name.zh;
          return (
            <li key={district.slug}>
              <Link
                href={localePath(lang, `/districts/${district.slug}`)}
                className="block h-full"
              >
                <SurfaceCard className="h-full space-y-1 p-4! transition hover:border-[var(--brand)]">
                  <p className="font-heading text-lg text-[var(--brand-deep)]">
                    {name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {district.postalCode
                      ? `${k.postalLabel}: ${district.postalCode}`
                      : k.unknown}
                  </p>
                </SurfaceCard>
              </Link>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
