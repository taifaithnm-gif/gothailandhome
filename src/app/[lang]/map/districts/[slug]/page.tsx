import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2MapEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { searchMapListings } from "@/lib/map/search";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: `${dict.map.districtTitle}: ${slug} | GoThailandHome`,
    description: dict.map.metaDescription,
    path: `/map/districts/${slug}`,
  });
}

export default async function MapDistrictPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  if (!isLocale(raw) || !isPhase2MapEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const result = await searchMapListings({
    district: slug,
    listingType: "all",
  });

  return (
    <PageShell title={`${dict.map.districtTitle}: ${slug}`}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm">
          <Link href={localePath(lang, "/map")} className="underline">
            {dict.map.title}
          </Link>
        </p>
        <h1 className="font-heading mt-2 text-3xl">
          {dict.map.districtTitle}: {slug}
        </h1>
        <p className="mt-2 text-stone-600">{dict.map.districtIntro}</p>
        <ul className="mt-6 space-y-2">
          {result.pins.length === 0 ? (
            <li className="text-stone-500">{dict.map.empty}</li>
          ) : (
            result.pins.map((pin) => (
              <li key={pin.slug}>
                <Link
                  className="underline"
                  href={localePath(lang, `/properties/${pin.slug}`)}
                >
                  {pin.titleEn}
                </Link>
              </li>
            ))
          )}
        </ul>
        <p className="mt-4 text-xs text-stone-500">
          {dict.map.unmapped.replace("{count}", String(result.unmappedCount))}
        </p>
      </main>
    </PageShell>
  );
}
