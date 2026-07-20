import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeConversionPaths } from "@/components/home/home-conversion-paths";
import { HomeHeroSearch } from "@/components/home/home-hero-search";
import {
  AiConcierge,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { MarketplaceEntryGrid } from "@/components/marketplace/marketplace-entry-grid";
import { PropertyGrid } from "@/components/property/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import {
  DeveloperCardShell,
  ProjectCardShell,
  SurfaceCard,
} from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import {
  getCityBySlug,
  listDistrictsByCity,
} from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedPropertiesPaged } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

/** Seed demo developers — never surface on Alpha homepage as featured. */
const SEED_DEMO_DEVELOPER_SLUGS = new Set([
  "sathorn-living",
  "andaman-homes",
  "northern-estate",
]);

/** Homepage featured bounds — keep first-page catalog small. */
export const HOME_BOUNDS = {
  listings: 6,
  projects: 6,
  districts: 12,
  developers: 6,
  heroProjects: 40,
} as const;

/**
 * Documented mobile/desktop section order for conversion hierarchy tests.
 * Hero → paths → listings → projects → districts → … → inquiry.
 */
export const HOME_SECTION_ORDER = [
  "hero",
  "sources",
  "paths",
  "listings",
  "projects",
  "districts",
  "developers",
  "why",
  "marketplace",
  "knowledge",
  "support",
] as const;

const INDEXED_SOURCES = [
  "PropertyHub",
  "LivingInsider",
  "DotProperty",
  "FazWaz",
] as const;

