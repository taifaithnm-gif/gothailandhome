import Link from "next/link";

import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import { SourceBadge } from "@/components/ui/badge";
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

export function PropertyCard({
  locale,
  dict,
  property,
  className,
  imagePriority = false,
}: PropertyCardProps) {
  return (
    <ListingCardShell className={cn(className)}>
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
          <p className="text-xs tracking-wide text-[var(--brand)] uppercase">
            {propertyTypeLabel(dict, property.type)} ·{" "}
            {property.location[locale]}
          </p>
          <h3 className="font-heading text-xl leading-snug text-[var(--brand-deep)]">
            {property.title[locale]}
          </h3>
          <p className="text-sm leading-relaxed text-stone-600">
            {property.summary[locale]}
          </p>
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
            className="text-sm font-medium text-[var(--brand)] underline-offset-4 transition hover:underline"
          >
            {dict.common.viewProperty}
          </Link>
        </div>
      </div>
    </ListingCardShell>
  );
}
