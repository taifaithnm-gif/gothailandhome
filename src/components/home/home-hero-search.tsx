"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel, Input, Select } from "@/components/ui/field";
import type { Locale } from "@/config/locales";
import type { DistrictView } from "@/lib/data/geography";
import type { ProjectView } from "@/lib/data/projects";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type HomeHeroSearchProps = {
  locale: Locale;
  dict: Dictionary;
  districts: DistrictView[];
  projects: ProjectView[];
};

export function HomeHeroSearch({
  locale,
  dict,
  districts,
  projects,
}: HomeHeroSearchProps) {
  const h = dict.home;
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [query, setQuery] = useState("");

  const budgets =
    listingType === "sale"
      ? [
          { value: "3000000" },
          { value: "5000000" },
          { value: "8000000" },
          { value: "12000000" },
          { value: "20000000" },
        ]
      : [
          { value: "15000" },
          { value: "25000" },
          { value: "40000" },
          { value: "60000" },
          { value: "100000" },
        ];

  const amountLocale =
    locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-US";

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div
        className="inline-flex rounded-xl border border-white/25 bg-black/15 p-1"
        role="group"
        aria-label={h.buyRentSwitch}
      >
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/70",
            listingType === "sale"
              ? "bg-white text-[var(--brand-deep)]"
              : "text-white/85 hover:bg-white/10",
          )}
          aria-pressed={listingType === "sale"}
          onClick={() => setListingType("sale")}
        >
          {dict.common.sale}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/70",
            listingType === "rent"
              ? "bg-white text-[var(--brand-deep)]"
              : "text-white/85 hover:bg-white/10",
          )}
          aria-pressed={listingType === "rent"}
          onClick={() => setListingType("rent")}
        >
          {dict.common.rent}
        </button>
      </div>

      <form
        action={localePath(locale, "/properties")}
        method="get"
        className="grid gap-3 rounded-2xl border border-white/20 bg-white/95 p-4 text-[var(--brand-deep)] shadow-lg backdrop-blur sm:grid-cols-2 lg:grid-cols-3"
      >
        <input type="hidden" name="listing_type" value={listingType} />
        <input type="hidden" name="city" value="bangkok" />

        <Field className="sm:col-span-2 lg:col-span-3">
          <FieldLabel htmlFor="home-q">{dict.search.queryLabel}</FieldLabel>
          <Input
            id="home-q"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={h.searchPlaceholder}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="home-district">{dict.listings.district}</FieldLabel>
          <Select id="home-district" name="district" defaultValue="">
            <option value="">{dict.listings.all}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name[locale]}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="home-project">{h.project}</FieldLabel>
          <Select id="home-project" name="project" defaultValue="">
            <option value="">{dict.listings.all}</option>
            {projects.slice(0, 40).map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name[locale] || p.name.en}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="home-transit">{h.transit}</FieldLabel>
          <Select id="home-transit" name="transit" defaultValue="">
            <option value="">{dict.listings.all}</option>
            <option value="bts">{dict.listings.bts}</option>
            <option value="mrt">{dict.listings.mrt}</option>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="home-type">{dict.common.type}</FieldLabel>
          <Select id="home-type" name="type" defaultValue="all">
            <option value="all">{dict.common.allTypes}</option>
            <option value="condo">{dict.common.condo}</option>
            <option value="house">{dict.common.house}</option>
            <option value="villa">{dict.common.villa}</option>
            <option value="land">{dict.common.land}</option>
            <option value="commercial">{dict.common.commercial}</option>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="home-budget">{h.budget}</FieldLabel>
          <Select id="home-budget" name="max_price" defaultValue="">
            <option value="">{h.budgetAny}</option>
            {budgets.map((b) => (
              <option key={b.value} value={b.value}>
                {(listingType === "sale"
                  ? h.budgetSaleUpTo
                  : h.budgetRentUpTo
                ).replace(
                  "{amount}",
                  Number(b.value).toLocaleString(amountLocale),
                )}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" variant="primary" className="min-h-11 w-full">
            {dict.search.submit}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={localePath(locale, "/find-my-home")}
          data-home-cta="find-my-home"
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "bg-[var(--brand-gold)] text-[var(--brand-deep)] hover:bg-[color-mix(in_srgb,var(--brand-gold),white_12%)]",
          )}
        >
          {dict.nav.findMyHome}
        </Link>
        <Link
          href={localePath(locale, "/list-your-property")}
          data-home-cta="list-property"
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white",
          )}
        >
          {dict.nav.listProperty}
        </Link>
        <Link
          href={localePath(locale, "/buy")}
          data-home-cta="buy-hero"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "text-white hover:bg-white/10 hover:text-white",
          )}
        >
          {dict.nav.buy}
        </Link>
        <Link
          href={localePath(locale, "/rent")}
          data-home-cta="rent-hero"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "text-white hover:bg-white/10 hover:text-white",
          )}
        >
          {dict.nav.rent}
        </Link>
      </div>
    </div>
  );
}