const viewAllClass =
  "shrink-0 rounded-sm text-sm text-[var(--brand)] outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const bangkok = await getCityBySlug("bangkok");

  const [districts, developers, bangkokProjects, featuredPaged, latestPaged] =
    await Promise.all([
      bangkok ? listDistrictsByCity(bangkok.id) : Promise.resolve([]),
      listPublishedDevelopers(),
      bangkok
        ? listPublishedProjects({ cityId: bangkok.id })
        : listPublishedProjects(),
      listPublishedPropertiesPaged({
        verifiedOnly: true,
        featuredOnly: true,
        citySlug: "bangkok",
        sort: "featured",
        page: 1,
        pageSize: HOME_BOUNDS.listings,
      }),
      listPublishedPropertiesPaged({
        verifiedOnly: true,
        citySlug: "bangkok",
        sort: "newest",
        page: 1,
        pageSize: HOME_BOUNDS.listings,
      }),
    ]);

  const publishedDevelopers = developers
    .filter((d) => !SEED_DEMO_DEVELOPER_SLUGS.has(d.slug))
    .slice(0, HOME_BOUNDS.developers);

  const projectCatalog = bangkokProjects;
  const featuredProjects = projectCatalog.slice(0, HOME_BOUNDS.projects);

  const latestListings =
    featuredPaged.items.length > 0
      ? featuredPaged.items
      : latestPaged.items;

  const districtCards = districts.slice(0, HOME_BOUNDS.districts);
  const h = dict.home;

  return (
    <>
      <JsonLd data={[organizationSchema(lang), websiteSchema(lang)]} />
      {/* 1. Hero + filtered search */}
      <section
        data-home-section="hero"
        className="relative overflow-hidden border-b border-[var(--brand-line)]"
      >
        <div
          className="absolute inset-0 bg-[linear-gradient(120deg,#063d38_0%,#0a5c54_42%,#1d7a6d_72%,#c9a227_140%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 [background-image:radial-gradient(circle_at_15%_20%,white_0,transparent_28%),radial-gradient(circle_at_85%_15%,#e0b34d_0,transparent_22%)] opacity-35"
          aria-hidden
        />
        <div className="ds-container relative flex flex-col justify-start gap-8 py-10 sm:py-12 md:min-h-[72vh] md:justify-end md:py-16">
          <div className="max-w-2xl space-y-4 text-white">
            <p className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl">
              {dict.common.brand}
            </p>
            <h1 className="max-w-xl text-2xl leading-snug font-medium text-white/95 sm:text-3xl">
              {h.headline}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              {h.subheadline}
            </p>
            <p className="max-w-lg text-sm leading-relaxed text-white/70">
              {h.positioning}
            </p>
          </div>
          <HomeHeroSearch
            locale={lang}
            dict={dict}
            districts={districts}
            projects={projectCatalog.slice(0, HOME_BOUNDS.heroProjects)}
          />
        </div>
      </section>

      <section
        data-home-section="sources"
        className="border-b border-[var(--brand-line)] bg-white/80"
        aria-label={h.sourcesLabel}
      >
        <div className="ds-container flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="ds-caption text-stone-600">
            {h.sourcesLabel}: {INDEXED_SOURCES.join(" · ")}
          </p>
          <p className="text-xs text-stone-500">{h.coverageNote}</p>
        </div>
      </section>

      {/* 2. Buy / rent / filtered sale scan */}
      <HomeConversionPaths locale={lang} dict={dict} />

      {/* 3. Latest listings (before projects) */}
      <section
        data-home-section="listings"
        className="border-b border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="ds-h2">{h.latestListingsTitle}</h2>
              <p className="mt-2 text-stone-600">{h.latestListingsSubtitle}</p>
            </div>
            <Link
              href={`${localePath(lang, "/properties")}?city=bangkok`}
              className={viewAllClass}
              data-home-cta="listings-all"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <PropertyGrid
            locale={lang}
            dict={dict}
            properties={latestListings}
            imagePriorityCount={1}
          />
        </div>
      </section>

      {/* 4. Featured projects */}
      <section data-home-section="projects" className="ds-section">
        <div className="ds-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="ds-h2">{h.featuredProjectsTitle}</h2>
              <p className="mt-2 text-stone-600">{h.featuredProjectsSubtitle}</p>
            </div>
            <Link
              href={localePath(lang, "/projects")}
              className={viewAllClass}
              data-home-cta="projects-all"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={localePath(lang, `/projects/${project.slug}`)}
                className="block h-full rounded-[var(--card-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              >
                <ProjectCardShell className="h-full p-5">
                  <p className="ds-caption text-[var(--brand)]">
                    {project.developer?.name[lang]}
                  </p>
                  <h3 className="font-heading mt-2 text-xl text-[var(--brand-deep)]">
                    {project.name[lang]}
                  </h3>
                  <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm text-stone-600">
                    {project.description[lang]}
                  </p>
                </ProjectCardShell>
              </Link>
            ))}
            {!featuredProjects.length ? (
              <p className="text-sm text-stone-500">
                {dict.cities.emptyProjects}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 5. Explore Bangkok districts */}
      <section
        data-home-section="districts"
        className="border-y border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="ds-h2">{h.citiesTitle}</h2>
              <p className="mt-2 text-stone-600">{h.citiesSubtitle}</p>
            </div>
            {bangkok ? (
              <Link
                href={localePath(lang, `/cities/${bangkok.slug}`)}
                className={viewAllClass}
                data-home-cta="districts-all"
              >
                {dict.common.viewAll}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {districtCards.map((district) => (
              <Link
                key={district.id}
                href={localePath(lang, `/districts/${district.slug}`)}
                className="rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-[var(--brand-soft)] px-5 py-8 transition duration-300 outline-none hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[var(--shadow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              >
                <span className="font-heading text-xl text-[var(--brand-deep)]">
                  {district.name[lang]}
                </span>
                {district.summary[lang] ? (
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                    {district.summary[lang]}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-stone-500">{h.viewDistricts}</p>
                )}
              </Link>
            ))}
            {!districtCards.length ? (
              <p className="text-sm text-stone-500">{dict.common.noResults}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 6. Developers */}
      <section data-home-section="developers" className="ds-section">
        <div className="ds-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="ds-h2">{h.developersTitle}</h2>
              <p className="mt-2 text-stone-600">{h.developersSubtitle}</p>
            </div>
            <Link
              href={localePath(lang, "/developers")}
              className={viewAllClass}
              data-home-cta="developers-all"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedDevelopers.map((developer) => (
              <Link
                key={developer.id}
                href={localePath(lang, `/developers/${developer.slug}`)}
                className="block h-full rounded-[var(--card-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              >
                <DeveloperCardShell className="h-full p-5">
                  <h3 className="font-heading text-xl text-[var(--brand-deep)]">
                    {developer.name[lang]}
                  </h3>
                  <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm text-stone-600">
                    {developer.description[lang]}
                  </p>
                </DeveloperCardShell>
              </Link>
            ))}
            {!publishedDevelopers.length ? (
              <p className="text-sm text-stone-500">{dict.common.noResults}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 7. Why GoThailandHome */}
      <section
        data-home-section="why"
        className="border-y border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 max-w-2xl">
            <h2 className="ds-h2">{h.whyTitle}</h2>
            <p className="mt-2 text-stone-600">{h.whySubtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                [h.whyVerifiedTitle, h.whyVerifiedBody],
                [h.whyMultiTitle, h.whyMultiBody],
                [h.whyTransparencyTitle, h.whyTransparencyBody],
                [h.whyMarketplaceTitle, h.whyMarketplaceBody],
              ] as const
            ).map(([title, body]) => (
              <SurfaceCard key={title} className="p-5">
                <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {body}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Marketplace */}
      <section
        data-home-section="marketplace"
        className="border-b border-[var(--brand-line)] bg-[var(--brand-soft)]"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="ds-h2">{h.marketplaceTitle}</h2>
              <p className="mt-2 text-stone-600">{h.marketplaceSubtitle}</p>
            </div>
            <Link
              href={localePath(lang, "/marketplace")}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "shrink-0",
              )}
              data-home-cta="marketplace"
            >
              {dict.nav.marketplace}
            </Link>
          </div>
          <MarketplaceEntryGrid locale={lang} dict={dict} />
        </div>
      </section>

      {/* 9. Knowledge */}
      <section data-home-section="knowledge" className="ds-section">
        <div className="ds-container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="ds-h2">{h.knowledgeTitle}</h2>
              <p className="mt-2 text-stone-600">{h.knowledgeSubtitle}</p>
              <p className="mt-1 text-sm text-stone-500">{h.knowledgeComing}</p>
            </div>
            <Link
              href={localePath(lang, "/knowledge")}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "shrink-0",
              )}
              data-home-cta="knowledge"
            >
              {dict.nav.knowledge}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href={localePath(lang, "/about")}
              className="block rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 transition outline-none hover:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              data-home-cta="about"
            >
              <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                {h.guidePlatformTitle}
              </h3>
              <p className="mt-2 text-sm text-stone-600">{h.guidePlatformBody}</p>
            </Link>
            <Link
              href={localePath(lang, "/knowledge/glossary")}
              className="block rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 transition outline-none hover:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              data-home-cta="glossary"
            >
              <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                {dict.knowledge.glossaryTitle}
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {dict.knowledge.glossaryBody}
              </p>
            </Link>
            <Link
              href={localePath(lang, "/knowledge/bangkok-districts")}
              className="block rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 transition outline-none hover:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
              data-home-cta="knowledge-districts"
            >
              <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                {dict.knowledge.districtsTitle}
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {dict.knowledge.districtsBody}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Platform support / inquiry */}
      <section
        data-home-section="support"
        className="border-t border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 max-w-2xl">
            <h2 className="ds-h2">{h.supportTitle}</h2>
            <p className="mt-2 text-stone-600">{h.supportSubtitle}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PlatformCustomerSuccess locale={lang} dict={dict} />
            <AiConcierge dict={dict} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={localePath(lang, "/contact")}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
              data-home-cta="contact"
            >
              {h.ctaButton}
            </Link>
            <Link
              href={localePath(lang, "/find-my-home")}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
              )}
              data-home-cta="find-my-home-support"
            >
              {dict.nav.findMyHome}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
