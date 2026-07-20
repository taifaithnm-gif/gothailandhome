import { isLocale, type Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

export type SiteNavLink = {
  id: string;
  href: string;
  label: string;
};

export type SiteNavGroupId = "browse" | "marketplace" | "company";

export type SiteNavGroup = {
  id: SiteNavGroupId;
  label: string;
  links: SiteNavLink[];
};

/**
 * Phase 1 site navigation IA — single source for header desktop/mobile groups.
 * Footer explore/company columns are derived from the same groups.
 */
export function getSiteNavGroups(
  locale: Locale,
  dict: Dictionary,
): SiteNavGroup[] {
  return [
    {
      id: "browse",
      label: dict.nav.sectionBrowse,
      links: [
        { id: "home", href: localePath(locale), label: dict.nav.home },
        { id: "buy", href: localePath(locale, "/buy"), label: dict.nav.buy },
        { id: "rent", href: localePath(locale, "/rent"), label: dict.nav.rent },
        {
          id: "properties",
          href: localePath(locale, "/properties"),
          label: dict.nav.properties,
        },
        {
          id: "favorites",
          href: localePath(locale, "/favorites"),
          label: dict.nav.favorites,
        },
        {
          id: "compare",
          href: localePath(locale, "/compare"),
          label: dict.nav.compare,
        },
        {
          id: "projects",
          href: localePath(locale, "/projects"),
          label: dict.nav.projects,
        },
        {
          id: "cities",
          href: localePath(locale, "/cities"),
          label: dict.nav.cities,
        },
        {
          id: "developers",
          href: localePath(locale, "/developers"),
          label: dict.nav.developers,
        },
      ],
    },
    {
      id: "marketplace",
      label: dict.nav.sectionMarketplace,
      // Hub-first: Find My Home / List Property / partnerships live on the hub
      // cards — not as peer chrome links (P1-21).
      links: [
        {
          id: "marketplace",
          href: localePath(locale, "/marketplace"),
          label: dict.nav.marketplace,
        },
      ],
    },
    {
      id: "company",
      label: dict.nav.sectionCompany,
      links: [
        {
          id: "knowledge",
          href: localePath(locale, "/knowledge"),
          label: dict.nav.knowledge,
        },
        {
          id: "faq",
          href: localePath(locale, "/faq"),
          label: dict.faqHub.title,
        },
        {
          id: "blog",
          href: localePath(locale, "/blog"),
          label: dict.blog.title,
        },
        {
          id: "about",
          href: localePath(locale, "/about"),
          label: dict.nav.about,
        },
        {
          // Partners catalog is the marketplace hub (developer + agency cards).
          id: "partners",
          href: localePath(locale, "/marketplace"),
          label: dict.nav.partners,
        },
        {
          id: "contact",
          href: localePath(locale, "/contact"),
          label: dict.nav.contact,
        },
      ],
    },
  ];
}

/** Footer explore column: browse (minus home) + marketplace group. */
export function getFooterExploreLinks(
  locale: Locale,
  dict: Dictionary,
): SiteNavLink[] {
  const groups = getSiteNavGroups(locale, dict);
  const browse = groups.find((group) => group.id === "browse");
  const marketplace = groups.find((group) => group.id === "marketplace");
  return [
    ...(browse?.links.filter((link) => link.id !== "home") ?? []),
    ...(marketplace?.links ?? []),
  ];
}

/** Footer company column: same membership as header company group. */
export function getFooterCompanyLinks(
  locale: Locale,
  dict: Dictionary,
): SiteNavLink[] {
  return (
    getSiteNavGroups(locale, dict).find((group) => group.id === "company")
      ?.links ?? []
  );
}

/**
 * Active-state matching: home is exact; other links match self or nested paths
 * without prefix collisions (e.g. /properties vs /properties-extra).
 */
export function isNavLinkActive(
  pathname: string,
  href: string,
  homeHref: string,
): boolean {
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const normalizedHref =
    href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;

  if (normalizedHref === homeHref) {
    return normalizedPath === homeHref;
  }
  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

/** Replace the locale segment of a localized pathname. */
export function swapLocalePathname(
  pathname: string,
  nextLocale: Locale,
): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }
  return localePath(nextLocale);
}

/**
 * Locale switch href that preserves the current path and query string.
 * `search` may be `a=1&b=2` or `?a=1&b=2`.
 */
export function swapLocaleHref(
  pathname: string,
  nextLocale: Locale,
  search = "",
): string {
  const path = swapLocalePathname(pathname, nextLocale);
  const query = search.startsWith("?") ? search.slice(1) : search;
  return query ? `${path}?${query}` : path;
}
