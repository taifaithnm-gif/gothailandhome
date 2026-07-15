import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { PropertyView } from "@/lib/data/properties";
import { PropertyCard } from "@/components/property/property-card";

type PropertyGridProps = {
  locale: Locale;
  dict: Dictionary;
  properties: PropertyView[];
};

export function PropertyGrid({ locale, dict, properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--brand-line)] bg-white/70 px-6 py-12 text-center text-stone-600">
        {dict.common.noResults}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          locale={locale}
          dict={dict}
          property={property}
          imagePriority={index < 3}
        />
      ))}
    </div>
  );
}
