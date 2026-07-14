import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath, propertyTypeLabel } from "@/lib/i18n/metadata";
import { formatPrice, type Property } from "@/lib/properties";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  locale: Locale;
  dict: Dictionary;
  property: Property;
  className?: string;
};

export function PropertyCard({
  locale,
  dict,
  property,
  className,
}: PropertyCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white shadow-[0_1px_0_rgba(6,61,56,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(6,61,56,0.10)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#0a5c54_0%,#147a6f_45%,#c9a227_160%)]">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_10%,#e8b84a_0,transparent_35%)]" />
        {property.featured ? (
          <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-[var(--brand-deep)]">
            {dict.common.featured}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs tracking-wide text-[var(--brand)] uppercase">
            {propertyTypeLabel(dict, property.type)} · {property.location[locale]}
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
              {property.bedrooms}
            </dd>
          </div>
          <div>
            <dt>{dict.common.bathrooms}</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {property.bathrooms}
            </dd>
          </div>
          <div>
            <dt>{dict.common.area}</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {property.areaSqm} {dict.common.sqm}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-semibold text-[var(--brand-deep)]">
            {formatPrice(property.priceThb, locale)}
          </p>
          <Link
            href={localePath(locale, `/properties/${property.id}`)}
            className="text-sm font-medium text-[var(--brand)] underline-offset-4 transition hover:underline"
          >
            {dict.common.viewProperty}
          </Link>
        </div>
      </div>
    </article>
  );
}
