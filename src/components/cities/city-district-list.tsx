"use client";

import { useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DistrictListItem = {
  id: string;
  slug: string;
  name: string;
  href: string;
};

type CityDistrictListProps = {
  districts: DistrictListItem[];
  emptyLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
  /** Initial visible count before expand. */
  initialCount?: number;
};

/**
 * Cap initial district link rendering; expand in-place (same data, no fetch).
 */
export function CityDistrictList({
  districts,
  emptyLabel,
  showMoreLabel,
  showLessLabel,
  initialCount = 12,
}: CityDistrictListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? districts
    : districts.slice(0, initialCount);
  const hasMore = districts.length > initialCount;

  return (
    <div className="space-y-4" data-slot="city-district-list">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((district) => (
          <li key={district.id}>
            <Link
              href={district.href}
              className="block rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 hover:border-[var(--brand)]"
              data-slot="city-district-link"
            >
              {district.name}
            </Link>
          </li>
        ))}
        {!districts.length ? (
          <li className="text-sm text-stone-500">{emptyLabel}</li>
        ) : null}
      </ul>
      {hasMore ? (
        <button
          type="button"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          onClick={() => setExpanded((v) => !v)}
          data-slot="city-district-toggle"
          aria-expanded={expanded}
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
      <p className="sr-only" data-slot="city-district-count">
        {visible.length}/{districts.length}
      </p>
    </div>
  );
}
