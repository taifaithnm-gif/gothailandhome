import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, MapPin } from "lucide-react";

import { PlatformCustomerSuccess } from "@/components/marketplace/contact-blocks";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProjectCardShell, SurfaceCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import type { Locale } from "@/config/locales";
import type { DistrictView } from "@/lib/data/geography";
import type { ProjectView } from "@/lib/data/projects";
import type { PropertyView } from "@/lib/data/properties";
import type {
  DistrictAmenity,
  DistrictPackage,
} from "@/lib/districts/package";
import {
  DISTRICT_LISTING_PREVIEW_SIZE,
  DISTRICT_PROJECT_PREVIEW_SIZE,
  districtMapsUrl,
  hasDistrictCoordinates,
  localizedOrNull,
} from "@/lib/districts/package";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

function Section({
  id,
  title,
  children,
  note,
}: {
  id: string;
  title: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-4"
      aria-labelledby={`${id}-heading`}
    >
      <div>
        <h2 id={`${id}-heading`} className="ds-h2 text-2xl sm:text-3xl">
          {title}
        </h2>
        {note ? <p className="mt-1 text-sm text-stone-500">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function AmenityList({
  items,
  locale,
  emptyLabel,
  emptyDescription,
  sourceLabel,
}: {
  items: DistrictAmenity[];
  locale: Locale;
  emptyLabel: string;
  emptyDescription: string;
  sourceLabel: string;
}) {
  if (!items.length) {
    return <EmptyState title={emptyLabel} description={emptyDescription} />;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        const name =
          localizedOrNull(item.name, locale) ||
          item.name.en ||
          item.name.th ||
          item.name.zh;
        return (
          <li key={`${name}-${index}`}>
            <SurfaceCard className="h-full space-y-2 p-4!">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-[var(--brand-deep)]">{name}</p>
                {item.mode ? (
                  <Badge tone="brand">{item.mode.toUpperCase()}</Badge>
                ) : null}
              </div>
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--brand)] hover:underline"
                >
                  {sourceLabel}{" "}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ) : null}
            </SurfaceCard>
          </li>
        );
      })}
    </ul>
  );
}

function OverviewFact({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
      <dt className="ds-caption text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
        {typeof value === "number" ? String(value) : value}
      </dd>
    </div>
  );
}

type Props = {
  locale: Locale;
  dict: Dictionary;
  district: DistrictView;
  pkg: DistrictPackage;
  projects: ProjectView[];
  listings: PropertyView[];
  listingTotal: number;
  transitTags: string[];
};

