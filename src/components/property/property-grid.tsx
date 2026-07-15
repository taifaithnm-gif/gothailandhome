import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { PropertyView } from "@/lib/data/properties";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/states";

type PropertyGridProps = {
  locale: Locale;
  dict: Dictionary;
  properties: PropertyView[];
  /** How many lead cards get image priority (default 3). */
  imagePriorityCount?: number;
};

export function PropertyGrid({
  locale,
  dict,
  properties,
  imagePriorityCount = 3,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return <EmptyState title={dict.common.noResults} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          locale={locale}
          dict={dict}
          property={property}
          imagePriority={index < imagePriorityCount}
        />
      ))}
    </div>
  );
}
