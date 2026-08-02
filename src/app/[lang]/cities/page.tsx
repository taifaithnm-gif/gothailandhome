import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { listCities } from "@/lib/data/geography";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  getLaunchAreas,
  getLaunchCta,
} from "@/lib/launch/content-launch-v1";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/cities">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.citiesTitle,
    description: dict.meta.citiesDescription,
    path: "/cities",
  });
}

export default async function CitiesIndexPage({
  params,
}: PageProps<"/[lang]/cities">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, cities] = await Promise.all([getDictionary(lang), listCities()]);
  const launchAreas = getLaunchAreas();
  const launchById = new Map(launchAreas.map((a) => [a.area_id, a]));
  const comingSoonLabel = getLaunchCta("coming_soon_area", lang);

  // Prefer launch areas for status; fall back to DB cities for Bangkok live.
  const ordered =
    launchAreas.length > 0
      ? launchAreas
      : cities.map((c) => ({
          area_id: c.slug,
          area_name: c.name,
          status: "PRODUCTION_READY" as const,
          overview: c.summary,
          featured_projects: [] as string[],
        }));

  return (
    <PageShell title={dict.cities.title} subtitle={dict.cities.subtitle}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((area) => {
          const isReady = area.status === "PRODUCTION_READY";
          const card = (
            <SurfaceCard className="h-full p-6">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                  {area.area_name[lang]}
                </h2>
                {!isReady ? (
                  <span className="shrink-0 rounded-sm bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {comingSoonLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                {area.overview[lang]}
              </p>
            </SurfaceCard>
          );
          return (
            <li key={area.area_id}>
              {isReady ? (
                <Link
                  href={localePath(lang, `/cities/${area.area_id}`)}
                  className="block h-full rounded-[var(--card-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                >
                  {card}
                </Link>
              ) : (
                <div aria-disabled="true">{card}</div>
              )}
            </li>
          );
        })}
      </ul>
      {/* Keep DB-only cities that aren't in the launch package (live only). */}
      {cities.filter((c) => !launchById.has(c.slug)).length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities
            .filter((c) => !launchById.has(c.slug))
            .map((city) => (
              <li key={city.id}>
                <Link
                  href={localePath(lang, `/cities/${city.slug}`)}
                  className="block rounded-2xl border border-[var(--brand-line)] bg-white p-6 transition hover:border-[var(--brand)]"
                >
                  <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                    {city.name[lang]}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                    {city.summary[lang]}
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      ) : null}
    </PageShell>
  );
}
