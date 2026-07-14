import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import type { CityView } from "@/lib/data/geography";
import type { DeveloperView } from "@/lib/data/developers";
import type { DistrictView } from "@/lib/data/geography";

export type ListingFilterValues = {
  sort?: string;
  listing_type?: string;
  city?: string;
  district?: string;
  developer?: string;
  transit?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  type?: string;
  q?: string;
};

type ListingFiltersProps = {
  locale: Locale;
  dict: Dictionary;
  actionPath?: string;
  values?: ListingFilterValues;
  cities: CityView[];
  districts: DistrictView[];
  developers: DeveloperView[];
};

export function ListingFilters({
  locale,
  dict,
  actionPath = "/properties",
  values,
  cities,
  districts,
  developers,
}: ListingFiltersProps) {
  const f = dict.listings;

  return (
    <form
      action={localePath(locale, actionPath)}
      method="get"
      className="grid gap-3 rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{f.sort}</span>
        <select
          name="sort"
          defaultValue={values?.sort || "newest"}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="newest">{f.sortNewest}</option>
          <option value="price_asc">{f.sortPriceAsc}</option>
          <option value="price_desc">{f.sortPriceDesc}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {f.listingType}
        </span>
        <select
          name="listing_type"
          defaultValue={values?.listing_type || "all"}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="all">{f.all}</option>
          <option value="sale">{dict.common.sale}</option>
          <option value="rent">{dict.common.rent}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{f.city}</span>
        <select
          name="city"
          defaultValue={values?.city || ""}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{f.all}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {f.district}
        </span>
        <select
          name="district"
          defaultValue={values?.district || ""}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{f.all}</option>
          {districts.map((district) => (
            <option key={district.id} value={district.slug}>
              {district.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {f.developer}
        </span>
        <select
          name="developer"
          defaultValue={values?.developer || ""}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{f.all}</option>
          {developers.map((developer) => (
            <option key={developer.id} value={developer.slug}>
              {developer.name[locale]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {f.transit}
        </span>
        <select
          name="transit"
          defaultValue={values?.transit || ""}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{f.all}</option>
          <option value="bts">{f.bts}</option>
          <option value="mrt">{f.mrt}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {f.bedrooms}
        </span>
        <select
          name="bedrooms"
          defaultValue={values?.bedrooms || ""}
          className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{f.all}</option>
          <option value="0">Studio</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{f.price}</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="min_price"
            min={0}
            placeholder={f.minPrice}
            defaultValue={values?.min_price || ""}
            className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
          />
          <input
            type="number"
            name="max_price"
            min={0}
            placeholder={f.maxPrice}
            defaultValue={values?.max_price || ""}
            className="h-10 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
          />
        </div>
      </label>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
        >
          {f.apply}
        </button>
        <Link
          href={localePath(locale, actionPath)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--brand-line)] px-4 text-sm text-[var(--brand-deep)]"
        >
          {f.reset}
        </Link>
      </div>
    </form>
  );
}
