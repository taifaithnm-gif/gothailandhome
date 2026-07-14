import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import type { CityView } from "@/lib/data/geography";

type HeroSearchProps = {
  locale: Locale;
  dict: Dictionary;
  cities: CityView[];
};

export function HeroSearch({ locale, dict, cities }: HeroSearchProps) {
  return (
    <form
      action={localePath(locale, "/properties")}
      method="get"
      className="grid gap-3 rounded-2xl border border-white/20 bg-white/95 p-4 text-[var(--brand-deep)] shadow-lg backdrop-blur sm:grid-cols-2 lg:grid-cols-5"
    >
      <label className="flex flex-col gap-1 text-sm lg:col-span-2">
        <span className="font-medium">{dict.search.queryLabel}</span>
        <input
          type="search"
          name="q"
          placeholder={dict.search.queryPlaceholder}
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{dict.listings.city}</span>
        <select
          name="city"
          defaultValue=""
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="">{dict.listings.all}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{dict.listings.listingType}</span>
        <select
          name="listing_type"
          defaultValue="all"
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3"
        >
          <option value="all">{dict.listings.all}</option>
          <option value="sale">{dict.common.sale}</option>
          <option value="rent">{dict.common.rent}</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
        >
          {dict.search.submit}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
        <Link
          href={`${localePath(locale, "/properties")}?listing_type=sale`}
          className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium"
        >
          {dict.home.buy}
        </Link>
        <Link
          href={`${localePath(locale, "/properties")}?listing_type=rent`}
          className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium"
        >
          {dict.home.rent}
        </Link>
        <Link
          href={`${localePath(locale, "/properties")}?sort=price_asc&listing_type=sale`}
          className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium"
        >
          {dict.home.investment}
        </Link>
      </div>
    </form>
  );
}
