import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { getCityBySlug, listDistrictsByCity } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/cities/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const city = await getCityBySlug(slug);
  if (!city) return {};
  return buildPageMetadata({
    locale: lang,
    title: city.seoTitle[lang],
    description: city.seoDescription[lang],
    path: `/cities/${slug}`,
  });
}

export default async function CityDetailPage({
  params,
}: PageProps<"/[lang]/cities/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [dict, districts, projects, listings] = await Promise.all([
    getDictionary(lang),
    listDistrictsByCity(city.id),
    listPublishedProjects({ cityId: city.id }),
    listPublishedProperties({
      citySlug: city.slug,
      verifiedOnly: true,
      sort: "newest",
    }),
  ]);

  return (
    <PageShell title={city.name[lang]} subtitle={city.summary[lang]}>
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.cities.districts}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((district) => (
            <li key={district.id}>
              <Link
                href={localePath(lang, `/districts/${district.slug}`)}
                className="block rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 hover:border-[var(--brand)]"
              >
                {district.name[lang]}
              </Link>
            </li>
          ))}
          {!districts.length ? (
            <li className="text-sm text-stone-500">
              {dict.cities.emptyDistricts}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.nav.projects}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={localePath(lang, `/projects/${project.slug}`)}
                className="block rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand)]"
              >
                <p className="font-medium text-[var(--brand-deep)]">
                  {project.name[lang]}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                  {project.description[lang]}
                </p>
              </Link>
            </li>
          ))}
          {!projects.length ? (
            <li className="text-sm text-stone-500">
              {dict.cities.emptyProjects}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
            {dict.cities.listings}
          </h2>
          <Link
            href={`${localePath(lang, "/properties")}?city=${city.slug}`}
            className="text-sm text-[var(--brand)] hover:underline"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        <PropertyGrid locale={lang} dict={dict} properties={listings} />
      </section>
    </PageShell>
  );
}
