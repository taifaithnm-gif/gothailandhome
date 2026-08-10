import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { FeaturedProjectCard } from "@/components/launch/featured-project-card";
import { CityDistrictList } from "@/components/cities/city-district-list";
import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale, type Locale } from "@/config/locales";
import {
  cityParagraphs,
  getCityPackage,
  localizedCityFaq,
} from "@/lib/cities/package";
import { getCityBySlug, listDistrictsByCity } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import {
  listPublishedPropertiesPaged,
} from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, fillTemplate, localePath } from "@/lib/i18n/metadata";
import { localizedOrNull, type DistrictAmenity } from "@/lib/districts/package";
import {
  getFeaturedLaunchProjects,
  getLaunchAreaById,
  getLaunchCta,
} from "@/lib/launch/content-launch-v1";
import {
  breadcrumbListSchema,
  citySchema,
  platformFaqSchema,
} from "@/lib/seo/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/cities/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const launchArea = getLaunchAreaById(slug);
  if (launchArea && launchArea.status !== "PRODUCTION_READY") {
    const comingSoon = getLaunchCta("coming_soon_area", lang);
    return buildPageMetadata({
      locale: lang,
      title: `${launchArea.area_name[lang]} — ${comingSoon}`,
      description: launchArea.overview[lang],
      path: `/cities/${slug}`,
    });
  }
  const city = await getCityBySlug(slug);
  if (!city) return {};
  return buildPageMetadata({
    locale: lang,
    title: city.seoTitle[lang],
    description: city.seoDescription[lang],
    path: `/cities/${slug}`,
  });
}

function AmenityCards({
  items,
  locale,
  sourceLabel,
  modeLabels,
  limit = 9,
  moreLabel,
}: {
  items: DistrictAmenity[];
  locale: Locale;
  sourceLabel: string;
  modeLabels: Record<string, string>;
  limit?: number;
  moreLabel?: string;
}) {
  const visible = items.slice(0, limit);
  const remaining = Math.max(items.length - visible.length, 0);
  return (
    <div className="space-y-3">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, index) => {
          const name =
            localizedOrNull(item.name, locale) ||
            item.name.en ||
            item.name.th ||
            item.name.zh;
          const modeKey = item.mode?.trim().toLowerCase() ?? "";
          const modeLabel = modeKey
            ? modeLabels[modeKey] || item.mode
            : null;
          return (
            <li key={`${name}-${index}`}>
              <SurfaceCard className="h-full space-y-1 p-4!">
                <p className="text-sm font-medium text-[var(--brand-deep)]">
                  {name}
                  {modeLabel ? (
                    <span className="ml-2 text-xs font-normal tracking-wide text-stone-500 uppercase">
                      {modeLabel}
                    </span>
                  ) : null}
                </p>
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--brand)] hover:underline"
                  >
                    {sourceLabel}
                  </a>
                ) : null}
              </SurfaceCard>
            </li>
          );
        })}
      </ul>
      {remaining > 0 && moreLabel ? (
        <p className="text-xs text-stone-500">{moreLabel}</p>
      ) : null}
    </div>
  );
}

