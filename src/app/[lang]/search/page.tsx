import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { SearchForm } from "@/components/search/search-form";
import { isLocale } from "@/config/locales";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, fillTemplate } from "@/lib/i18n/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.searchTitle,
    description: dict.meta.searchDescription,
    path: "/search",
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q : "";
  const location = typeof query.location === "string" ? query.location : "";
  const type = typeof query.type === "string" ? query.type : "all";

  const results = await listPublishedProperties({
    query: q,
    location,
    type,
  });

  return (
    <PageShell
      title={dict.search.title}
      subtitle={dict.search.subtitle}
      notice={dict.common.placeholderNotice}
    >
      <div className="space-y-8">
        <SearchForm
          locale={lang}
          dict={dict}
          defaults={{ q, location, type }}
        />
        <p className="text-sm text-stone-600">
          {fillTemplate(dict.search.showing, {
            count: String(results.length),
          })}
        </p>
        <PropertyGrid locale={lang} dict={dict} properties={results} />
      </div>
    </PageShell>
  );
}
