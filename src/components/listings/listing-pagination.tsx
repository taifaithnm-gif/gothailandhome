import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

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
};

function hrefFor(
  locale: Locale,
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return `${localePath(locale, basePath)}${qs ? `?${qs}` : ""}`;
}

export function ListingPagination({
  locale,
  dict,
  basePath,
  page,
  totalPages,
  total,
  pageSize,
  params,
}: ListingPaginationProps) {
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

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-stone-500">
        {(dict.search.pageSummary || "{from}–{to} of {total}")
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(total))}
      </p>
      <div className="flex items-center gap-3 text-sm">
        {prev ? (
          <Link
            href={hrefFor(locale, basePath, params, prev)}
            className="font-medium text-[var(--brand)] underline-offset-4 hover:underline"
            rel="prev"
          >
            {dict.search.prevPage || "Previous"}
          </Link>
        ) : (
          <span className="text-stone-400">{dict.search.prevPage || "Previous"}</span>
        )}
        <span className="text-stone-600">
          {(dict.search.pageOf || "Page {page} of {totalPages}")
            .replace("{page}", String(page))
            .replace("{totalPages}", String(totalPages))}
        </span>
        {next ? (
          <Link
            href={hrefFor(locale, basePath, params, next)}
            className="font-medium text-[var(--brand)] underline-offset-4 hover:underline"
            rel="next"
          >
            {dict.search.nextPage || "Next"}
          </Link>
        ) : (
          <span className="text-stone-400">{dict.search.nextPage || "Next"}</span>
        )}
      </div>
    </nav>
  );
}
