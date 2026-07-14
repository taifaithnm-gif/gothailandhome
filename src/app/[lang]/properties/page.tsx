import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ListingFilters } from "@/components/listings/listing-filters";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { listCities, listDistricts } from "@/lib/data/geography";
import {
  listPublishedProperties,
  type ListingSort,
  type ListingType,
} from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

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

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertiesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/properties"> & { searchParams: SearchParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const query = await searchParams;
  const sort = (one(query.sort) || "newest") as ListingSort;
  const listingType = (one(query.listing_type) || "all") as ListingType | "all";
  const city = one(query.city) || undefined;
  const district = one(query.district) || undefined;
  const developer = one(query.developer) || undefined;
  const transit = one(query.transit) || undefined;
  const bedroomsRaw = one(query.bedrooms);
  const minPriceRaw = one(query.min_price);
  const maxPriceRaw = one(query.max_price);
  const q = one(query.q) || undefined;

  const dict = await getDictionary(lang);
  const [cities, districts, developers, properties] = await Promise.all([
    listCities(),
    listDistricts(),
    listPublishedDevelopers(),
    listPublishedProperties({
      query: q,
      verifiedOnly: true,
      listingType,
      citySlug: city,
      districtSlug: district,
      developerSlug: developer,
      transit,
      bedrooms: bedroomsRaw ? Number(bedroomsRaw) : undefined,
      minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      sort,
    }),
  ]);

  return (
    <PageShell
      title={dict.properties.title}
      subtitle={dict.properties.subtitle}
    >
      <div className="mb-8 space-y-4">
        <ListingFilters
          locale={lang}
          dict={dict}
          cities={cities}
          districts={districts}
          developers={developers}
          values={{
            sort,
            listing_type: listingType,
            city: city || "",
            district: district || "",
            developer: developer || "",
            transit: transit || "",
            bedrooms: bedroomsRaw || "",
            min_price: minPriceRaw || "",
            max_price: maxPriceRaw || "",
            q: q || "",
          }}
        />
        <p className="text-sm text-stone-500">
          {dict.search.showing.replace("{count}", String(properties.length))}
        </p>
      </div>
      <PropertyGrid locale={lang} dict={dict} properties={properties} />
    </PageShell>
  );
}
