"use client";

import { Scale } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCompare } from "@/components/compare/compare-provider";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/config/locales";
import { trackCompareToggle } from "@/lib/analytics";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type CompareButtonProps = {
  propertyId?: string | null;
  propertySlug: string;
  dict: Dictionary;
  className?: string;
  size?: "sm" | "md";
};

export function CompareButton({
  propertyId,
  propertySlug,
  dict,
  className,
  size = "md",
}: CompareButtonProps) {
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")[1] ?? "en";
  const locale = isLocale(localeSegment) ? localeSegment : "en";
  const { hydrated, isSelected, toggle, isFull } = useCompare();
  const ref = {
    ...(propertyId ? { id: propertyId } : {}),
    slug: propertySlug,
  };
  const selected = hydrated ? isSelected(ref) : false;
  const blocked = hydrated && !selected && isFull;
  const label = selected ? dict.compare.remove : dict.compare.add;
  const announced = !hydrated
    ? dict.compare.loadingState
    : selected
      ? dict.compare.selectedState
      : blocked
        ? dict.compare.fullState
        : dict.compare.unselectedState;

  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "ghost"}
      size={size === "sm" ? "icon-sm" : "icon"}
      className={cn(
        "min-h-11 min-w-11 border border-[var(--brand-line)] bg-white/95 text-[var(--brand-deep)] shadow-sm hover:bg-white",
        selected && "border-[var(--brand)]/30 text-[var(--brand)]",
        className,
      )}
      aria-pressed={selected}
      aria-label={`${label}. ${announced}`}
      disabled={blocked}
      data-slot="compare-button"
      data-compare-state={
        hydrated ? (selected ? "selected" : blocked ? "full" : "unselected") : "pending"
      }
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!hydrated || blocked) return;
        const nextAction = selected ? "remove" : "add";
        toggle(ref);
        trackCompareToggle(locale, propertySlug, nextAction);
      }}
    >
      <Scale
        className={cn("size-4", selected && "text-[var(--brand)]")}
        aria-hidden
      />
      <span className="sr-only" aria-live="polite">
        {announced}
      </span>
    </Button>
  );
}