function CitySection({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-10 scroll-mt-24 space-y-4"
      aria-labelledby={`${id}-heading`}
    >
      <div>
        <h2
          id={`${id}-heading`}
          className="font-heading text-2xl text-[var(--brand-deep)]"
        >
          {title}
        </h2>
        {note ? <p className="mt-1 text-sm text-stone-500">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Paragraphs({ rows }: { rows: string[] }) {
  return (
    <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-stone-700">
      {rows.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export default async function CityDetailPage({
  params,
}: PageProps<"/[lang]/cities/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const launchArea = getLaunchAreaById(slug);
  const comingSoonLabel = getLaunchCta("coming_soon_area", lang);

  // Coming-soon areas from CONTENT_LAUNCH_V1 — no fabricated full pages.
  if (launchArea && launchArea.status !== "PRODUCTION_READY") {
    const dict = await getDictionary(lang);
    return (
      <PageShell
        title={launchArea.area_name[lang]}
        subtitle={comingSoonLabel}
        breadcrumbs={[
          { label: dict.nav.home, href: localePath(lang) },
          { label: dict.nav.cities, href: localePath(lang, "/cities") },
          { label: launchArea.area_name[lang] },
        ]}
      >
        <SurfaceCard className="max-w-2xl space-y-4 p-6">
          <p className="inline-flex rounded-sm bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
            {comingSoonLabel}
          </p>
          {launchArea.status_note ? (
            <p className="text-sm leading-relaxed text-stone-700">
              {launchArea.status_note[lang]}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-stone-700">
            {launchArea.overview[lang]}
          </p>
          <Link
            href={localePath(lang, "/cities/bangkok")}
            className={cn(buttonVariants({ variant: "primary" }), "inline-flex")}
          >
            {dict.common.exploreBangkok}
          </Link>
        </SurfaceCard>
      </PageShell>
    );
  }

  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const pkg = getCityPackage(city.slug);

  const CITY_LISTING_PREVIEW = 12;
  const CITY_PROJECT_PREVIEW = 12;
  const CITY_AMENITY_PREVIEW = 9;

  const [dict, districts, projects, listingPage] = await Promise.all([
    getDictionary(lang),
    listDistrictsByCity(city.id),
    listPublishedProjects({ cityId: city.id }),
    listPublishedPropertiesPaged({
      citySlug: city.slug,
      verifiedOnly: true,
      sort: "newest_verified",
      page: 1,
      pageSize: CITY_LISTING_PREVIEW,
    }),
  ]);
  const c = dict.cities;
  const listings = listingPage.items;
  const previewProjects = projects.slice(0, CITY_PROJECT_PREVIEW);
  const hasMoreProjects = projects.length > previewProjects.length;
  const hasMoreListings = listingPage.total > listings.length;

  const overview = cityParagraphs(pkg.overview, lang);
  const lifestyle = cityParagraphs(pkg.lifestyle, lang);
  const investment = localizedOrNull(pkg.investmentSummary, lang);
  const rental = localizedOrNull(pkg.rentalSummary, lang);

  // Visible FAQ and FAQPage schema stay identical.
  const cityFaqs = localizedCityFaq(pkg.faq, lang);
  const faqSchema = platformFaqSchema(lang, cityFaqs);

  // Prefer package summary for subtitle when launch overview is shown in-body,
  // avoiding duplicate overview paragraphs (CV-04).
  const subtitle =
    (launchArea?.overview[lang]
      ? localizedOrNull(pkg.summary, lang) || city.summary[lang]
      : launchArea?.overview[lang] ||
        localizedOrNull(pkg.summary, lang) ||
        city.summary[lang]) || undefined;

  const featuredLaunch =
    launchArea?.status === "PRODUCTION_READY"
      ? getFeaturedLaunchProjects().filter((p) =>
          launchArea.featured_projects.includes(p.project_id),
        )
      : [];
  const detailLabel = dict.common.viewProperty;
  const areaCta = getLaunchCta("area_page", lang);
  const modeLabels: Record<string, string> = {
    bts: dict.listings.bts,
    mrt: dict.listings.mrt,
    air: dict.listings.air,
  };
  const amenityMore = (total: number) =>
    fillTemplate(c.amenityPreviewMore, {
      shown: String(Math.min(CITY_AMENITY_PREVIEW, total)),
      total: String(total),
    });

  return (
    <PageShell
      title={city.name[lang]}
      subtitle={subtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.cities, href: localePath(lang, "/cities") },
        { label: city.name[lang] },
      ]}
    >
      <JsonLd
        data={[
          citySchema({
            locale: lang,
            name: city.name[lang],
            description: city.seoDescription[lang] || city.summary[lang],
            slug: city.slug,
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.cities, path: "/cities" },
            { name: city.name[lang] },
          ]),
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />

      {launchArea?.overview[lang] ? (
        <CitySection id="overview" title={c.overview}>
          <Paragraphs rows={[launchArea.overview[lang]]} />
          {launchArea.suitable_buyer_profile?.[lang] ? (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-700">
              {launchArea.suitable_buyer_profile[lang]}
            </p>
          ) : null}
          {launchArea.transport_summary?.[lang] ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-700">
              {launchArea.transport_summary[lang]}
            </p>
          ) : null}
        </CitySection>
      ) : overview.length ? (
        <CitySection id="overview" title={c.overview} note={c.contentNote}>
          <Paragraphs rows={overview} />
        </CitySection>
      ) : null}

      {featuredLaunch.length > 0 ? (
        <CitySection id="featured-projects" title={dict.nav.projects}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLaunch.map((project) => (
              <FeaturedProjectCard
                key={project.project_id}
                locale={lang}
                project={project}
                detailLabel={detailLabel}
                dict={dict}
              />
            ))}
          </div>
          {launchArea?.consultation_cta?.[lang] ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="max-w-xl text-sm text-stone-600">
                {launchArea.consultation_cta[lang]}
              </p>
              <Link
                href={localePath(lang, "/contact")}
                className={cn(buttonVariants({ variant: "primary" }))}
              >
                {areaCta}
              </Link>
            </div>
          ) : null}
        </CitySection>
      ) : null}

      <section className="mt-10 space-y-4" id="districts">
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.cities.districts}
        </h2>
        <CityDistrictList
          districts={districts.map((district) => ({
            id: district.id,
            slug: district.slug,
            name: district.name[lang],
            href: localePath(lang, `/districts/${district.slug}`),
          }))}
          emptyLabel={dict.cities.emptyDistricts}
          showMoreLabel={c.districtsShowMore}
          showLessLabel={c.districtsShowLess}
          initialCount={12}
        />
      </section>

      <section className="mt-10 space-y-4" id="projects">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
            {dict.nav.projects}
          </h2>
          {hasMoreProjects ? (
            <Link
              href={localePath(lang, "/projects")}
              className="text-sm text-[var(--brand)] hover:underline"
            >
              {c.viewAllProjects}
            </Link>
          ) : null}
        </div>
        {hasMoreProjects ? (
          <p className="text-sm text-stone-500">{c.projectsPreviewNote}</p>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {previewProjects.map((project) => (
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
          {!previewProjects.length ? (
            <li className="text-sm text-stone-500">
              {dict.cities.emptyProjects}
            </li>
          ) : null}
        </ul>
      </section>

      {listings.length > 0 ? (
        <section className="mt-10 space-y-4" id="listings">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.cities.listings}
            </h2>
            <Link
              href={`${localePath(lang, "/properties")}?city=${city.slug}`}
              className="text-sm text-[var(--brand)] hover:underline"
            >
              {dict.common.viewAllListings}
            </Link>
          </div>
          {hasMoreListings ? (
            <p className="text-sm text-stone-500">{c.listingsPreviewNote}</p>
          ) : null}
          <PropertyGrid locale={lang} dict={dict} properties={listings} />
        </section>
      ) : null}

      {lifestyle.length ? (
        <CitySection id="lifestyle" title={c.lifestyle} note={c.contentNote}>
          <Paragraphs rows={lifestyle} />
        </CitySection>
      ) : null}

      {pkg.transportation.length ? (
        <CitySection
          id="transportation"
          title={c.transportation}
          note={c.amenityNote}
        >
          <AmenityCards
            items={pkg.transportation}
            locale={lang}
            sourceLabel={c.amenitySource}
            modeLabels={modeLabels}
            limit={CITY_AMENITY_PREVIEW}
            moreLabel={
              pkg.transportation.length > CITY_AMENITY_PREVIEW
                ? amenityMore(pkg.transportation.length)
                : undefined
            }
          />
        </CitySection>
      ) : null}

      {pkg.schools.length ? (
        <CitySection id="schools" title={c.schools} note={c.amenityNote}>
          <AmenityCards
            items={pkg.schools}
            locale={lang}
            sourceLabel={c.amenitySource}
            modeLabels={modeLabels}
            limit={CITY_AMENITY_PREVIEW}
            moreLabel={
              pkg.schools.length > CITY_AMENITY_PREVIEW
                ? amenityMore(pkg.schools.length)
                : undefined
            }
          />
        </CitySection>
      ) : null}

      {pkg.hospitals.length ? (
        <CitySection id="hospitals" title={c.hospitals} note={c.amenityNote}>
          <AmenityCards
            items={pkg.hospitals}
            locale={lang}
            sourceLabel={c.amenitySource}
            modeLabels={modeLabels}
            limit={CITY_AMENITY_PREVIEW}
            moreLabel={
              pkg.hospitals.length > CITY_AMENITY_PREVIEW
                ? amenityMore(pkg.hospitals.length)
                : undefined
            }
          />
        </CitySection>
      ) : null}

      {pkg.shopping.length ? (
        <CitySection id="shopping" title={c.shopping} note={c.amenityNote}>
          <AmenityCards
            items={pkg.shopping}
            locale={lang}
            sourceLabel={c.amenitySource}
            modeLabels={modeLabels}
            limit={CITY_AMENITY_PREVIEW}
            moreLabel={
              pkg.shopping.length > CITY_AMENITY_PREVIEW
                ? amenityMore(pkg.shopping.length)
                : undefined
            }
          />
        </CitySection>
      ) : null}

      {investment || rental ? (
        <CitySection
          id="investment"
          title={c.investment}
          note={c.investmentNote}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {investment ? (
              <SurfaceCard className="space-y-2 p-5!">
                <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                  {c.investment}
                </h3>
                <p className="text-sm leading-relaxed text-stone-700">
                  {investment}
                </p>
              </SurfaceCard>
            ) : null}
            {rental ? (
              <SurfaceCard className="space-y-2 p-5!">
                <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                  {c.rentalMarket}
                </h3>
                <p className="text-sm leading-relaxed text-stone-700">
                  {rental}
                </p>
              </SurfaceCard>
            ) : null}
          </div>
        </CitySection>
      ) : null}

      {cityFaqs.length ? (
        <CitySection id="faq" title={c.faqTitle} note={c.faqNote}>
          <div className="space-y-2" data-slot="city-faq">
            {cityFaqs.map((item, index) => (
              <details
                key={`city-faq-${index}`}
                className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-medium text-[var(--brand-deep)]">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </CitySection>
      ) : null}

      {pkg.knowledgeLinks.length || pkg.sources.length ? (
        <CitySection id="guides" title={c.guidesTitle} note={c.guidesNote}>
          {pkg.knowledgeLinks.length ? (
            <ul
              className="flex flex-wrap gap-x-5 gap-y-2"
              data-slot="city-knowledge-links"
            >
              {pkg.knowledgeLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={localePath(lang, link.path)}
                    className="text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
                  >
                    {link.label[lang] || link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {pkg.sources.length ? (
            <ul className="space-y-1">
              {pkg.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:underline"
                  >
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </CitySection>
      ) : null}
    </PageShell>
  );
}
