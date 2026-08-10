import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  AdsTrackingPlaceholders,
  projectOpenGraphImages,
} from "@/components/ads/ads-tracking-placeholders";
import {
  AiConcierge,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { ProjectLeadForm } from "@/components/projects/project-lead-form";
import { ProjectStickyContact } from "@/components/projects/project-sticky-contact";
import { ProjectSuitableFor } from "@/components/projects/project-suitable-for";
import { ListingGallery } from "@/components/property/listing-gallery";
import { PropertyGrid } from "@/components/property/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProjectCardShell, SurfaceCard } from "@/components/ui/card";
import { ImagesComingSoon } from "@/components/ui/images-coming-soon";
import { isLocale, type Locale } from "@/config/locales";
import {
  formatPrice,
  listPublishedPropertiesPaged,
  type PropertyView,
} from "@/lib/data/properties";
import {
  getPublishedProjectBySlug,
  listPublishedProjects,
  type ProjectPoi,
  type ProjectView,
} from "@/lib/data/projects";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildPageMetadata,
  fillTemplate,
  localePath,
} from "@/lib/i18n/metadata";
import {
  getFeaturedLaunchProjectById,
} from "@/lib/launch/content-launch-v1";
import { resolvePresentationImage } from "@/lib/media/presentation-image";
import { localizeFacilityLabel } from "@/lib/i18n/facility-labels";
import {
  getProjectLocalMedia,
  resolveProjectHeroSrc,
} from "@/lib/projects/local-media";
import {
  evidenceClassFor,
  getProjectEvidence,
  hasOfficialGallery,
  hasVerifiedCoordinates,
  mayPresentFact,
  MIN_PRICE_SUMMARY_SAMPLE,
  PROJECT_LISTING_PREVIEW_SIZE,
  type ProjectEvidenceClass,
  type ProjectEvidenceRow,
} from "@/lib/projects/evidence";
import { getProjectPackageFacts } from "@/lib/projects/package-facts";
import {
  facilityZoneHasHeading,
  poiDisplayName,
  type ProjectFacilityZone,
} from "@/lib/projects/normalize-project-content";
import { visibleProjectFaqs } from "@/lib/projects/visible-faq";
import {
  breadcrumbListSchema,
  projectFaqSchema,
  projectSchema,
} from "@/lib/seo/schema";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const title =
    project.seoTitle[lang] || `${project.name[lang]} | GoThailandHome`;
  const description = project.seoDescription[lang] || project.description[lang];

  const base = buildPageMetadata({
    locale: lang,
    title,
    description,
    path: `/projects/${slug}`,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: projectOpenGraphImages(project.ogImagePath),
    },
    twitter: {
      ...base.twitter,
      images: [project.ogImagePath || "/og/projects/placeholder.svg"],
    },
  };
}

function FactCard({
  label,
  value,
  evidence,
}: {
  label: string;
  value: string | null | undefined;
  evidence: ProjectEvidenceClass;
}) {
  const show =
    mayPresentFact(evidence) && value != null && String(value).trim() !== "";
  if (!show) return null;
  return (
    <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
      <dt className="ds-caption text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
        {value}
      </dd>
    </div>
  );
}

function PoiList({
  items,
  locale,
}: {
  items: ProjectPoi[];
  locale: Locale;
}) {
  const rows = items
    .map((item, index) => {
      const label = poiDisplayName(item, locale);
      if (!label) return null;
      return (
        <li
          key={`${label}-${item.distance ?? ""}-${index}`}
          className="flex justify-between gap-4 border-b border-[var(--brand-line)]/70 py-2"
        >
          <span>{label}</span>
          {item.distance ? (
            <span className="shrink-0 text-stone-500">{item.distance}</span>
          ) : null}
        </li>
      );
    })
    .filter(Boolean);

  if (!rows.length) return null;
  return <ul className="space-y-2 text-sm text-stone-700">{rows}</ul>;
}

