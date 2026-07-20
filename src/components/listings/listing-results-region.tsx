"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListingResultsRegionProps = {
  children: ReactNode;
  headingId: string;
  className?: string;
};

/**
 * Stable results landmark. Pagination links target #listing-results so focus
 * moves predictably after page changes.
 */
export function ListingResultsRegion({
  children,
  headingId,
  className,
}: ListingResultsRegionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.location.hash !== "#listing-results") return;
    ref.current?.focus({ preventScroll: false });
  }, []);

  return (
    <section
      id="listing-results"
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 outline-none", className)}
    >
      {children}
    </section>
  );
}
