"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useId, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel, Input, Select } from "@/components/ui/field";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import {
  countActiveListingFilters,
  type ListingSearchState,
} from "@/lib/search/listing-search-state";
import { cn } from "@/lib/utils";

export type SlimNamedOption = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  citySlug?: string;
};

export type ListingFilterFormValues = {
  sort?: string;
  listing_type?: string;
  city?: string;
  district?: string;
  project?: string;
  developer?: string;
  transit?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  min_area?: string;
  max_area?: string;
  type?: string;
  q?: string;
  location?: string;
};

type ListingFiltersProps = {
  locale: Locale;
  dict: Dictionary;
  actionPath?: "/properties" | "/search";
  values?: ListingFilterFormValues;
  state: ListingSearchState;
  cities: SlimNamedOption[];
  districts: SlimNamedOption[];
  developers: SlimNamedOption[];
  projects: SlimNamedOption[];
};

function FilterFields({
  locale,
  dict,
  values,
  cities,
  districts,
  developers,
  projects,
  idPrefix,
}: {
  locale: Locale;
  dict: Dictionary;
  values?: ListingFilterFormValues;
  cities: SlimNamedOption[];
  districts: SlimNamedOption[];
  developers: SlimNamedOption[];
  projects: SlimNamedOption[];
  idPrefix: string;
}) {
  const f = dict.listings;
  const city = values?.city || "";
  const visibleDistricts = city
    ? districts.filter((d) => d.citySlug === city)
    : districts;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor={`${idPrefix}-q`}>{f.keyword}</FieldLabel>
        <Input
          id={`${idPrefix}-q`}
          type="search"
          name="q"
          defaultValue={values?.q || ""}
          placeholder={dict.search.queryPlaceholder}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-sort`}>{f.sort}</FieldLabel>
        <Select
          id={`${idPrefix}-sort`}
          name="sort"
          defaultValue={values?.sort || "newest_verified"}
        >
          <option value="newest_verified">{f.sortNewestVerified}</option>
          <option value="newest">{f.sortNewest}</option>
          <option value="price_asc">{f.sortPriceAsc}</option>
          <option value="price_desc">{f.sortPriceDesc}</option>
          <option value="area_desc">{f.sortAreaDesc}</option>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-listing`}>
          {f.listingType}
        </FieldLabel>
        <Select
          id={`${idPrefix}-listing`}
          name="listing_type"
          defaultValue={values?.listing_type || "all"}
        >
          <option value="all">{f.all}</option>
          <option value="sale">{dict.common.sale}</option>
          <option value="rent">{dict.common.rent}</option>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-type`}>{f.propertyType}</FieldLabel>
        <Select
          id={`${idPrefix}-type`}
          name="type"
          defaultValue={values?.type || "all"}
        >
          <option value="all">{dict.common.allTypes}</option>
          <option value="condo">{dict.common.condo}</option>
          <option value="house">{dict.common.house}</option>
          <option value="villa">{dict.common.villa}</option>
          <option value="land">{dict.common.land}</option>
          <option value="commercial">{dict.common.commercial}</option>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-city`}>{f.city}</FieldLabel>
        <Select
          id={`${idPrefix}-city`}
          name="city"
          defaultValue={values?.city || ""}
        >
          <option value="">{f.all}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name[locale]}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-district`}>{f.district}</FieldLabel>
        <Select
          id={`${idPrefix}-district`}
          name="district"
          defaultValue={values?.district || ""}
        >
          <option value="">{f.all}</option>
          {visibleDistricts.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name[locale]}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-project`}>{f.project}</FieldLabel>
        <Select
          id={`${idPrefix}-project`}
          name="project"
          defaultValue={values?.project || ""}
        >
          <option value="">{f.all}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name[locale] || p.name.en}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-developer`}>{f.developer}</FieldLabel>
        <Select
          id={`${idPrefix}-developer`}
          name="developer"
          defaultValue={values?.developer || ""}
        >
          <option value="">{f.all}</option>
          {developers.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name[locale]}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-transit`}>{f.transit}</FieldLabel>
        <Select
          id={`${idPrefix}-transit`}
          name="transit"
          defaultValue={values?.transit || ""}
        >
          <option value="">{f.all}</option>
          <option value="bts">{f.bts}</option>
          <option value="mrt">{f.mrt}</option>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-bedrooms`}>{f.bedrooms}</FieldLabel>
        <Select
          id={`${idPrefix}-bedrooms`}
          name="bedrooms"
          defaultValue={values?.bedrooms || ""}
        >
          <option value="">{f.all}</option>
          <option value="0">{f.studio}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </Select>
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel>{f.price}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="min_price"
            min={0}
            inputMode="numeric"
            placeholder={f.minPrice}
            defaultValue={values?.min_price || ""}
            aria-label={f.minPrice}
          />
          <Input
            type="number"
            name="max_price"
            min={0}
            inputMode="numeric"
            placeholder={f.maxPrice}
            defaultValue={values?.max_price || ""}
            aria-label={f.maxPrice}
          />
        </div>
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel>{f.area}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            name="min_area"
            min={0}
            inputMode="numeric"
            placeholder={f.minArea}
            defaultValue={values?.min_area || ""}
            aria-label={f.minArea}
          />
          <Input
            type="number"
            name="max_area"
            min={0}
            inputMode="numeric"
            placeholder={f.maxArea}
            defaultValue={values?.max_area || ""}
            aria-label={f.maxArea}
          />
        </div>
      </Field>
    </div>
  );
}

export function ListingFilters({
  locale,
  dict,
  actionPath = "/properties",
  values,
  state,
  cities,
  districts,
  developers,
  projects,
}: ListingFiltersProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const activeCount = countActiveListingFilters(state);
  const action = localePath(locale, actionPath);
  const clearHref = localePath(locale, actionPath);

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="primary" className="min-h-11 min-w-[8rem]">
        {dict.listings.apply}
      </Button>
      <Link
        href={clearHref}
        className={cn(buttonVariants({ variant: "secondary" }), "min-h-11")}
      >
        {dict.listings.clearAll}
      </Link>
    </div>
  );

  const fieldProps = {
    locale,
    dict,
    values,
    cities,
    districts,
    developers,
    projects,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 gap-2"
          aria-expanded={open}
          aria-controls="listing-filter-drawer"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {dict.properties.openFilters}
          {activeCount > 0 ? (
            <span className="rounded-md bg-[var(--brand)] px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
        {activeCount > 0 ? (
          <Link
            href={clearHref}
            className="text-sm font-medium text-[var(--brand)] underline-offset-4 hover:underline"
          >
            {dict.listings.clearAll}
          </Link>
        ) : null}
      </div>

      <form
        action={action}
        method="get"
        className="hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-4 lg:block"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="ds-h3 text-lg">{dict.properties.filtersTitle}</h2>
          {activeCount > 0 ? (
            <span className="ds-caption text-stone-500">
              {dict.listings.activeFilters}: {activeCount}
            </span>
          ) : null}
        </div>
        <FilterFields {...fieldProps} idPrefix="desk" />
        <div className="mt-4">{actions}</div>
      </form>

      {open ? (
        <div
          id="listing-filter-drawer"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={dict.properties.closeFilters}
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id={titleId} className="ds-h3 text-lg">
                {dict.properties.filtersTitle}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label={dict.properties.closeFilters}
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <form action={action} method="get" className="space-y-4 pb-6">
              <FilterFields {...fieldProps} idPrefix="mobile" />
              {actions}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