export function DistrictCenter({
  locale,
  dict,
  district,
  pkg,
  projects,
  listings,
  listingTotal,
  transitTags,
}: Props) {
  const d = dict.districtCenter;
  const unknown = d.unknown;
  const name = district.name[locale];
  const cityName = district.cityName[locale];
  const summary =
    localizedOrNull(pkg.summary, locale) ||
    district.summary[locale] ||
    null;
  const mapsUrl = districtMapsUrl(pkg);
  const coordsOk = hasDistrictCoordinates(pkg);
  const investment = localizedOrNull(pkg.investmentSummary, locale);
  const packageTransit = pkg.transportation;
  const hasTransit = packageTransit.length > 0 || transitTags.length > 0;

  const projectPreview = projects.slice(0, DISTRICT_PROJECT_PREVIEW_SIZE);
  const listingPreview = listings.slice(0, DISTRICT_LISTING_PREVIEW_SIZE);

  const overviewFacts: Array<{ label: string; value: string | number }> = [];
  if (pkg.postalCode) {
    overviewFacts.push({ label: d.postalCode, value: pkg.postalCode });
  }
  if (pkg.districtCode != null) {
    overviewFacts.push({ label: d.districtCode, value: pkg.districtCode });
  }
  if (pkg.khwaengCount != null) {
    overviewFacts.push({
      label: d.subdistrictCount,
      value: pkg.khwaengCount,
    });
  }
  if (coordsOk && pkg.latitude != null && pkg.longitude != null) {
    overviewFacts.push({
      label: d.coordinates,
      value: `${pkg.latitude}, ${pkg.longitude}`,
    });
  }

  const sectionLinks: Array<{ id: string; label: string }> = [
    { id: "overview", label: d.overview },
    { id: "map", label: d.map },
    { id: "projects", label: d.projects },
    { id: "listings", label: d.listings },
    { id: "transit", label: d.transit },
    { id: "lifestyle", label: d.lifestyle },
    { id: "schools", label: d.schools },
    { id: "hospitals", label: d.hospitals },
    { id: "shopping", label: d.shopping },
    { id: "knowledge", label: d.knowledge },
    { id: "find-my-home", label: d.findMyHomeTitle },
    { id: "platform-support", label: d.platformSupport },
  ];

  return (
    <div data-slot="district-center" className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--brand-line)]">
        <div
          className="absolute inset-0 bg-[linear-gradient(125deg,#063d38_0%,#0a5c54_48%,#1d7a6d_78%,#c9a227_130%)]"
          aria-hidden
        />
        <div className="ds-container relative py-12 sm:py-16">
          <p className="ds-caption text-white/70">{d.heroEyebrow}</p>
          <h1 className="mt-2 font-heading text-4xl tracking-tight text-white sm:text-5xl">
            {name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
            {cityName}
            {summary ? ` · ${summary}` : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, `/cities/${district.citySlug}`)}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {cityName}
            </Link>
            <Link
              href={localePath(locale, "/find-my-home")}
              className={buttonVariants({ variant: "primary" })}
            >
              {d.findMyHomeCta}
            </Link>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "border-white/20 bg-white/10 text-white hover:bg-white/20",
                )}
              >
                <MapPin className="size-4" aria-hidden />
                {d.openMap}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <nav
        className="border-b border-[var(--brand-line)] bg-white/70"
        aria-label={d.sectionNav}
        data-slot="district-section-nav"
      >
        <div className="ds-container flex gap-2 overflow-x-auto py-3">
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-[var(--brand-deep)] transition hover:bg-[var(--brand-soft)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="ds-container space-y-14 pb-16">
        {/* Overview — only available package facts */}
        <Section id="overview" title={d.overview} note={d.overviewNote}>
          {summary ? (
            <p className="max-w-3xl text-stone-700">{summary}</p>
          ) : (
            <p className="text-sm text-stone-500">{unknown}</p>
          )}
          {overviewFacts.length ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {overviewFacts.map((fact) => (
                <OverviewFact
                  key={fact.label}
                  label={fact.label}
                  value={fact.value}
                />
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-stone-500">{unknown}</p>
          )}
          <p className="mt-3 text-sm text-stone-500">{d.inventoryNote}</p>
          <p className="text-sm text-stone-600">
            {d.projectsOnPlatform}: {projects.length} · {d.listingsOnPlatform}:{" "}
            {listingTotal}
          </p>
        </Section>

        {/* Map */}
        <Section id="map" title={d.map} note={d.mapNote}>
          {mapsUrl ? (
            <SurfaceCard className="flex flex-col gap-3 p-5! sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-600">
                {d.coordinates}: {pkg.latitude}, {pkg.longitude}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary" })}
              >
                <MapPin className="size-4" aria-hidden />
                {d.openMap}
              </a>
            </SurfaceCard>
          ) : (
            <EmptyState title={unknown} description={d.mapMissing} />
          )}
        </Section>

        {/* Projects */}
        <Section id="projects" title={d.projects} note={d.projectsNote}>
          {projectPreview.length ? (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectPreview.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={localePath(locale, `/projects/${project.slug}`)}
                      className="block h-full"
                    >
                      <ProjectCardShell className="h-full transition hover:border-[var(--brand)]">
                        <p className="font-heading text-lg text-[var(--brand-deep)]">
                          {project.name[locale]}
                        </p>
                        {project.developer?.name[locale] ? (
                          <p className="mt-1 text-sm text-stone-500">
                            {project.developer.name[locale]}
                          </p>
                        ) : null}
                      </ProjectCardShell>
                    </Link>
                  </li>
                ))}
              </ul>
              {projects.length > DISTRICT_PROJECT_PREVIEW_SIZE ? (
                <Link
                  href={localePath(locale, "/projects")}
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "mt-2",
                  )}
                >
                  {d.viewAllProjects}
                </Link>
              ) : null}
            </>
          ) : (
            <EmptyState title={dict.cities.emptyProjects} />
          )}
        </Section>

        {/* Listings */}
        <Section id="listings" title={d.listings} note={d.listingsNote}>
          <PropertyGrid
            locale={locale}
            dict={dict}
            properties={listingPreview}
          />
          {listingTotal > DISTRICT_LISTING_PREVIEW_SIZE || listingTotal > 0 ? (
            <Link
              href={localePath(
                locale,
                `/properties?district=${encodeURIComponent(district.slug)}`,
              )}
              className={cn(buttonVariants({ variant: "secondary" }), "mt-2")}
            >
              {d.viewAllListings}
            </Link>
          ) : null}
        </Section>

        {/* BTS/MRT */}
        <Section id="transit" title={d.transit} note={d.transitNote}>
          {hasTransit ? (
            <div className="space-y-4">
              {packageTransit.length ? (
                <AmenityList
                  items={packageTransit}
                  locale={locale}
                  emptyLabel={unknown}
                  emptyDescription={d.amenitiesEmpty}
                  sourceLabel={d.amenitySource}
                />
              ) : null}
              {transitTags.length ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--brand-deep)]">
                    {d.transitFromProjects}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {transitTags.map((tag) => (
                      <Badge key={tag} tone="brand">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState title={unknown} description={d.transitMissing} />
          )}
        </Section>

        {/* Lifestyle */}
        <Section id="lifestyle" title={d.lifestyle} note={d.lifestyleNote}>
          <EmptyState title={unknown} description={d.lifestyleMissing} />
        </Section>

        {/* Schools */}
        <Section id="schools" title={d.schools} note={d.schoolsNote}>
          <AmenityList
            items={pkg.schools}
            locale={locale}
            emptyLabel={unknown}
            emptyDescription={d.amenitiesEmpty}
            sourceLabel={d.amenitySource}
          />
        </Section>

        {/* Hospitals */}
        <Section id="hospitals" title={d.hospitals} note={d.hospitalsNote}>
          <AmenityList
            items={pkg.hospitals}
            locale={locale}
            emptyLabel={unknown}
            emptyDescription={d.amenitiesEmpty}
            sourceLabel={d.amenitySource}
          />
        </Section>

        {/* Shopping */}
        <Section id="shopping" title={d.shopping} note={d.shoppingNote}>
          <AmenityList
            items={pkg.shopping}
            locale={locale}
            emptyLabel={unknown}
            emptyDescription={d.amenitiesEmpty}
            sourceLabel={d.amenitySource}
          />
        </Section>

        {/* Knowledge */}
        <Section id="knowledge" title={d.knowledge} note={d.knowledgeNote}>
          <SurfaceCard className="space-y-3 p-5!">
            <p className="text-sm leading-relaxed text-stone-700">
              {investment ?? d.knowledgeFallback}
            </p>
            {pkg.sources.length ? (
              <ul className="space-y-2">
                {pkg.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[var(--brand)] hover:underline"
                    >
                      {source.name}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">{unknown}</p>
            )}
            <div
              className="flex flex-wrap gap-3 pt-2"
              data-slot="district-knowledge-links"
            >
              <Link
                href={localePath(locale, "/knowledge")}
                className="text-sm font-medium text-[var(--brand)] hover:underline"
              >
                {d.knowledgeHub}
              </Link>
              <Link
                href={localePath(locale, "/knowledge/bangkok-districts")}
                className="text-sm font-medium text-[var(--brand)] hover:underline"
              >
                {d.knowledgeDistricts}
              </Link>
              <Link
                href={localePath(locale, "/knowledge/glossary")}
                className="text-sm font-medium text-[var(--brand)] hover:underline"
              >
                {d.knowledgeGlossary}
              </Link>
            </div>
          </SurfaceCard>
        </Section>

        {/* Find My Home CTA */}
        <Section id="find-my-home" title={d.findMyHomeTitle}>
          <SurfaceCard className="flex flex-col gap-4 p-5! sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-stone-600">{d.findMyHomeBody}</p>
            <Link
              href={localePath(locale, "/find-my-home")}
              className={cn(buttonVariants({ variant: "primary" }), "shrink-0")}
            >
              {d.findMyHomeCta}
            </Link>
          </SurfaceCard>
        </Section>

        {/* Platform Support */}
        <Section id="platform-support" title={d.platformSupport}>
          <SurfaceCard className="p-5!">
            <PlatformCustomerSuccess locale={locale} dict={dict} />
          </SurfaceCard>
        </Section>
      </div>
    </div>
  );
}

/** @deprecated Prefer DISTRICT_LISTING_PREVIEW_SIZE from package helpers. */
export const DISTRICT_LISTING_PREVIEW = DISTRICT_LISTING_PREVIEW_SIZE;
