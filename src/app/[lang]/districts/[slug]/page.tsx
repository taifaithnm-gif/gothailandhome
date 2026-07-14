import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { getDistrictBySlug } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/districts/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const district = await getDistrictBySlug(slug);
  if (!district) return {};
  return buildPageMetadata({
    locale: lang,
    title: district.seoTitle[lang],
    description: district.seoDescription[lang],
    path: `/districts/${slug}`,
  });
}

export default async function DistrictDetailPage({
  params,
}: PageProps<"/[lang]/districts/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const district = await getDistrictBySlug(slug);
  if (!district) notFound();

  const [dict, projects, listings] = await Promise.all([
    getDictionary(lang),
    listPublishedProjects({ districtId: district.id }),
    listPublishedProperties({
      districtSlug: district.slug,
      verifiedOnly: true,
      sort: "newest",
    }),
  ]);

  return (
    <PageShell
      title={district.name[lang]}
      subtitle={`${district.cityName[lang]} · ${district.summary[lang]}`}
    >
      <p className="mb-6 text-sm">
        <Link
          href={localePath(lang, `/cities/${district.citySlug}`)}
          className="text-[var(--brand)] hover:underline"
        >
          {district.cityName[lang]}
        </Link>
      </p>

      <section className="space-y-4">
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
                {project.name[lang]}
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
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.cities.listings}
        </h2>
        <PropertyGrid locale={lang} dict={dict} properties={listings} />
      </section>
    </PageShell>
  );
}
