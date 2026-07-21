import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2MapEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  mapFiltersToQuery,
  osmEmbedUrl,
  parseMapSearchParams,
  stripBboxForCanonical,
  MAP_PROVIDER,
  MAP_PERF_BUDGET,
} from "@/lib/map/bbox";
import { searchMapListings } from "@/lib/map/search";
import { formatPrice } from "@/lib/data/properties";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const sp = await searchParams;
  const filters = parseMapSearchParams(sp);
  const canonicalFilters = stripBboxForCanonical(filters);
  const qs = new URLSearchParams(mapFiltersToQuery(canonicalFilters)).toString();
  const path = qs ? `/map?${qs}` : "/map";
  return buildPageMetadata({
    locale: lang,
    title: dict.map.metaTitle,
    description: dict.map.metaDescription,
    path,
  });
}

export default async function MapPage({ params, searchParams }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2MapEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const sp = await searchParams;
  const filters = parseMapSearchParams(sp);
  const result = await searchMapListings(filters);
  const selectedSlug = Array.isArray(sp.pin) ? sp.pin[0] : sp.pin;
  const selected =
    result.pins.find((p) => p.slug === selectedSlug) ?? result.pins[0] ?? null;

  return (
    <PageShell title={dict.map.title}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-heading text-3xl">{dict.map.title}</h1>
        <p className="mt-2 max-w-2xl text-stone-600">{dict.map.intro}</p>
        <p className="mt-2 text-xs text-stone-500">
          {MAP_PROVIDER.tileAttribution}. {dict.map.coordHonesty}
        </p>

        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <label className="text-sm">
            <span className="sr-only">{dict.map.district}</span>
            <input
              name="district"
              placeholder={dict.map.district}
              defaultValue={filters.district ?? ""}
              className="rounded-lg border border-[var(--brand-line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="sr-only">{dict.map.listingType}</span>
            <select
              name="listing_type"
              defaultValue={filters.listingType ?? "all"}
              className="rounded-lg border border-[var(--brand-line)] px-3 py-2"
            >
              <option value="all">{dict.map.allTypes}</option>
              <option value="sale">{dict.map.sale}</option>
              <option value="rent">{dict.map.rent}</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm text-white"
          >
            {dict.map.apply}
          </button>
        </form>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section aria-label={dict.map.listLabel}>
            <h2 className="font-heading text-xl">{dict.map.listTitle}</h2>
            <p className="mt-1 text-xs text-stone-500">
              {dict.map.unmapped.replace(
                "{count}",
                String(result.unmappedCount),
              )}
              {result.truncated ? ` · ${dict.map.truncated}` : ""}
            </p>
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
              {result.pins.length === 0 ? (
                <li className="text-stone-500">{dict.map.empty}</li>
              ) : (
                result.pins.map((pin) => {
                  const hrefQs = new URLSearchParams(
                    mapFiltersToQuery(filters),
                  );
                  hrefQs.set("pin", pin.slug);
                  return (
                    <li key={pin.slug}>
                      <Link
                        href={`/${lang}/map?${hrefQs.toString()}`}
                        className="block rounded-xl border border-[var(--brand-line)] bg-white px-3 py-3 hover:border-[var(--brand)]"
                      >
                        <span className="font-medium">{pin.titleEn}</span>
                        <span className="mt-1 block text-xs text-stone-500">
                          {pin.listingType} ·{" "}
                          {formatPrice(pin.priceThb, lang)} · lat/lng from
                          project
                        </span>
                      </Link>
                      <Link
                        href={localePath(lang, `/properties/${pin.slug}`)}
                        className="mt-1 inline-block text-xs underline"
                      >
                        {dict.map.openListing}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section aria-label={dict.map.mapLabel} className="space-y-3">
            <h2 className="font-heading text-xl">{dict.map.mapTitle}</h2>
            {selected ? (
              <iframe
                title={dict.map.mapTitle}
                className="h-80 w-full rounded-xl border border-[var(--brand-line)] bg-white"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={osmEmbedUrl(selected.lat, selected.lng)}
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-[var(--brand-line)] bg-white text-sm text-stone-500">
                {dict.map.noCoords}
              </div>
            )}
            <p className="text-xs text-stone-500">
              {dict.map.budgetNote.replace(
                "{max}",
                String(MAP_PERF_BUDGET.maxPinsPerRequest),
              )}
            </p>
          </section>
        </div>
      </main>
    </PageShell>
  );
}
