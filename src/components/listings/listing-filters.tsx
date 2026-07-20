"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Select,
} from "@/components/ui/field";
import type { Locale } from "@/config/locales";
import { trackListingFilterApply } from "@/lib/analytics";
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FILTER_KEY_ALLOWLIST = [
  "sort",
  "listing_type",
  "city",
  "district",
  "project",
  "developer",
  "transit",
  "bedrooms",
  "min_price",
  "max_price",
  "min_area",
  "max_area",
  "type",
] as const;

function onFilterFormSubmit(
  locale: Locale,
  event: FormEvent<HTMLFormElement>,
) {
  const form = event.currentTarget;
  const data = new FormData(form);
  const keys: string[] = [];
  for (const key of FILTER_KEY_ALLOWLIST) {
    const value = String(data.get(key) ?? "").trim();
    if (value && value !== "all") keys.push(key);
  }
  trackListingFilterApply(locale, keys);
}

/** Drop district values that do not belong to the selected city. */
export function resolveDistrictForCity(
  city: string,
  district: string,
  districts: SlimNamedOption[],
): string {
  if (!district) return "";
  const match = districts.find((item) => item.slug === district);
  if (!match) return "";
  if (city && match.citySlug && match.citySlug !== city) return "";
  return district;
}

function districtsForCity(
  city: string,
  districts: SlimNamedOption[],
): SlimNamedOption[] {
  if (!city) return districts;
  return districts.filter((d) => d.citySlug === city);
}

function rangeIsInvalid(min: string, max: string): boolean {
  if (!min || !max) return false;
  const minN = Number(min);
  const maxN = Number(max);
  if (!Number.isFinite(minN) || !Number.isFinite(maxN)) return false;
  return minN > maxN;
}

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
  const initialCity = values?.city || "";
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(() =>
    resolveDistrictForCity(initialCity, values?.district || "", districts),
  );
  const [minPrice, setMinPrice] = useState(values?.min_price || "");
  const [maxPrice, setMaxPrice] = useState(values?.max_price || "");
  const [minArea, setMinArea] = useState(values?.min_area || "");
  const [maxArea, setMaxArea] = useState(values?.max_area || "");

  const visibleDistricts = districtsForCity(city, districts);
  const priceInvalid = rangeIsInvalid(minPrice, maxPrice);
  const areaInvalid = rangeIsInvalid(minArea, maxArea);
  const priceErrorId = `${idPrefix}-price-error`;
  const areaErrorId = `${idPrefix}-area-error`;

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
        <FieldLabel htmlFor={`${idPrefix}-listing`}>{f.listingType}</FieldLabel>
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
          value={city}
          onChange={(event) => {
            const nextCity = event.target.value;
            setCity(nextCity);
            setDistrict((prev) =>
              resolveDistrictForCity(nextCity, prev, districts),
            );
          }}
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
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          aria-describedby={`${idPrefix}-district-hint`}
        >
          <option value="">{f.all}</option>
          {visibleDistricts.map((d) => (
            <option key={d.id} value={d.slug}>
              {d.name[locale]}
            </option>
          ))}
        </Select>
        <FieldHint id={`${idPrefix}-district-hint`}>{f.districtHint}</FieldHint>
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
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${idPrefix}-min-price`} className="sr-only">
              {f.minPrice}
            </FieldLabel>
            <Input
              id={`${idPrefix}-min-price`}
              type="number"
              name="min_price"
              min={0}
              inputMode="numeric"
              placeholder={f.minPrice}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              aria-invalid={priceInvalid || undefined}
              aria-describedby={priceInvalid ? priceErrorId : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${idPrefix}-max-price`} className="sr-only">
              {f.maxPrice}
            </FieldLabel>
            <Input
              id={`${idPrefix}-max-price`}
              type="number"
              name="max_price"
              min={0}
              inputMode="numeric"
              placeholder={f.maxPrice}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              aria-invalid={priceInvalid || undefined}
              aria-describedby={priceInvalid ? priceErrorId : undefined}
            />
          </div>
        </div>
        {priceInvalid ? (
          <FieldError id={priceErrorId}>{f.rangeInvalid}</FieldError>
        ) : null}
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel>{f.area}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${idPrefix}-min-area`} className="sr-only">
              {f.minArea}
            </FieldLabel>
            <Input
              id={`${idPrefix}-min-area`}
              type="number"
              name="min_area"
              min={0}
              inputMode="numeric"
              placeholder={f.minArea}
              value={minArea}
              onChange={(event) => setMinArea(event.target.value)}
              aria-invalid={areaInvalid || undefined}
              aria-describedby={areaInvalid ? areaErrorId : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${idPrefix}-max-area`} className="sr-only">
              {f.maxArea}
            </FieldLabel>
            <Input
              id={`${idPrefix}-max-area`}
              type="number"
              name="max_area"
              min={0}
              inputMode="numeric"
              placeholder={f.maxArea}
              value={maxArea}
              onChange={(event) => setMaxArea(event.target.value)}
              aria-invalid={areaInvalid || undefined}
              aria-describedby={areaInvalid ? areaErrorId : undefined}
            />
          </div>
        </div>
        {areaInvalid ? (
          <FieldError id={areaErrorId}>{f.rangeInvalid}</FieldError>
        ) : null}
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeCount = countActiveListingFilters(state);
  const action = localePath(locale, actionPath);
  const clearHref = localePath(locale, actionPath);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onDocumentKeyDown);
      trigger?.focus();
    };
  }, [open]);

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
    }
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="primary" className="min-h-11 min-w-[8rem]">
        {dict.listings.apply}
      </Button>
      <Link
        href={clearHref}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "min-h-11 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
        )}
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

  const valuesKey = [
    values?.q,
    values?.sort,
    values?.listing_type,
    values?.type,
    values?.city,
    values?.district,
    values?.project,
    values?.developer,
    values?.transit,
    values?.bedrooms,
    values?.min_price,
    values?.max_price,
    values?.min_area,
    values?.max_area,
  ].join("|");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <Button
          ref={triggerRef}
          type="button"
          variant="secondary"
          className="min-h-11 gap-2"
          aria-expanded={open}
          aria-controls="listing-filter-drawer"
          aria-haspopup="dialog"
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
            className="rounded-sm text-sm font-medium text-[var(--brand)] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
          >
            {dict.listings.clearAll}
          </Link>
        ) : null}
      </div>

      <form
        action={action}
        method="get"
        className="hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-4 lg:block"
        onSubmit={(event) => onFilterFormSubmit(locale, event)}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="ds-h3 text-lg">{dict.properties.filtersTitle}</h2>
          {activeCount > 0 ? (
            <span className="ds-caption text-stone-500">
              {dict.listings.activeFilters}: {activeCount}
            </span>
          ) : null}
        </div>
        <FilterFields key={`desk-${valuesKey}`} {...fieldProps} idPrefix="desk" />
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
          <div
            ref={panelRef}
            className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl"
            onKeyDown={onPanelKeyDown}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id={titleId} className="ds-h3 text-lg">
                {dict.properties.filtersTitle}
              </h2>
              <Button
                ref={closeRef}
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
            <form
              action={action}
              method="get"
              className="space-y-4 pb-6"
              onSubmit={(event) => onFilterFormSubmit(locale, event)}
            >
              <FilterFields
                key={`mobile-${valuesKey}`}
                {...fieldProps}
                idPrefix="mobile"
              />
              {actions}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
