import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ListingPagination } from "@/components/listings/listing-pagination";
import { PropertyGrid } from "@/components/property/property-grid";
import { SearchForm } from "@/components/search/search-form";
import { isLocale } from "@/config/locales";
import {
  DEFAULT_LISTING_PAGE_SIZE,
  listPublishedPropertiesPaged,
} from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

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
  const pageRaw = Number(
    typeof query.page === "string" ? query.page : "1",
  );
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const paged = await listPublishedPropertiesPaged({
    query: q,
    location,
    type,
    verifiedOnly: true,
    sort: "newest",
    page,
    pageSize: DEFAULT_LISTING_PAGE_SIZE,
  });

  const filterParams = {
    q: q || undefined,
    location: location || undefined,
    type: type === "all" ? undefined : type,
  };

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
        <ListingPagination
          locale={lang}
          dict={dict}
          basePath="/search"
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          pageSize={paged.pageSize}
          params={filterParams}
        />
        <PropertyGrid locale={lang} dict={dict} properties={paged.items} />
        <ListingPagination
          locale={lang}
          dict={dict}
          basePath="/search"
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          pageSize={paged.pageSize}
          params={filterParams}
        />
      </div>
    </PageShell>
  );
}
