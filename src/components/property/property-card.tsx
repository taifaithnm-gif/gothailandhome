"use client";

import Link from "next/link";

import { CompareButton } from "@/components/compare/compare-button";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import { Badge, SourceBadge } from "@/components/ui/badge";
import { ListingCardShell } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath, propertyTypeLabel } from "@/lib/i18n/metadata";
import { formatPrice, type PropertyView } from "@/lib/property/property-view";
import {
  cardLocationLabel,
  cardMediaAlt,
  cardProjectLabel,
  cardTransitLabels,
  displayCardValue,
  formatCardArea,
  formatCardBedrooms,
  isSourcedPrice,
  sourcedText,
} from "@/lib/property/property-card-model";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  locale: Locale;
  dict: Dictionary;
  property: PropertyView;
  className?: string;
  imagePriority?: boolean;
};

function formatEvidenceDate(iso: string, locale: Locale) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const tag = locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-GB";
  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function PropertyCard({
  locale,
  dict,
  property,
  className,
  imagePriority = false,
}: PropertyCardProps) {
  const unknown = dict.property.unknown;
  const title =
    sourcedText(property.title[locale]) ||
    sourcedText(property.title.en) ||
    property.slug;
  const typeLabel = propertyTypeLabel(dict, property.type);
  const locationLabel = cardLocationLabel(
    property.districtName,
    property.location,
    locale,
  );
  const projectLabel = cardProjectLabel(
    property.projectSlug,
    property.projectName,
    locale,
  );
  const placeBits = [typeLabel, locationLabel].filter(Boolean);
  const detailHref = localePath(locale, `/properties/${property.slug}`);
  const mediaAlt = cardMediaAlt(title, typeLabel, locationLabel);
  const bedroomsLabel = formatCardBedrooms(
    property.bedrooms,
    dict.listings.studio,
    unknown,
  );
  const bathroomsLabel = displayCardValue(property.bathrooms, unknown);
  const areaLabel = formatCardArea(
    property.areaSqm,
    property.landAreaSqm,
    dict.common.sqm,
    unknown,
  );
  const transitLabels = cardTransitLabels(property.transitTags, {
    bts: dict.listings.bts,
    mrt: dict.listings.mrt,
  });
  const priceLabel = isSourcedPrice(property.priceThb)
    ? formatPrice(property.priceThb, locale, property.listingType)
    : unknown;
  const verifiedLabel = property.lastVerifiedAt
    ? dict.properties.lastVerified.replace(
        "{date}",
        formatEvidenceDate(property.lastVerifiedAt, locale),
      )
    : property.sourceUpdatedAt
      ? dict.properties.sourceUpdated.replace(
          "{date}",
          formatEvidenceDate(property.sourceUpdatedAt, locale),
        )
      : null;
  const listingTypeLabel =
    property.listingType === "rent" ? dict.common.rent : dict.common.sale;
  const viewLabel = `${dict.common.viewProperty}: ${title}`;
  const helpLabel = `${dict.properties.platformHelp}: ${title}`;

  return (
    <ListingCardShell className={cn("min-h-[26rem]", className)}>
      <div className="relative">
        <ListingMediaFrame
          locale={locale}
          dict={dict}
          title={title}
          alt={mediaAlt}
          propertyType={property.type}
          imageUrl={property.coverUrl}
          imageSource={property.source}
          priority={imagePriority}
          showSource={Boolean(property.coverUrl && property.source)}
        />
        {property.featured ? (
          <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-[var(--brand-deep)]">
            {dict.common.featured}
          </span>
        ) : null}
        <span className="absolute top-3 right-3 z-10 flex items-start gap-2">
          <CompareButton
            propertyId={property.id}
            propertySlug={property.slug}
            dict={dict}
            size="sm"
            className="shadow-sm"
          />
          <FavoriteButton
            propertyId={property.id}
            propertySlug={property.slug}
            dict={dict}
            size="sm"
            className="shadow-sm"
          />
          <span className="rounded-md bg-[var(--brand-deep)]/85 px-2 py-1 text-xs font-medium text-white">
            {listingTypeLabel}
          </span>
        </span>
        {property.source && !property.coverUrl ? (
          <span className="absolute bottom-3 left-3">
            <SourceBadge source={property.source} />
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex min-h-6 flex-wrap items-center gap-2">
            {property.isVerifiedListing ? (
              <Badge tone="verified">{dict.properties.verified}</Badge>
            ) : null}
            {property.source && property.coverUrl ? (
              <SourceBadge source={property.source} />
            ) : null}
          </div>

          {placeBits.length ? (
            <p className="text-xs tracking-wide text-[var(--brand)] uppercase">
              {placeBits.join(" · ")}
            </p>
          ) : null}

          {projectLabel ? (
            <p className="text-xs text-stone-500">
              {dict.properties.project}: {projectLabel}
            </p>
          ) : null}

          <h3 className="font-heading text-xl leading-snug text-[var(--brand-deep)]">
            <Link
              href={detailHref}
              className="rounded-sm outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
            >
              {title}
            </Link>
          </h3>

          {verifiedLabel ? (
            <p className="text-xs text-stone-500">{verifiedLabel}</p>
          ) : null}

          {transitLabels.length ? (
            <p className="text-xs text-stone-500">
              <span className="font-medium text-stone-600">
                {dict.property.transit}:
              </span>{" "}
              {transitLabels.join(" · ")}
            </p>
          ) : null}
        </div>

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--brand-line)] pt-4 text-xs text-stone-600">
          <div className="min-w-0">
            <dt>{dict.common.bedrooms}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[var(--brand-deep)]">
              {bedroomsLabel}
            </dd>
          </div>
          <div className="min-w-0">
            <dt>{dict.common.bathrooms}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[var(--brand-deep)]">
              {bathroomsLabel}
            </dd>
          </div>
          <div className="min-w-0">
            <dt>{dict.common.area}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[var(--brand-deep)]">
              {areaLabel}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-base font-semibold text-[var(--brand-deep)]">
            <span className="sr-only">{dict.common.price}: </span>
            {priceLabel}
          </p>
          <Link
            href={detailHref}
            className="inline-flex min-h-11 min-w-[5rem] items-center rounded-sm text-sm font-medium text-[var(--brand)] underline-offset-4 transition outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
            aria-label={viewLabel}
          >
            {dict.common.viewProperty}
          </Link>
        </div>

        <Link
          href={localePath(locale, "/contact")}
          className="rounded-sm text-xs font-medium text-stone-500 underline-offset-4 outline-none hover:text-[var(--brand)] hover:underline focus-visible:text-[var(--brand)] focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
          aria-label={helpLabel}
        >
          {dict.properties.platformHelp}
        </Link>
      </div>
    </ListingCardShell>
  );
}
