import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeConversionPaths } from "@/components/home/home-conversion-paths";
import { HomeHeroSearch } from "@/components/home/home-hero-search";
import { DeveloperHighlightCard } from "@/components/launch/developer-highlight-card";
import { FeaturedProjectCard } from "@/components/launch/featured-project-card";
import { KnowledgeCardLink } from "@/components/launch/knowledge-card-link";
import { MarketplaceEntryGrid } from "@/components/marketplace/marketplace-entry-grid";
import { PropertyGrid } from "@/components/property/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import {
  getCityBySlug,
  listDistrictsByCity,
} from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedPropertiesPaged } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  categoryLabel,
  categoryNote,
  getFeaturedLaunchProjects,
  getHomepageLaunch,
  getLaunchAreas,
  getLaunchCta,
  getLaunchDevelopers,
  getLaunchKnowledgeCards,
} from "@/lib/launch/content-launch-v1";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

/** Homepage featured bounds — launch package sizes + listing preview. */
export const HOME_BOUNDS = {
  listings: 6,
  projects: 12,
  districts: 12,
  developers: 10,
  knowledge: 6,
  heroProjects: 40,
} as const;

/**
 * Content Launch V1 homepage section order.
 * Hero → conversion → optional listings → curated rails → CTA.
 */
export const HOME_SECTION_ORDER = [
  "hero",
  "sources",
  "paths",
  "listings",
  "projects",
  "areas",
  "developers",
  "knowledge",
  "why",
  "journey",
  "categories",
  "marketplace",
  "consultation",
  "trust",
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
  const launch = getHomepageLaunch();
  const featuredProjects = getFeaturedLaunchProjects().slice(
    0,
    HOME_BOUNDS.projects,
  );
  const launchDevelopers = getLaunchDevelopers().slice(
    0,
    HOME_BOUNDS.developers,
  );
  const allKnowledge = getLaunchKnowledgeCards();
  const featuredKnowledgeSlugs = new Set(
    launch.sections.knowledge_section.featured_articles,
  );
  const featuredKnowledge = [
    ...allKnowledge.filter((c) => featuredKnowledgeSlugs.has(c.slug)),
    ...allKnowledge.filter((c) => !featuredKnowledgeSlugs.has(c.slug)),
  ].slice(0, HOME_BOUNDS.knowledge);
  const launchAreas = getLaunchAreas();
  const areaStatusById = new Map(
    launch.sections.featured_areas.areas.map((a) => [a.area_id, a.status]),
  );

  const bangkok = await getCityBySlug("bangkok");

  const [districts, bangkokProjects, featuredPaged, latestPaged] =
    await Promise.all([
      bangkok ? listDistrictsByCity(bangkok.id) : Promise.resolve([]),
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

  const projectCatalog = bangkokProjects;
  const latestListings =
    featuredPaged.items.length > 0
      ? featuredPaged.items
      : latestPaged.items;

  const projectNameBySlug: Record<string, string> = {};
  for (const p of featuredProjects) {
    projectNameBySlug[p.project_id] = p.project_name[lang];
  }

  const detailLabel =
    lang === "zh" ? "查看详情" : lang === "th" ? "ดูรายละเอียด" : "View details";
  const projectCountLabel =
    lang === "zh"
      ? "{count} 个已核实项目"
      : lang === "th"
        ? "{count} โครงการที่ตรวจสอบแล้ว"
        : "{count} verified projects";
  const featuredProjectsLabel =
    lang === "zh"
      ? "精选项目"
      : lang === "th"
        ? "โครงการแนะนำ"
        : "Featured projects";

  const h = dict.home;
  const hero = launch.sections.hero;

  return (
    <>
      <JsonLd data={[organizationSchema(lang), websiteSchema(lang)]} />

      {/* 1. Hero */}
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
              {hero.headline[lang]}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              {hero.subheadline[lang]}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={localePath(lang, "/projects")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "bg-white text-[var(--brand-deep)] hover:bg-white/90",
                )}
                data-home-cta="hero-projects"
              >
                {hero.primary_cta[lang]}
              </Link>
              <Link
                href={localePath(lang, "/contact")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "border-white/40 bg-transparent text-white hover:bg-white/10",
                )}
                data-home-cta="hero-advisor"
              >
                {hero.secondary_cta[lang]}
              </Link>
            </div>
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

      <HomeConversionPaths locale={lang} dict={dict} />

      {/* Listings — hide when empty */}
      {latestListings.length > 0 ? (
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
      ) : null}

      {/* Featured projects — curated 12 */}
      {featuredProjects.length > 0 ? (
        <section data-home-section="projects" className="ds-section">
          <div className="ds-container">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="ds-h2">
                  {launch.sections.featured_projects.heading[lang]}
                </h2>
                <p className="mt-2 max-w-2xl text-stone-600">
                  {launch.sections.featured_projects.subheading[lang]}
                </p>
              </div>
              <Link
                href={localePath(lang, "/projects")}
                className={viewAllClass}
                data-home-cta="projects-all"
              >
                {launch.sections.featured_projects.cta[lang]}
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => (
                <FeaturedProjectCard
                  key={project.project_id}
                  locale={lang}
                  project={project}
                  detailLabel={detailLabel}
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Areas — Bangkok live + coming soon */}
      <section
        data-home-section="areas"
        className="border-y border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 max-w-2xl">
            <h2 className="ds-h2">
              {launch.sections.featured_areas.heading[lang]}
            </h2>
            <p className="mt-2 text-stone-600">
              {launch.sections.featured_areas.subheading[lang]}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {launchAreas.map((area) => {
              const status =
                areaStatusById.get(area.area_id) ??
                (area.status === "PRODUCTION_READY" ? "live" : "coming_soon");
              const isLive = status === "live" || area.status === "PRODUCTION_READY";
              const card = (
                <SurfaceCard className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-xl text-[var(--brand-deep)]">
                      {area.area_name[lang]}
                    </h3>
                    {!isLive ? (
                      <span className="shrink-0 rounded-sm bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                        {getLaunchCta("coming_soon_area", lang)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm text-stone-600">
                    {area.overview[lang]}
                  </p>
                </SurfaceCard>
              );
              return isLive ? (
                <Link
                  key={area.area_id}
                  href={localePath(lang, `/cities/${area.area_id}`)}
                  className="block h-full rounded-[var(--card-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                  data-home-cta={`area-${area.area_id}`}
                >
                  {card}
                </Link>
              ) : (
                <div key={area.area_id} aria-disabled="true">
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developers — curated 10 */}
      {launchDevelopers.length > 0 ? (
        <section data-home-section="developers" className="ds-section">
          <div className="ds-container">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="ds-h2">
                  {launch.sections.developer_highlights.heading[lang]}
                </h2>
                <p className="mt-2 max-w-2xl text-stone-600">
                  {launch.sections.developer_highlights.subheading[lang]}
                </p>
              </div>
              <Link
                href={localePath(lang, "/developers")}
                className={viewAllClass}
                data-home-cta="developers-all"
              >
                {launch.sections.developer_highlights.cta[lang]}
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {launchDevelopers.map((developer) => (
                <DeveloperHighlightCard
                  key={developer.developer_id}
                  locale={lang}
                  developer={developer}
                  projectCountLabel={projectCountLabel}
                  featuredLabel={featuredProjectsLabel}
                  detailLabel={detailLabel}
                  projectNames={projectNameBySlug}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Knowledge — featured cards */}
      {featuredKnowledge.length > 0 ? (
        <section data-home-section="knowledge" className="ds-section">
          <div className="ds-container">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="ds-h2">
                  {launch.sections.knowledge_section.heading[lang]}
                </h2>
                <p className="mt-2 text-stone-600">
                  {launch.sections.knowledge_section.subheading[lang]}
                </p>
              </div>
              <Link
                href={localePath(lang, "/knowledge")}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "shrink-0",
                )}
                data-home-cta="knowledge"
              >
                {launch.sections.knowledge_section.cta[lang]}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredKnowledge.map((card) => (
                <KnowledgeCardLink
                  key={card.slug}
                  locale={lang}
                  card={card}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Why buy */}
      <section
        data-home-section="why"
        className="border-y border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <div className="mb-8 max-w-2xl">
            <h2 className="ds-h2">
              {launch.sections.why_buy_in_thailand.heading[lang]}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {launch.sections.why_buy_in_thailand.points.map((point) => (
              <SurfaceCard key={point.en} className="p-5">
                <p className="text-sm leading-relaxed text-stone-700">
                  {point[lang]}
                </p>
              </SurfaceCard>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-500">
            {launch.sections.why_buy_in_thailand.disclaimer[lang]}
          </p>
        </div>
      </section>

      {/* Buyer journey */}
      <section data-home-section="journey" className="ds-section">
        <div className="ds-container">
          <h2 className="ds-h2 mb-8">
            {launch.sections.buyer_journey.heading[lang]}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {launch.sections.buyer_journey.steps.map((step, index) => (
              <li key={step.en}>
                <SurfaceCard className="h-full p-5">
                  <p className="ds-caption text-[var(--brand)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
                    {step[lang]}
                  </p>
                </SurfaceCard>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories */}
      <section
        data-home-section="categories"
        className="border-y border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container ds-section">
          <h2 className="ds-h2 mb-8">
            {launch.sections.property_categories.heading[lang]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {launch.sections.property_categories.categories.map((cat) => {
              const label = categoryLabel(cat, lang);
              const note = categoryNote(cat, lang);
              const inner = (
                <SurfaceCard className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                      {label}
                    </h3>
                    {!cat.available ? (
                      <span className="shrink-0 rounded-sm bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                        {getLaunchCta("coming_soon_area", lang)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{note}</p>
                </SurfaceCard>
              );
              if (!cat.available) {
                return (
                  <div key={cat.id} aria-disabled="true">
                    {inner}
                  </div>
                );
              }
              const href =
                cat.id === "condominium"
                  ? localePath(lang, "/projects")
                  : localePath(lang, "/properties");
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="block h-full rounded-[var(--card-radius)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Marketplace */}
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

      {/* Consultation CTA */}
      <section
        data-home-section="consultation"
        className="ds-section"
      >
        <div className="ds-container">
          <div className="rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-[linear-gradient(135deg,#0a5c54_0%,#063d38_60%,#1d7a6d_100%)] px-6 py-10 text-white sm:px-10">
            <h2 className="font-heading text-2xl sm:text-3xl">
              {launch.sections.consultation_cta.heading[lang]}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-white/85">
              {launch.sections.consultation_cta.body[lang]}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={localePath(lang, "/contact")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "bg-white text-[var(--brand-deep)] hover:bg-white/90",
                )}
                data-home-cta="contact"
              >
                {launch.sections.consultation_cta.cta[lang]}
              </Link>
              <Link
                href={localePath(lang, "/find-my-home")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "border-white/40 bg-transparent text-white hover:bg-white/10",
                )}
                data-home-cta="find-my-home-support"
              >
                {dict.nav.findMyHome}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section
        data-home-section="trust"
        className="border-t border-[var(--brand-line)] bg-white/70"
      >
        <div className="ds-container py-8">
          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
            {launch.sections.footer_trust_text[lang]}
          </p>
        </div>
      </section>
    </>
  );
}
