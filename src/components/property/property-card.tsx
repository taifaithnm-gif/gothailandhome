import Link from "next/link";

import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import { Badge, SourceBadge } from "@/components/ui/badge";
import { ListingCardShell } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import { formatPrice, type PropertyView } from "@/lib/data/properties";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath, propertyTypeLabel } from "@/lib/i18n/metadata";
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
  const projectLabel = property.projectName[locale] || property.projectName.en;
  const districtLabel =
    property.districtName[locale] || property.districtName.en;
  const placeBits = [
    propertyTypeLabel(dict, property.type),
    districtLabel || property.location[locale],
  ].filter(Boolean);

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

  return (
    <ListingCardShell className={cn("min-h-[26rem]", className)}>
      <div className="relative">
        <ListingMediaFrame
          locale={locale}
          dict={dict}
          title={property.title[locale]}
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
        <span className="absolute top-3 right-3 rounded-md bg-[var(--brand-deep)]/85 px-2 py-1 text-xs font-medium text-white">
          {property.listingType === "rent"
            ? dict.common.rent
            : dict.common.sale}
        </span>
        {property.source && !property.coverUrl ? (
          <span className="absolute bottom-3 left-3">
            <SourceBadge source={property.source} />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex min-h-6 flex-wrap items-center gap-2">
            {property.isVerifiedListing ? (
              <Badge tone="verified">{dict.properties.verified}</Badge>
            ) : null}
            {property.source && property.coverUrl ? (
              <SourceBadge source={property.source} />
            ) : null}
          </div>
          <p className="text-xs tracking-wide text-[var(--brand)] uppercase">
            {placeBits.join(" · ")}
          </p>
          {projectLabel ? (
            <p className="text-xs text-stone-500">
              {dict.properties.project}: {projectLabel}
            </p>
          ) : null}
          <h3 className="font-heading text-xl leading-snug text-[var(--brand-deep)]">
            {property.title[locale]}
          </h3>
          {verifiedLabel ? (
            <p className="text-xs text-stone-500">{verifiedLabel}</p>
          ) : null}
        </div>

        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--brand-line)] pt-4 text-xs text-stone-600">
          <div>
            <dt>{dict.common.bedrooms}</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {property.bedrooms ?? "—"}
            </dd>
          </div>
          <div>
            <dt>{dict.common.bathrooms}</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {property.bathrooms ?? "—"}
            </dd>
          </div>
          <div>
            <dt>{dict.common.area}</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {property.areaSqm != null
                ? `${property.areaSqm} ${dict.common.sqm}`
                : property.landAreaSqm != null
                  ? `${property.landAreaSqm} ${dict.common.sqm}`
                  : "—"}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-[var(--brand-deep)]">
            {formatPrice(property.priceThb, locale, property.listingType)}
          </p>
          <Link
            href={localePath(locale, `/properties/${property.slug}`)}
            className="min-h-11 min-w-[5rem] rounded-sm text-sm font-medium text-[var(--brand)] underline-offset-4 transition outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
            aria-label={`${dict.common.viewProperty}: ${property.title[locale]}`}
          >
            {dict.common.viewProperty}
          </Link>
        </div>

        <Link
          href={localePath(locale, "/contact")}
          className="rounded-sm text-xs font-medium text-stone-500 underline-offset-4 outline-none hover:text-[var(--brand)] hover:underline focus-visible:text-[var(--brand)] focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
        >
          {dict.properties.platformHelp}
        </Link>
      </div>
    </ListingCardShell>
  );
}
