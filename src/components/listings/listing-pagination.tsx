import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import {
  buildListingPaginationHref,
  LISTING_RESULTS_HASH,
} from "@/lib/search/listing-pagination-href";

export { buildListingPaginationHref, LISTING_RESULTS_HASH };

type ListingPaginationProps = {
  locale: Locale;
  dict: Dictionary;
  basePath: "/properties" | "/search";
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  /** Current query string params excluding `page`. */
  params: Record<string, string | undefined>;
  /** Focus target after pagination navigation. */
  resultsHash?: string;
};

export function ListingPagination({
  locale,
  dict,
  basePath,
  page,
  totalPages,
  total,
  pageSize,
  params,
  resultsHash = LISTING_RESULTS_HASH,
}: ListingPaginationProps) {
  if (total === 0 || totalPages <= 0) {
    return null;
  }

  if (totalPages <= 1) {
    return (
      <p className="text-sm text-stone-500">
        {dict.search.showing.replace("{count}", String(total))}
      </p>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const linkClass =
    "rounded-sm font-medium text-[var(--brand)] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35";

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label={dict.search.paginationLabel}
    >
      <p className="text-sm text-stone-500">
        {dict.search.pageSummary
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(total))}
      </p>
      <div className="flex items-center gap-3 text-sm">
        {prev ? (
          <Link
            href={buildListingPaginationHref(
              locale,
              basePath,
              params,
              prev,
              resultsHash,
            )}
            className={linkClass}
            rel="prev"
          >
            {dict.search.prevPage}
          </Link>
        ) : (
          <span className="text-stone-400">{dict.search.prevPage}</span>
        )}
        <span className="text-stone-600" aria-current="page">
          {dict.search.pageOf
            .replace("{page}", String(page))
            .replace("{totalPages}", String(totalPages))}
        </span>
        {next ? (
          <Link
            href={buildListingPaginationHref(
              locale,
              basePath,
              params,
              next,
              resultsHash,
            )}
            className={linkClass}
            rel="next"
          >
            {dict.search.nextPage}
          </Link>
        ) : (
          <span className="text-stone-400">{dict.search.nextPage}</span>
        )}
      </div>
    </nav>
  );
}
