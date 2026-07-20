"use client";

import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";

import { useFavorites } from "@/components/favorites/favorites-provider";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/config/locales";
import { trackFavoriteToggle } from "@/lib/analytics";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  propertyId?: string | null;
  propertySlug: string;
  dict: Dictionary;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({
  propertyId,
  propertySlug,
  dict,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")[1] ?? "en";
  const locale = isLocale(localeSegment) ? localeSegment : "en";
  const { hydrated, isSaved, toggle } = useFavorites();
  const ref = {
    ...(propertyId ? { id: propertyId } : {}),
    slug: propertySlug,
  };
  const saved = hydrated ? isSaved(ref) : false;
  const label = saved ? dict.favorites.remove : dict.favorites.save;
  const announced = hydrated
    ? saved
      ? dict.favorites.savedState
      : dict.favorites.unsavedState
    : dict.favorites.loadingState;

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "ghost"}
      size={size === "sm" ? "icon-sm" : "icon"}
      className={cn(
        "min-h-11 min-w-11 border border-[var(--brand-line)] bg-white/95 text-[var(--brand-deep)] shadow-sm hover:bg-white",
        saved && "border-[var(--brand)]/30 text-[var(--brand)]",
        className,
      )}
      aria-pressed={saved}
      aria-label={`${label}. ${announced}`}
      data-slot="favorite-button"
      data-favorite-state={hydrated ? (saved ? "saved" : "unsaved") : "pending"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!hydrated) return;
        const nextAction = saved ? "remove" : "add";
        toggle(ref);
        trackFavoriteToggle(locale, propertySlug, nextAction);
      }}
    >
      <Heart
        className={cn("size-4", saved && "fill-current")}
        aria-hidden="true"
      />
      <span className="sr-only" aria-live="polite">
        {announced}
      </span>
    </Button>
  );
}
