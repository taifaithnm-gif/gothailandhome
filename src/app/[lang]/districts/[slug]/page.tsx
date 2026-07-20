import { notFound } from "next/navigation";

import { DistrictCenter } from "@/components/district/district-center";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { isLocale } from "@/config/locales";
import { getDistrictBySlug } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedPropertiesPaged } from "@/lib/data/properties";
import {
  DISTRICT_LISTING_PREVIEW_SIZE,
  getDistrictPackage,
} from "@/lib/districts/package";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  breadcrumbListSchema,
  districtSchema,
} from "@/lib/seo/schema";

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

  const pkg = getDistrictPackage(district.slug, district.citySlug || "bangkok");

  const [dict, projects, listingPage] = await Promise.all([
    getDictionary(lang),
    listPublishedProjects({ districtId: district.id }),
    listPublishedPropertiesPaged({
      districtSlug: district.slug,
      verifiedOnly: true,
      sort: "newest_verified",
      page: 1,
      pageSize: DISTRICT_LISTING_PREVIEW_SIZE,
    }),
  ]);

  const transitTags = Array.from(
    new Set(
      projects.flatMap((project) => project.transitTags ?? []).filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <JsonLd
        data={[
          districtSchema({
            locale: lang,
            name: district.name[lang],
            description: district.seoDescription[lang],
            slug: district.slug,
            cityName: district.cityName[lang],
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.cities, path: "/cities" },
            {
              name: district.cityName[lang],
              path: `/cities/${district.citySlug}`,
            },
            { name: district.name[lang] },
          ]),
        ]}
      />
      <div className="ds-container pt-6">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: localePath(lang) },
            { label: dict.nav.cities, href: localePath(lang, "/cities") },
            {
              label: district.cityName[lang],
              href: localePath(lang, `/cities/${district.citySlug}`),
            },
            { label: district.name[lang] },
          ]}
        />
      </div>
      <DistrictCenter
        locale={lang}
        dict={dict}
        district={district}
        pkg={pkg}
        projects={projects}
        listings={listingPage.items}
        listingTotal={listingPage.total}
        transitTags={transitTags}
      />
    </>
  );
}
