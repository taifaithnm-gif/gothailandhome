"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { resolveCompareProperties } from "@/app/[lang]/compare/actions";
import { CompareButton } from "@/components/compare/compare-button";
import { useCompare } from "@/components/compare/compare-provider";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import type { Locale } from "@/config/locales";
import { COMPARE_MIN_ITEMS, listCompareSlugs } from "@/lib/compare";
import {
  isApprovedCompareField,
  type CompareApprovedField,
} from "@/lib/compare/fields";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath, propertyTypeLabel } from "@/lib/i18n/metadata";
import {
  cardLocationLabel,
  cardProjectLabel,
  cardTransitLabels,
  displayCardValue,
  formatCardArea,
  formatCardBedrooms,
  isSourcedPrice,
  sourcedText,
} from "@/lib/property/property-card-model";
import { formatPrice, type PropertyView } from "@/lib/property/property-view";
import { cn } from "@/lib/utils";

type CompareViewProps = {
  locale: Locale;
  dict: Dictionary;
};

type CompareRowDef = {
  field: CompareApprovedField;
  label: string;
  render: (property: PropertyView) => string;
};

function formatEvidenceDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const tag = locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-GB";
  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function CompareView({ locale, dict }: CompareViewProps) {
  const { state, hydrated, pruneToSlugs, remove, clear } = useCompare();
  const [properties, setProperties] = useState<PropertyView[]>([]);
  const [missingSlugs, setMissingSlugs] = useState<string[]>([]);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const slugs = useMemo(() => listCompareSlugs(state), [state]);
  const slugKey = slugs.join("|");
  const resolved = resolvedKey === slugKey;

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    void (async () => {
      const result = await resolveCompareProperties(slugs);
      if (cancelled) return;
      setProperties(result.properties);
      setMissingSlugs(result.missingSlugs);
      setResolvedKey(slugKey);
      if (result.missingSlugs.length) {
        pruneToSlugs(result.properties.map((property) => property.slug));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, slugKey, pruneToSlugs, slugs]);

  const unknown = dict.property.unknown;

  const rows = useMemo<CompareRowDef[]>(() => {
    const defs: CompareRowDef[] = [
      {
        field: "listingType",
        label: dict.common.type,
        render: (property) =>
          property.listingType === "rent"
            ? dict.common.rent
            : dict.common.sale,
      },
      {
        field: "type",
        label: dict.compare.propertyType,
        render: (property) => propertyTypeLabel(dict, property.type),
      },
      {
        field: "priceThb",
        label: dict.common.price,
        render: (property) =>
          isSourcedPrice(property.priceThb)
            ? formatPrice(property.priceThb, locale, property.listingType)
            : unknown,
      },
      {
        field: "bedrooms",
        label: dict.common.bedrooms,
        render: (property) =>
          formatCardBedrooms(property.bedrooms, dict.listings.studio, unknown),
      },
      {
        field: "bathrooms",
        label: dict.common.bathrooms,
        render: (property) => displayCardValue(property.bathrooms, unknown),
      },
      {
        field: "areaSqm",
        label: dict.common.area,
        render: (property) =>
          formatCardArea(
            property.areaSqm,
            property.landAreaSqm,
            dict.common.sqm,
            unknown,
          ),
      },
      {
        field: "districtName",
        label: dict.property.district,
        render: (property) =>
          cardLocationLabel(property.districtName, property.location, locale) ??
          unknown,
      },
      {
        field: "location",
        label: dict.common.location,
        render: (property) =>
          sourcedText(property.location[locale]) ??
          sourcedText(property.location.en) ??
          unknown,
      },
      {
        field: "projectName",
        label: dict.properties.project,
        render: (property) =>
          cardProjectLabel(property.projectSlug, property.projectName, locale) ??
          unknown,
      },
      {
        field: "transitTags",
        label: dict.property.transit,
        render: (property) => {
          const labels = cardTransitLabels(property.transitTags, {
            bts: dict.listings.bts,
            mrt: dict.listings.mrt,
          });
          return labels.length ? labels.join(" · ") : unknown;
        },
      },
      {
        field: "isVerifiedListing",
        label: dict.property.verified,
        render: (property) =>
          property.isVerifiedListing
            ? dict.compare.yes
            : dict.compare.no,
      },
      {
        field: "lastVerifiedAt",
        label: dict.compare.lastVerified,
        render: (property) =>
          formatEvidenceDate(property.lastVerifiedAt, locale) ?? unknown,
      },
    ];
    // Only approved allowlist fields may render (G-PRODUCT-COMPARE).
    return defs.filter((row) => isApprovedCompareField(row.field));
  }, [dict, locale, unknown]);

  if (!hydrated) {
    return <LoadingState label={dict.compare.loading} />;
  }

  const nothingSelected =
    !slugs.length && !properties.length && !missingSlugs.length;

  if (nothingSelected) {
    return (
      <div className="space-y-4">
        <EmptyState
          title={dict.compare.emptyTitle}
          description={dict.compare.emptyBody}
          action={
            <Link
              href={localePath(locale, "/properties")}
              className={buttonVariants({ variant: "primary" })}
            >
              {dict.compare.browseListings}
            </Link>
          }
        />
        <p className="text-xs text-stone-500">{dict.compare.retentionNote}</p>
      </div>
    );
  }

  if (slugs.length > 0 && !resolved) {
    return <LoadingState label={dict.compare.loading} />;
  }

  const canCompare = properties.length >= COMPARE_MIN_ITEMS;

  return (
    <div className="space-y-8" data-slot="compare-view">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">{dict.compare.retentionNote}</p>
        {properties.length ? (
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "min-h-11",
            )}
            onClick={() => clear()}
          >
            {dict.compare.clearAll}
          </button>
        ) : null}
      </div>

      {canCompare ? (
        <div
          className="overflow-x-auto rounded-[var(--card-radius)] border border-[var(--brand-line)]"
          data-slot="compare-table-scroll"
        >
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">{dict.compare.tableCaption}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-40 border-b border-[var(--brand-line)] bg-[var(--brand-soft)] p-4 align-bottom text-xs font-medium tracking-wide text-[var(--brand)] uppercase"
                >
                  {dict.compare.fieldColumn}
                </th>
                {properties.map((property) => {
                  const title =
                    sourcedText(property.title[locale]) ||
                    sourcedText(property.title.en) ||
                    property.slug;
                  return (
                    <th
                      key={property.id}
                      scope="col"
                      className="min-w-52 border-b border-[var(--brand-line)] bg-[var(--brand-soft)] p-4 align-top"
                    >
                      <div className="space-y-2">
                        <Link
                          href={localePath(
                            locale,
                            `/properties/${property.slug}`,
                          )}
                          className="font-heading block text-base leading-snug text-[var(--brand-deep)] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                        >
                          {title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                          <CompareButton
                            propertyId={property.id}
                            propertySlug={property.slug}
                            dict={dict}
                            size="sm"
                          />
                          <button
                            type="button"
                            className={cn(
                              buttonVariants({
                                variant: "secondary",
                                size: "sm",
                              }),
                              "min-h-11",
                            )}
                            onClick={() =>
                              remove({ id: property.id, slug: property.slug })
                            }
                          >
                            {dict.compare.remove}
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.field} className="even:bg-white/60">
                  <th
                    scope="row"
                    className="border-t border-[var(--brand-line)] p-4 align-top text-xs font-medium tracking-wide text-stone-500 uppercase"
                  >
                    {row.label}
                  </th>
                  {properties.map((property) => (
                    <td
                      key={property.id}
                      className="border-t border-[var(--brand-line)] p-4 align-top text-sm text-[var(--brand-deep)]"
                    >
                      {row.render(property)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <SurfaceCard className="space-y-3 p-5!">
          <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
            {dict.compare.needMoreTitle}
          </h2>
          <p className="text-sm text-stone-600">
            {dict.compare.needMoreBody.replace(
              "{min}",
              String(COMPARE_MIN_ITEMS),
            )}
          </p>
          {properties.length ? (
            <ul className="space-y-2">
              {properties.map((property) => {
                const title =
                  sourcedText(property.title[locale]) ||
                  sourcedText(property.title.en) ||
                  property.slug;
                return (
                  <li
                    key={property.id}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <Link
                      href={localePath(locale, `/properties/${property.slug}`)}
                      className="text-sm text-[var(--brand-deep)] underline-offset-4 hover:underline"
                    >
                      {title}
                    </Link>
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                        "min-h-11",
                      )}
                      onClick={() =>
                        remove({ id: property.id, slug: property.slug })
                      }
                    >
                      {dict.compare.remove}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <Link
            href={localePath(locale, "/properties")}
            className={buttonVariants({ variant: "primary" })}
          >
            {dict.compare.browseListings}
          </Link>
        </SurfaceCard>
      )}

      {missingSlugs.length ? (
        <section
          aria-labelledby="compare-unavailable-heading"
          className="space-y-3"
        >
          <h2
            id="compare-unavailable-heading"
            className="ds-h3 text-xl text-[var(--brand-deep)]"
          >
            {dict.compare.unavailableTitle}
          </h2>
          <p className="text-sm text-stone-600">
            {dict.compare.unavailableBody}
          </p>
          <ul className="space-y-2">
            {missingSlugs.map((slug) => (
              <li key={slug}>
                <SurfaceCard className="flex flex-wrap items-center justify-between gap-3 p-4!">
                  <p className="text-sm text-stone-700">
                    {dict.compare.unavailableItem.replace("{slug}", slug)}
                  </p>
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "min-h-11",
                    )}
                    onClick={() => remove({ slug })}
                  >
                    {dict.compare.remove}
                  </button>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
