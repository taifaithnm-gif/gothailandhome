import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import {
  getMarketplaceEntries,
  type MarketplaceEntryId,
} from "@/lib/marketplace/entry-paths";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  dict: Dictionary;
  /** Highlight a specific entry (e.g. on the hub). */
  highlightId?: MarketplaceEntryId;
  className?: string;
};

export function MarketplaceEntryGrid({
  locale,
  dict,
  highlightId,
  className,
}: Props) {
  const entries = getMarketplaceEntries(dict);

  return (
    <div
      data-slot="marketplace-entry-grid"
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {entries.map((item) => {
        const highlighted = highlightId === item.id;
        return (
          <Link
            key={item.id}
            href={localePath(locale, item.href)}
            className={cn(
              "flex h-full flex-col rounded-[var(--card-radius)] border bg-white p-5 transition",
              highlighted
                ? "border-[var(--brand)] shadow-[var(--shadow-soft)]"
                : "border-[var(--brand-line)] hover:border-[var(--brand)]",
            )}
          >
            <p className="ds-caption text-[var(--brand)]">{item.role}</p>
            <h3 className="mt-1 font-heading text-lg text-[var(--brand-deep)]">
              {item.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
              {item.body}
            </p>
            <span className="mt-4 text-sm font-medium text-[var(--brand)]">
              {item.cta} →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
