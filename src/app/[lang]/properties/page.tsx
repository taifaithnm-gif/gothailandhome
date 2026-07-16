import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingPagination } from "@/components/listings/listing-pagination";
import {
  ActiveSearchSummary,
  SearchTrustDisclosure,
} from "@/components/listings/search-results-chrome";
import { PropertyGrid } from "@/components/property/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { listCities, listDistricts } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import {
  DEFAULT_LISTING_PAGE_SIZE,
  listPublishedPropertiesPaged,
  type ListingSort,
} from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  listingSearchToQueryRecord,
  parseListingSearchParams,
  toListingFilterValues,
} from "@/lib/search/listing-search-state";
import { collectionPageSchema } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.propertiesTitle,
    description: dict.meta.propertiesDescription,
    path: "/properties",
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PropertiesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/properties"> & { searchParams: SearchParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const query = await searchParams;
  const state = parseListingSearchParams(query);
  const dict = await getDictionary(lang);
  const clearHref = localePath(lang, "/properties");

  const [citiesRaw, districtsRaw, developersRaw, projectsRaw, paged] =
    await Promise.all([
      listCities(),
      listDistricts(),
      listPublishedDevelopers(),
      listPublishedProjects(),
      listPublishedPropertiesPaged({
        query: state.q,
        location: state.location,
        verifiedOnly: true,
        listingType: state.listingType,
        type: state.type,
        citySlug: state.city,
        districtSlug: state.district,
        projectSlug: state.project,
        developerSlug: state.developer,
        transit: state.transit,
        bedrooms: state.bedrooms,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        minArea: state.minArea,
        maxArea: state.maxArea,
        sort: state.sort as ListingSort,
        page: state.page,
        pageSize: DEFAULT_LISTING_PAGE_SIZE,
      }),
    ]);

  const cities = citiesRaw.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
  }));
  const districts = districtsRaw.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    citySlug: d.citySlug,
  }));
  const developers = developersRaw.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
  }));
  const projects = projectsRaw.slice(0, 80).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
  }));

  const filterParams = listingSearchToQueryRecord(state);
  const formValues = toListingFilterValues(state);

  return (
    <PageShell
      title={dict.properties.title}
      subtitle={dict.properties.subtitle}
    >
      <JsonLd
        data={collectionPageSchema({
          locale: lang,
          name: dict.meta.propertiesTitle,
          description: dict.meta.propertiesDescription,
          path: "/properties",
        })}
      />
      <div className="mb-6 space-y-4">
        <SearchTrustDisclosure dict={dict} />
        <ListingFilters
          locale={lang}
          dict={dict}
          actionPath="/properties"
          state={state}
          cities={cities}
          districts={districts}
          developers={developers}
          projects={projects}
          values={{
            sort: formValues.sort,
            listing_type: state.listingType,
            city: formValues.city || "",
            district: formValues.district || "",
            project: formValues.project || "",
            developer: formValues.developer || "",
            transit: formValues.transit || "",
            bedrooms: formValues.bedrooms || "",
            min_price: formValues.min_price || "",
            max_price: formValues.max_price || "",
            min_area: formValues.min_area || "",
            max_area: formValues.max_area || "",
            type: formValues.type || "all",
            q: formValues.q || "",
            location: formValues.location || "",
          }}
        />
        <ActiveSearchSummary
          locale={lang}
          dict={dict}
          state={state}
          total={paged.total}
          cities={cities}
          districts={districts}
          developers={developers}
          projects={projects}
          clearHref={clearHref}
        />
        <ListingPagination
          locale={lang}
          dict={dict}
          basePath="/properties"
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          pageSize={paged.pageSize}
          params={filterParams}
        />
      </div>

      {paged.error ? (
        <ErrorState
          title={dict.properties.queryErrorTitle}
          description={dict.properties.queryErrorBody}
          action={
            <Link
              href={clearHref}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              {dict.properties.noResultsClear}
            </Link>
          }
        />
      ) : paged.total === 0 ? (
        <EmptyState
          title={dict.properties.noResultsTitle}
          description={dict.properties.noResultsBody}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={clearHref}
                className={cn(buttonVariants({ variant: "primary" }))}
              >
                {dict.properties.noResultsClear}
              </Link>
              <Link
                href={`${clearHref}?city=bangkok`}
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                {dict.properties.noResultsBrowse}
              </Link>
            </div>
          }
        />
      ) : (
        <div
          className="min-h-[48rem]"
          data-slot="search-results-grid"
        >
          <PropertyGrid
            locale={lang}
            dict={dict}
            properties={paged.items}
            imagePriorityCount={1}
          />
        </div>
      )}

      <div className="mt-8">
        <ListingPagination
          locale={lang}
          dict={dict}
          basePath="/properties"
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