function FacilityGroup({
  title,
  zones,
  locale,
  dict,
}: {
  title: string;
  zones: ProjectFacilityZone[];
  locale: Locale;
  dict: Dictionary;
}) {
  const items = zones.flatMap((zone) =>
    zone.items
      .map((item) => item[locale] || item.en || item.zh || item.th)
      .filter(Boolean),
  );
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
        {title}
      </h3>
      <div className="mt-3 space-y-4">
        {zones.map((zone, zoneIndex) => (
          <div key={`facility-zone-${title}-${zoneIndex}`}>
            {facilityZoneHasHeading(zone) ? (
              <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                {localizeFacilityLabel(
                  dict,
                  zone.zone[locale] || zone.zone.en,
                )}
              </p>
            ) : null}
            <ul
              className={
                facilityZoneHasHeading(zone)
                  ? "mt-2 flex flex-wrap gap-2"
                  : "flex flex-wrap gap-2"
              }
            >
              {zone.items.map((item, itemIndex) => {
                const raw = item[locale] || item.en || item.zh || item.th;
                if (!raw) return null;
                const label = localizeFacilityLabel(dict, raw);
                return (
                  <li
                    key={`${label}-${itemIndex}`}
                    className="rounded-md bg-[var(--brand-soft)] px-3 py-1 text-sm text-stone-700"
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatStatusLabel(
  raw: string,
  dict?: Dictionary,
): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const statuses = dict?.projectStatuses as Record<string, string> | undefined;
  if (statuses?.[key]?.trim()) return statuses[key];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type PriceBand = {
  total: number;
  min: number | null;
  max: number | null;
};

async function loadPriceBand(
  projectSlug: string,
  listingType: "sale" | "rent",
): Promise<PriceBand> {
  const base = {
    projectSlug,
    listingType,
    verifiedOnly: true as const,
    page: 1,
  };
  const page = await listPublishedPropertiesPaged({
    ...base,
    pageSize: 1,
    sort: "newest_verified",
  });
  if (page.total < MIN_PRICE_SUMMARY_SAMPLE) {
    return { total: page.total, min: null, max: null };
  }
  const [low, high] = await Promise.all([
    listPublishedPropertiesPaged({
      ...base,
      pageSize: 1,
      sort: "price_asc",
    }),
    listPublishedPropertiesPaged({
      ...base,
      pageSize: 1,
      sort: "price_desc",
    }),
  ]);
  return {
    total: page.total,
    min: low.items[0]?.priceThb ?? null,
    max: high.items[0]?.priceThb ?? null,
  };
}

async function loadSimilarProjects(project: ProjectView): Promise<ProjectView[]> {
  const seen = new Set<string>([project.slug]);
  const out: ProjectView[] = [];

  const push = (items: ProjectView[]) => {
    for (const item of items) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      out.push(item);
      if (out.length >= 6) return;
    }
  };

  if (project.districtId) {
    push(await listPublishedProjects({ districtId: project.districtId }));
  }
  if (out.length < 6 && project.developer?.slug) {
    push(
      await listPublishedProjects({ developerSlug: project.developer.slug }),
    );
  }
  return out.slice(0, 6);
}

export default async function ProjectLandingPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const [dict, project] = await Promise.all([
    getDictionary(locale),
    getPublishedProjectBySlug(slug),
  ]);

  if (!project) notFound();

  const evidence = getProjectEvidence(slug);
  const packageFacts = getProjectPackageFacts(slug);
  const pl = dict.projectLanding;

  const [
    salePage,
    rentPage,
    saleBand,
    rentBand,
    similar,
    developerProjects,
  ] = await Promise.all([
    listPublishedPropertiesPaged({
      projectSlug: slug,
      listingType: "sale",
      verifiedOnly: true,
      page: 1,
      pageSize: PROJECT_LISTING_PREVIEW_SIZE,
      sort: "newest_verified",
    }),
    listPublishedPropertiesPaged({
      projectSlug: slug,
      listingType: "rent",
      verifiedOnly: true,
      page: 1,
      pageSize: PROJECT_LISTING_PREVIEW_SIZE,
      sort: "newest_verified",
    }),
    loadPriceBand(slug, "sale"),
    loadPriceBand(slug, "rent"),
    loadSimilarProjects(project),
    project.developer?.slug
      ? listPublishedProjects({ developerSlug: project.developer.slug })
      : Promise.resolve([] as ProjectView[]),
  ]);

  const otherDeveloperProjects = developerProjects
    .filter((item) => item.slug !== project.slug)
    .slice(0, 4);

  const projectTitle = project.name[locale] || project.name.en;
  const localMedia = getProjectLocalMedia(project.slug, projectTitle);
  const projectHeroSrc = resolveProjectHeroSrc(
    project.slug,
    projectTitle,
    project.heroImagePath,
  );
  const heroPresentation = resolvePresentationImage({
    primarySrc: projectHeroSrc,
    projectSlug: project.slug,
    projectTitle,
    developerSlug: project.developer?.slug ?? null,
    areaSlug: project.districtSlug ?? null,
  });
  const heroSrc = heroPresentation.src;
  const heroLogoFallback = heroPresentation.kind === "developer";
  /** Real project gallery only — never invent gallery slides from logos/fallbacks. */
  const galleryImages = localMedia.gallery;
  const hasApprovedProjectGallery = galleryImages.length > 0;
  const showHeroPhoto = Boolean(heroSrc);

  const districtLabel =
    project.districtName[locale] ||
    project.location[locale] ||
    project.districtName.en ||
    project.location.en;

  const thaiName = project.name.th?.trim() || null;
  const thaiClass = evidenceClassFor(evidence, "thai_project_name");

  const statusClass = evidenceClassFor(evidence, "project_status");
  const statusValue =
    mayPresentFact(statusClass) && packageFacts.projectStatus
      ? formatStatusLabel(packageFacts.projectStatus, dict)
      : null;

  const typeValue = packageFacts.projectType
    ? formatStatusLabel(packageFacts.projectType, dict)
    : null;

  const completionClass = evidenceClassFor(evidence, "completion_year");
  const buildingsClass = evidenceClassFor(evidence, "building_count");
  const floorsClass = evidenceClassFor(evidence, "floor_count");
  const unitsClass = evidenceClassFor(evidence, "total_units");
  const addressClass = evidenceClassFor(evidence, "full_address");
  const districtClass = evidenceClassFor(evidence, "district");
  const subdistrictClass = evidenceClassFor(evidence, "subdistrict");
  const developerClass = evidenceClassFor(evidence, "developer_relation");
  const unitTypesClass = evidenceClassFor(evidence, "unit_types");
  const facilitiesClass = evidenceClassFor(evidence, "official_facilities");
  const websiteClass = evidenceClassFor(evidence, "official_project_url");

  const subdistrictValue =
    mayPresentFact(subdistrictClass) && packageFacts.subdistrict
      ? packageFacts.subdistrict[locale] ||
        packageFacts.subdistrict.en ||
        packageFacts.subdistrict.zh ||
        packageFacts.subdistrict.th ||
        null
      : null;

  const coordsVerified = hasVerifiedCoordinates(evidence);
  const mapReady =
    coordsVerified &&
    project.latitude != null &&
    project.longitude != null;

  const officialFacilities =
    facilitiesClass === "OFFICIAL" ? packageFacts.facilitiesOfficial : [];
  const portalFacilities =
    facilitiesClass === "VERIFIED_PORTAL" ||
    facilitiesClass === "OFFICIAL" ||
    project.facilities.some((zone) => Boolean(zone.source))
      ? project.facilities
      : facilitiesClass === "DERIVED"
        ? project.facilities
        : [];

  const nearbyTransport = project.transportation;
  const nearbyPlaces = [
    ...project.nearbyMalls,
    ...project.nearbySchools,
    ...project.nearbyHospitals,
  ];
  const hasNearby =
    project.transitTags.length > 0 ||
    nearbyTransport.length > 0 ||
    nearbyPlaces.length > 0;

  const officialWebsite =
    mayPresentFact(websiteClass) && project.officialWebsite
      ? project.officialWebsite
      : mayPresentFact(developerClass) && project.developer?.website
        ? project.developer.website
        : null;

  const visibleFaqs = visibleProjectFaqs(locale, project.faq);
  const hasSuitableFor = Boolean(getFeaturedLaunchProjectById(project.slug));
  const sectionLinks: Array<{ id: string; label: string }> = [
    {
      id: "gallery",
      label: hasApprovedProjectGallery
        ? dict.property.gallery
        : dict.common.imagesComingSoon,
    },
    { id: "overview", label: pl.specs },
    ...(hasSuitableFor
      ? [{ id: "suitable-for", label: pl.suitableForTitle }]
      : []),
    ...(mayPresentFact(unitTypesClass) && project.unitTypes.length > 0
      ? [{ id: "units", label: pl.unitTypes }]
      : []),
    { id: "listings", label: pl.listings },
    { id: "price", label: pl.priceSummary },
    { id: "map", label: pl.map },
    { id: "facilities", label: pl.facilities },
    { id: "nearby", label: pl.nearby },
    { id: "developer", label: pl.developer },
    ...(officialWebsite
      ? [{ id: "sources", label: pl.sourcesTitle }]
      : []),
    { id: "related-projects", label: pl.similar },
    ...(visibleFaqs.length ? [{ id: "faq", label: pl.faq }] : []),
    { id: "lead", label: pl.ctaLead },
  ];

  const keyFacts: Array<{
    label: string;
    value: string | null;
    evidence: ProjectEvidenceClass;
  }> = [
    {
      label: pl.projectType,
      value: typeValue,
      evidence: "UNVERIFIED" as ProjectEvidenceClass,
    },
    {
      label: pl.buildings,
      value:
        mayPresentFact(buildingsClass) && project.buildingCount != null
          ? String(project.buildingCount)
          : null,
      evidence: buildingsClass,
    },
    {
      label: pl.floors,
      value:
        mayPresentFact(floorsClass) && project.totalFloors != null
          ? String(project.totalFloors)
          : null,
      evidence: floorsClass,
    },
    {
      label: pl.units,
      value:
        mayPresentFact(unitsClass) && project.totalUnits != null
          ? project.totalUnits.toLocaleString()
          : null,
      evidence: unitsClass,
    },
    {
      label: pl.completion,
      value:
        mayPresentFact(completionClass) && project.completionYear != null
          ? String(project.completionYear)
          : null,
      evidence: completionClass,
    },
    {
      label: pl.projectStatus,
      value: statusValue,
      evidence: statusClass,
    },
    {
      label: pl.address,
      value:
        mayPresentFact(addressClass) && project.address[locale]
          ? project.address[locale]
          : mayPresentFact(addressClass) && project.address.en
            ? project.address.en
            : null,
      evidence: addressClass,
    },
  ];

  function renderListingPreview(
    title: string,
    items: PropertyView[],
    total: number,
    listingType: "sale" | "rent",
  ) {
    const href = localePath(
      locale,
      `/properties?project=${encodeURIComponent(slug)}&listing_type=${listingType}`,
    );
    return (
      <div data-slot={`project-listings-${listingType}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {title}
          </h3>
          <p className="text-sm text-stone-600">
            {fillTemplate(pl.listingsCount, { count: String(total) })}
          </p>
        </div>
        {items.length ? (
          <div className="mt-4">
            <PropertyGrid
              locale={locale}
              dict={dict}
              properties={items.slice(0, PROJECT_LISTING_PREVIEW_SIZE)}
              imagePriorityCount={0}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">{pl.listingsEmpty}</p>
        )}
        {total > 0 ? (
          <Link
            href={href}
            className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
          >
            {pl.listingsViewAll}
          </Link>
        ) : null}
      </div>
    );
  }

  function renderPriceBand(
    label: string,
    band: PriceBand,
    listingType: "sale" | "rent",
  ) {
    const ready =
      band.total >= MIN_PRICE_SUMMARY_SAMPLE &&
      band.min != null &&
      band.max != null;
    return (
      <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
        <p className="ds-caption text-stone-500">{label}</p>
        {ready ? (
          <>
            <p className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
              {fillTemplate(pl.priceRange, {
                min: formatPrice(band.min!, locale, listingType),
                max: formatPrice(band.max!, locale, listingType),
              })}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {fillTemplate(pl.priceFromSample, {
                count: String(band.total),
              })}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-stone-600">
            {pl.priceSummaryInsufficient}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--brand-canvas)] pb-24" data-slot="project-center">
      <JsonLd
        data={[
          projectSchema({
            locale,
            project,
            name: project.name[locale] || project.name.en,
            description:
              project.seoDescription[locale] ||
              project.description[locale] ||
              project.description.en,
          }),
          breadcrumbListSchema(locale, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.projects, path: "/projects" },
            { name: project.name[locale] || project.name.en },
          ]),
          ...(() => {
            const faq = projectFaqSchema(locale, project);
            return faq ? [faq] : [];
          })(),
        ]}
      />
      <AdsTrackingPlaceholders
        pagePath={`/projects/${slug}`}
        projectSlug={slug}
      />

      <div className="ds-container pt-6">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: localePath(locale) },
            {
              label: dict.nav.projects,
              href: localePath(locale, "/projects"),
            },
            { label: project.name[locale] || project.name.en },
          ]}
        />
      </div>

      {/* 1. Project hero */}
      <section
        className="border-b border-[var(--brand-line)]"
        data-slot="project-hero"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-14">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{pl.centerEyebrow}</Badge>
              {statusValue ? (
                <Badge tone="brand">{statusValue}</Badge>
              ) : null}
            </div>
            <h1 className="font-heading mt-3 text-4xl text-[var(--brand-deep)] sm:text-5xl">
              {project.name[locale] || project.name.en}
            </h1>
            {thaiName && mayPresentFact(thaiClass) ? (
              <p className="mt-2 text-lg text-stone-600">{thaiName}</p>
            ) : null}
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {mayPresentFact(developerClass) && project.developer ? (
                <div>
                  <dt className="ds-caption text-stone-500">{pl.developer}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {project.developer.name[locale] ||
                      project.developer.name.en}
                  </dd>
                </div>
              ) : null}
              {mayPresentFact(districtClass) && districtLabel ? (
                <div>
                  <dt className="ds-caption text-stone-500">{pl.district}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {districtLabel}
                  </dd>
                </div>
              ) : null}
              {statusValue ? (
                <div>
                  <dt className="ds-caption text-stone-500">{pl.projectStatus}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {statusValue}
                  </dd>
                </div>
              ) : null}
              {mayPresentFact(completionClass) &&
              project.completionYear != null ? (
                <div>
                  <dt className="ds-caption text-stone-500">{pl.completion}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {project.completionYear}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#lead"
                className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
              >
                {pl.ctaLead}
              </a>
              <Link
                href={localePath(locale, "/find-my-home")}
                className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-deep)]/20 bg-white/70 px-5 text-sm font-medium text-[var(--brand-deep)]"
              >
                {pl.findMyHome}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white">
            {showHeroPhoto ? (
              <div
                className="relative aspect-[16/10] bg-[var(--brand-soft)]"
                data-media-fit={heroLogoFallback ? "contain" : "cover"}
              >
                <Image
                  src={heroSrc!}
                  alt={projectTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className={
                    heroLogoFallback ? "object-contain p-8" : "object-cover"
                  }
                  priority
                  fetchPriority="high"
                  unoptimized
                />
              </div>
            ) : (
              <ImagesComingSoon
                title={dict.common.imagesComingSoon}
                body={dict.common.imagesComingSoonBody}
                className="rounded-none border-0"
              />
            )}
          </div>
        </div>
      </section>

      <nav
        className="border-b border-[var(--brand-line)] bg-white/70"
        aria-label={pl.sectionNav}
        data-slot="project-section-nav"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
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

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-12">
          {/* Gallery — hide empty modules; professional notice when no approved photos */}
          <section
            id="gallery"
            className="scroll-mt-24 space-y-4"
            aria-labelledby="gallery-heading"
            data-slot={
              hasApprovedProjectGallery
                ? "project-gallery"
                : "project-gallery-coming-soon"
            }
          >
            <h2
              id="gallery-heading"
              className="ds-h2 text-2xl sm:text-3xl"
            >
              {hasApprovedProjectGallery
                ? dict.property.gallery
                : dict.common.imagesComingSoon}
            </h2>
            {hasApprovedProjectGallery ? (
              <ListingGallery
                locale={locale}
                dict={dict}
                title={projectTitle}
                propertyType="condo"
                images={galleryImages}
                imageSource={
                  hasOfficialGallery(evidence)
                    ? dict.common.imageSource
                    : null
                }
              />
            ) : (
              <ImagesComingSoon
                title={dict.common.imagesComingSoon}
                body={dict.common.imagesComingSoonBody}
              />
            )}
          </section>

          {/* 2. Key project facts */}
          <section
            id="overview"
            className="scroll-mt-24"
            aria-labelledby="project-facts-heading"
          >
            <h2 id="project-facts-heading" className="ds-h2 text-2xl">
              {pl.specs}
            </h2>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {keyFacts.map((fact) => (
                  <FactCard
                    key={fact.label}
                    label={fact.label}
                    value={fact.value}
                    evidence={fact.evidence}
                  />
                ))}
            </dl>
            {keyFacts.every((fact) => !fact.value) ? (
              <p
                className="mt-4 text-sm text-stone-600"
                data-slot="facts-unavailable-note"
              >
                {pl.factsPendingNote}{" "}
                <a
                  href="#lead"
                  className="font-medium text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {pl.factsEnquireNote}
                </a>
              </p>
            ) : keyFacts.some((fact) => !fact.value) ? (
              <p
                className="mt-4 text-sm text-stone-600"
                data-slot="facts-partial-note"
              >
                {pl.factsPartialNote}
              </p>
            ) : null}
          </section>

          <ProjectSuitableFor
            locale={locale}
            dict={dict}
            projectSlug={project.slug}
            citySlug="bangkok"
          />

          {/* 2b. Unit types */}
          {mayPresentFact(unitTypesClass) && project.unitTypes.length > 0 ? (
          <section
            id="units"
            className="scroll-mt-24"
            aria-labelledby="project-units-heading"
          >
            <h2 id="project-units-heading" className="ds-h2 text-2xl">
              {pl.unitTypes}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.unitTypes.map((unit, index) => (
                <li
                  key={`${unit.code}-${index}`}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                >
                  <p className="font-medium text-[var(--brand-deep)]">
                    {unit.label[locale] || unit.label.en || unit.code}
                  </p>
                  {unit.area_sqm > 0 ? (
                    <p className="text-sm text-stone-600">
                      {unit.area_sqm} {dict.common.sqm}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          ) : null}

          {/* 3. Available listings */}
          <section
            id="listings"
            className="scroll-mt-24"
            aria-labelledby="project-listings-heading"
          >
            <h2 id="project-listings-heading" className="ds-h2 text-2xl">
              {pl.listings}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{pl.listingsNote}</p>
            <div className="mt-6 space-y-10">
              {renderListingPreview(
                pl.listingsSale,
                salePage.items,
                salePage.total,
                "sale",
              )}
              {renderListingPreview(
                pl.listingsRent,
                rentPage.items,
                rentPage.total,
                "rent",
              )}
            </div>
          </section>

          {/* 4. Price summary */}
          <section
            id="price"
            className="scroll-mt-24"
            aria-labelledby="project-price-heading"
          >
            <h2 id="project-price-heading" className="ds-h2 text-2xl">
              {pl.priceSummary}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{pl.priceSummaryNote}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {renderPriceBand(pl.listingsSale, saleBand, "sale")}
              {renderPriceBand(pl.listingsRent, rentBand, "rent")}
            </div>
          </section>

          {/* 5. Location */}
          <section
            id="map"
            className="scroll-mt-24"
            aria-labelledby="project-map-heading"
          >
            <h2 id="project-map-heading" className="ds-h2 text-2xl">
              {pl.map}
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {mayPresentFact(districtClass) && districtLabel ? (
                <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
                  <dt className="ds-caption text-stone-500">{pl.district}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {districtLabel}
                  </dd>
                  {project.districtSlug ? (
                    <Link
                      href={localePath(
                        locale,
                        `/districts/${project.districtSlug}`,
                      )}
                      className="mt-2 inline-flex text-sm text-[var(--brand)] hover:underline"
                    >
                      {districtLabel}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {subdistrictValue ? (
                <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
                  <dt className="ds-caption text-stone-500">{pl.subdistrict}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {subdistrictValue}
                  </dd>
                </div>
              ) : null}
              {mayPresentFact(addressClass) &&
              (project.address[locale] || project.address.en) ? (
                <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 sm:col-span-2">
                  <dt className="ds-caption text-stone-500">{pl.address}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
                    {project.address[locale] || project.address.en}
                  </dd>
                </div>
              ) : null}
            </dl>

            {project.transitTags.length || nearbyTransport.length ? (
              <div className="mt-4">
                <p className="ds-caption text-stone-500">{pl.transit}</p>
                <div className="mt-2 space-y-3">
                  {project.transitTags.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {project.transitTags.map((tag) => (
                        <li key={tag}>
                          <Badge tone="neutral">{tag.toUpperCase()}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <PoiList items={nearbyTransport} locale={locale} />
                </div>
              </div>
            ) : null}

            {mapReady ? (
              <SurfaceCard className="mt-5 p-4!" data-slot="project-map">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[var(--brand-deep)]">
                    {pl.mapVerified}
                  </p>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {project.latitude}, {project.longitude}
                </p>
                {project.googleMapsUrl ? (
                  <a
                    href={project.googleMapsUrl}
                    className="mt-2 inline-flex text-sm text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Maps
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`}
                    className="mt-2 inline-flex text-sm text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Maps
                  </a>
                )}
              </SurfaceCard>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                {coordsVerified ? pl.mapMissing : pl.mapUnverified}
              </p>
            )}
          </section>

          {/* 6. Facilities */}
          <section
            id="facilities"
            className="scroll-mt-24"
            aria-labelledby="project-facilities-heading"
          >
            <h2 id="project-facilities-heading" className="ds-h2 text-2xl">
              {pl.facilities}
            </h2>
            <div className="mt-5 space-y-8">
              <FacilityGroup
                title={pl.facilitiesOfficial}
                zones={officialFacilities}
                locale={locale}
                dict={dict}
              />
              <FacilityGroup
                title={pl.facilitiesPortal}
                zones={
                  facilitiesClass === "OFFICIAL"
                    ? portalFacilities.filter((zone) => Boolean(zone.source))
                    : portalFacilities
                }
                locale={locale}
                dict={dict}
              />
            </div>
          </section>

          {/* 7. Nearby places */}
          <section
            id="nearby"
            className="scroll-mt-24"
            aria-labelledby="project-nearby-heading"
          >
            <h2 id="project-nearby-heading" className="ds-h2 text-2xl">
              {pl.nearby}
            </h2>
            {hasNearby ? (
              <div className="mt-4 grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                    {pl.transport}
                  </h3>
                  <div className="mt-2">
                    <PoiList items={nearbyTransport} locale={locale} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                    {pl.malls}
                  </h3>
                  <div className="mt-2">
                    <PoiList items={project.nearbyMalls} locale={locale} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                    {pl.schools}
                  </h3>
                  <div className="mt-2">
                    <PoiList items={project.nearbySchools} locale={locale} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                    {pl.hospitals}
                  </h3>
                  <div className="mt-2">
                    <PoiList items={project.nearbyHospitals} locale={locale} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-500">{pl.nearbyMissing}</p>
            )}
          </section>

          {/* 8. Developer */}
          <section
            id="developer"
            className="scroll-mt-24"
            aria-labelledby="project-developer-heading"
          >
            <h2 id="project-developer-heading" className="ds-h2 text-2xl">
              {pl.developer}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{pl.developerDisclaimer}</p>
            {mayPresentFact(developerClass) && project.developer ? (
              <SurfaceCard className="mt-4 p-5!">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--brand-deep)]">
                    {project.developer.legalName[locale] ||
                      project.developer.name[locale]}
                  </p>
                </div>
                {project.developer.description[locale] ? (
                  <p className="mt-2 text-sm text-stone-700">
                    {project.developer.description[locale]}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link
                    href={localePath(
                      locale,
                      `/developers/${project.developer.slug}`,
                    )}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {project.developer.name[locale]}
                  </Link>
                  {officialWebsite ? (
                    <a
                      href={officialWebsite}
                      className="text-[var(--brand)] hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {pl.officialSite}
                    </a>
                  ) : null}
                  <Link
                    href={localePath(locale, "/partners/developers")}
                    className="text-[var(--brand)] hover:underline"
                  >
                    {pl.developerPartner}
                  </Link>
                </div>
                {otherDeveloperProjects.length ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                      {pl.developerOther}
                    </h3>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {otherDeveloperProjects.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={localePath(locale, `/projects/${item.slug}`)}
                            className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
                          >
                            {item.name[locale] || item.name.en}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </SurfaceCard>
            ) : null}
          </section>

          {officialWebsite ? (
            <section
              id="sources"
              className="scroll-mt-24"
              aria-labelledby="project-sources-heading"
              data-slot="project-sources"
            >
              <h2 id="project-sources-heading" className="ds-h2 text-2xl">
                {pl.sourcesTitle}
              </h2>
              <p className="mt-2 text-sm text-stone-600">{pl.sourcesNote}</p>
              <SurfaceCard className="mt-4 space-y-2 p-5!">
                <p className="text-xs tracking-wide text-stone-500 uppercase">
                  {pl.sourcesOfficial}
                </p>
                <a
                  href={officialWebsite}
                  className="break-all text-sm font-medium text-[var(--brand)] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {officialWebsite}
                </a>
              </SurfaceCard>
            </section>
          ) : null}

          {/* 10. Related projects */}
          <section
            id="related-projects"
            className="scroll-mt-24"
            aria-labelledby="project-similar-heading"
          >
            <h2 id="project-similar-heading" className="ds-h2 text-2xl">
              {pl.similar}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{pl.similarNote}</p>
            {similar.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((item) => {
                  const href = localePath(locale, `/projects/${item.slug}`);
                  const name = item.name[locale] || item.name.en;
                  const meta =
                    item.developer?.name[locale] ||
                    item.districtName[locale] ||
                    item.location[locale] ||
                    null;
                  return (
                    <ProjectCardShell key={item.slug} className="relative">
                      <Link
                        href={href}
                        className="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                        aria-label={name}
                        data-card-link="project"
                      />
                      <p className="relative font-medium text-[var(--brand-deep)] pointer-events-none">
                        {name}
                      </p>
                      {meta ? (
                        <p className="relative text-sm text-stone-600 pointer-events-none">
                          {meta}
                        </p>
                      ) : null}
                    </ProjectCardShell>
                  );
                })}
              </div>
            ) : null}
          </section>

          {/* FAQ when present */}
          {visibleFaqs.length ? (
            <section
              id="faq"
              className="scroll-mt-24"
              aria-labelledby="project-faq-heading"
            >
              <h2 id="project-faq-heading" className="ds-h2 text-2xl">
                {pl.faq}
              </h2>
              <div className="mt-4 space-y-4">
                {visibleFaqs.map((item, index) => (
                  <details
                    key={`faq-${index}`}
                    className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                  >
                    <summary className="cursor-pointer font-medium text-[var(--brand-deep)]">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm text-stone-700">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* 11. Find My Home CTA */}
          <SurfaceCard className="p-5!" data-slot="find-my-home" id="find-my-home">
            <h2 className="ds-h3 text-xl">{pl.findMyHome}</h2>
            <p className="mt-2 text-sm text-stone-600">{pl.findMyHomeBody}</p>
            <Link
              href={localePath(locale, "/find-my-home")}
              className="mt-4 inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
            >
              {pl.findMyHome}
            </Link>
          </SurfaceCard>

          {/* Trust trail — Knowledge · Developer · Area · Contact */}
          <SurfaceCard className="p-5!" data-slot="project-trust-trail">
            <h2 className="ds-h3 text-xl">{pl.trustTrailTitle}</h2>
            <p className="mt-2 text-sm text-stone-600">{pl.trustTrailBody}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {project.developer?.slug ? (
                <li>
                  <Link
                    href={localePath(
                      locale,
                      `/developers/${project.developer.slug}`,
                    )}
                    className="text-[var(--brand)] underline-offset-2 hover:underline"
                    data-slot="trust-developer-link"
                  >
                    {project.developer.name[locale] ||
                      project.developer.name.en}
                  </Link>
                </li>
              ) : null}
              {project.districtSlug ? (
                <li>
                  <Link
                    href={localePath(
                      locale,
                      `/districts/${project.districtSlug}`,
                    )}
                    className="text-[var(--brand)] underline-offset-2 hover:underline"
                    data-slot="trust-district-link"
                  >
                    {districtLabel}
                  </Link>
                </li>
              ) : null}
              <li>
                <Link
                  href={localePath(locale, "/cities/bangkok")}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                  data-slot="trust-area-link"
                >
                  {pl.trustTrailArea}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(locale, "/contact")}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                  data-slot="trust-contact-link"
                >
                  {dict.common.contactCta}
                </Link>
              </li>
            </ul>
          </SurfaceCard>

          {/* Buyer guides — internal knowledge links */}
          <SurfaceCard className="p-5!" data-slot="project-knowledge-links">
            <h2 className="ds-h3 text-xl">{dict.contentLinks.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/thailand-property-buying-guide",
                  )}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {dict.contentLinks.buyingGuide}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/foreign-ownership-thailand",
                  )}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {dict.contentLinks.foreignOwnership}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/thailand-condo-guide",
                  )}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {dict.contentLinks.condoGuide}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/thailand-developer-guide",
                  )}
                  className="text-[var(--brand)] underline-offset-2 hover:underline"
                >
                  {dict.contentLinks.developerGuide}
                </Link>
              </li>
            </ul>
          </SurfaceCard>

          {/* 12. Project support — A official / B platform */}
          <SurfaceCard className="p-5!" data-slot="contact-official">
            <h2 className="ds-h3 text-xl">{pl.contactOfficial}</h2>
            {officialWebsite ||
            (mayPresentFact(developerClass) && project.developer) ? (
              <div className="mt-3 space-y-2 text-sm text-stone-700">
                {mayPresentFact(developerClass) && project.developer ? (
                  <p className="font-medium text-[var(--brand-deep)]">
                    {project.developer.name[locale] || project.developer.name.en}
                  </p>
                ) : null}
                {officialWebsite ? (
                  <a
                    href={officialWebsite}
                    className="inline-flex text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pl.officialSite}
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                {pl.contactOfficialMissing}
              </p>
            )}
          </SurfaceCard>

          <div data-slot="contact-platform" id="platform-support">
            <h2 className="ds-h3 mb-3 text-xl">{pl.contactPlatform}</h2>
            <p className="mb-3 text-sm text-stone-600">{pl.contactPlatformNote}</p>
            <PlatformCustomerSuccess locale={locale} dict={dict} />
            <div className="mt-4">
              <AiConcierge dict={dict} />
            </div>
          </div>

          <div id="lead" className="scroll-mt-24">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6">
                  {pl.leadTitle}
                </div>
              }
            >
              <ProjectLeadForm
                locale={locale}
                projectId={project.id}
                projectSlug={project.slug}
                projectTitle={projectTitle}
                dict={dict}
              />
            </Suspense>
          </div>
        </aside>
      </div>
      <ProjectStickyContact
        locale={locale}
        dict={dict}
        projectSlug={project.slug}
        projectTitle={projectTitle}
      />
    </div>
  );
}
