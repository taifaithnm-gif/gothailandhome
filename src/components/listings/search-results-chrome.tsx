import Link from "next/link";
import type { ReactNode } from "react";

import type { SlimNamedOption } from "@/components/listings/listing-filters";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { propertyTypeLabel } from "@/lib/i18n/metadata";
import {
  countActiveListingFilters,
  type ListingSearchState,
} from "@/lib/search/listing-search-state";

type ActiveSearchSummaryProps = {
  locale: Locale;
  dict: Dictionary;
  state: ListingSearchState;
  total: number;
  cities: SlimNamedOption[];
  districts: SlimNamedOption[];
  developers: SlimNamedOption[];
  projects: SlimNamedOption[];
  clearHref: string;
};

function chip(label: string, value: string) {
  return (
    <span
      key={`${label}:${value}`}
      className="inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--brand-soft)] px-2.5 py-1 text-xs text-[var(--brand-deep)]"
    >
      <span className="font-medium">{label}</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

export function ActiveSearchSummary({
  locale,
  dict,
  state,
  total,
  cities,
  districts,
  developers,
  projects,
  clearHref,
}: ActiveSearchSummaryProps) {
  const f = dict.listings;
  const chips: ReactNode[] = [];

  if (state.listingType !== "all") {
    chips.push(
      chip(
        f.listingType,
        state.listingType === "sale" ? dict.common.sale : dict.common.rent,
      ),
    );
  }
  if (state.type) {
    chips.push(chip(f.propertyType, propertyTypeLabel(dict, state.type)));
  }
  if (state.city) {
    const city = cities.find((c) => c.slug === state.city);
    chips.push(chip(f.city, city?.name[locale] || state.city));
  }
  if (state.district) {
    const district = districts.find((d) => d.slug === state.district);
    chips.push(chip(f.district, district?.name[locale] || state.district));
  }
  if (state.project) {
    const project = projects.find((p) => p.slug === state.project);
    chips.push(
      chip(
        f.project,
        project?.name[locale] || project?.name.en || state.project,
      ),
    );
  }
  if (state.developer) {
    const developer = developers.find((d) => d.slug === state.developer);
    chips.push(chip(f.developer, developer?.name[locale] || state.developer));
  }
  if (state.transit) {
    chips.push(chip(f.transit, state.transit === "bts" ? f.bts : f.mrt));
  }
  if (state.bedrooms != null) {
    chips.push(
      chip(
        f.bedrooms,
        state.bedrooms === 0 ? f.studio : String(state.bedrooms),
      ),
    );
  }
  if (state.minPrice != null || state.maxPrice != null) {
    chips.push(
      chip(f.price, `${state.minPrice ?? "…"} – ${state.maxPrice ?? "…"}`),
    );
  }
  if (state.minArea != null || state.maxArea != null) {
    chips.push(
      chip(f.area, `${state.minArea ?? "…"} – ${state.maxArea ?? "…"}`),
    );
  }
  if (state.q) chips.push(chip(f.keyword, state.q));
  if (state.location) {
    chips.push(chip(dict.search.locationLabel, state.location));
  }

  const active = countActiveListingFilters(state);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          {dict.properties.resultCount.replace("{count}", String(total))}
        </p>
        {active > 0 ? (
          <Link
            href={clearHref}
            className="text-sm font-medium text-[var(--brand)] underline-offset-4 hover:underline"
          >
            {dict.listings.clearAll}
          </Link>
        ) : null}
      </div>
      {chips.length ? (
        <div>
          <p className="ds-caption mb-2 text-stone-500">
            {dict.properties.activeSummary}
          </p>
          <div className="flex flex-wrap gap-2">{chips}</div>
        </div>
      ) : null}
    </div>
  );
}

export function SearchTrustDisclosure({ dict }: { dict: Dictionary }) {
  return (
    <aside
      className="rounded-[var(--card-radius)] border border-dashed border-[var(--brand-line)] bg-[var(--brand-soft)]/60 px-4 py-3"
      data-slot="search-trust"
    >
      <p className="text-sm font-medium text-[var(--brand-deep)]">
        {dict.properties.trustTitle}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">
        {dict.properties.trustBody}
      </p>
    </aside>
  );
}
