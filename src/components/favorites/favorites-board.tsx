"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { resolveFavoriteProperties } from "@/app/[lang]/favorites/actions";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { PropertyCard } from "@/components/property/property-card";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import type { Locale } from "@/config/locales";
import { listFavoriteSlugs } from "@/lib/favorites";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import type { PropertyView } from "@/lib/property/property-view";
import { cn } from "@/lib/utils";

type FavoritesBoardProps = {
  locale: Locale;
  dict: Dictionary;
};

export function FavoritesBoard({ locale, dict }: FavoritesBoardProps) {
  const { state, hydrated, pruneToSlugs, remove } = useFavorites();
  const [properties, setProperties] = useState<PropertyView[]>([]);
  const [missingSlugs, setMissingSlugs] = useState<string[]>([]);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const slugs = useMemo(() => listFavoriteSlugs(state), [state]);
  const slugKey = slugs.join("|");
  const resolved = resolvedKey === slugKey;

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    void (async () => {
      const result = await resolveFavoriteProperties(slugs);
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

  if (!hydrated) {
    return <LoadingState label={dict.favorites.loading} />;
  }

  if (!slugs.length && !properties.length && !missingSlugs.length) {
    return (
      <div className="space-y-4">
        <EmptyState
          title={dict.favorites.emptyTitle}
          description={dict.favorites.emptyBody}
          action={
            <Link
              href={localePath(locale, "/properties")}
              className={buttonVariants({ variant: "primary" })}
            >
              {dict.favorites.browseListings}
            </Link>
          }
        />
        <p className="text-xs text-stone-500">{dict.favorites.retentionNote}</p>
      </div>
    );
  }

  if (slugs.length > 0 && !resolved) {
    return <LoadingState label={dict.favorites.loading} />;
  }

  return (
    <div className="space-y-8" data-slot="favorites-board">
      <p className="text-sm text-stone-600">{dict.favorites.retentionNote}</p>

      {properties.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <li key={property.id} className="relative">
              <PropertyCard locale={locale} dict={dict} property={property} />
            </li>
          ))}
        </ul>
      ) : null}

      {missingSlugs.length ? (
        <section
          aria-labelledby="favorites-unavailable-heading"
          className="space-y-3"
        >
          <h2
            id="favorites-unavailable-heading"
            className="ds-h3 text-xl text-[var(--brand-deep)]"
          >
            {dict.favorites.unavailableTitle}
          </h2>
          <p className="text-sm text-stone-600">
            {dict.favorites.unavailableBody}
          </p>
          <ul className="space-y-2">
            {missingSlugs.map((slug) => (
              <li key={slug}>
                <SurfaceCard className="flex flex-wrap items-center justify-between gap-3 p-4!">
                  <p className="text-sm text-stone-700">
                    {dict.favorites.unavailableItem.replace("{slug}", slug)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <FavoriteButton
                      propertySlug={slug}
                      dict={dict}
                      size="sm"
                    />
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                        "min-h-11",
                      )}
                      onClick={() => remove({ slug })}
                    >
                      {dict.favorites.remove}
                    </button>
                  </div>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!properties.length && !missingSlugs.length ? (
        <EmptyState
          title={dict.favorites.emptyTitle}
          description={dict.favorites.emptyBody}
          action={
            <Link
              href={localePath(locale, "/properties")}
              className={buttonVariants({ variant: "primary" })}
            >
              {dict.favorites.browseListings}
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
