import { redirect } from "next/navigation";

import { isLocale } from "@/config/locales";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildListingSearchHref,
  parseListingSearchParams,
} from "@/lib/search/listing-search-state";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.searchTitle,
    description: dict.meta.searchDescription,
    path: "/search",
    robots: {
      index: false,
      follow: true,
    },
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Canonical results live on `/properties`. `/search` preserves bookmarks by
 * redirecting into the shared URL search state model.
 */
export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[lang]/search"> & { searchParams: SearchParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    redirect("/en/properties");
  }

  const query = await searchParams;
  const state = parseListingSearchParams(query);
  const href = buildListingSearchHref(localePath(lang, "/properties"), state);
  redirect(href);
}
