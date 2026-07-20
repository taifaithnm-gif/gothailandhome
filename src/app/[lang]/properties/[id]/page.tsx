import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { CompareButton } from "@/components/compare/compare-button";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ListingContactCard } from "@/components/property/listing-contact-card";
import { ListingGallery } from "@/components/property/listing-gallery";
import { PropertyGrid } from "@/components/property/property-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge, SourceBadge } from "@/components/ui/badge";
import {
  ProjectCardShell,
  SurfaceCard,
} from "@/components/ui/card";
import { isLocale, type Locale } from "@/config/locales";
import {
  formatPrice,
  getAgentById,
  getPublishedPropertyBySlug,
  listPublishedPropertiesPaged,
  type PropertyView,
} from "@/lib/data/properties";
import { getPublishedProjectBySlug } from "@/lib/data/projects";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildPageMetadata,
  fillTemplate,
  localePath,
  propertyTypeLabel,
} from "@/lib/i18n/metadata";
import {
  displayOrUnknown,
  isUnknownFactValue,
  listingFreshnessStatus,
  mayPresentPriceAsCurrent,
} from "@/lib/property/listing-trust";
import {
  poiDisplayName,
  type ProjectPoi,
} from "@/lib/projects/normalize-project-content";
import {
  breadcrumbListSchema,
  listingSchema,
} from "@/lib/seo/schema";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};

  const property = await getPublishedPropertyBySlug(id);
  if (!property) return {};

  const dict = await getDictionary(lang);
  const title = fillTemplate(dict.meta.propertyDetailTitle, {
    title: property.title[lang],
  });
  const description = fillTemplate(dict.meta.propertyDetailDescription, {
    summary: property.summary[lang],
  });

  return buildPageMetadata({
    locale: lang,
    title,
    description,
    path: `/properties/${property.slug}`,
    image: property.coverUrl,
  });
}

function formatEvidenceDate(iso: string | null, locale: Locale) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const tag = locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-GB";
  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function transitLabel(tag: string, dict: Dictionary) {
  const t = tag.toLowerCase();
  if (t === "bts") return dict.listings.bts;
  if (t === "mrt") return dict.listings.mrt;
  return tag;
}

function freshnessMessage(
  status: ReturnType<typeof listingFreshnessStatus>,
  dict: Dictionary,
) {
  switch (status) {
    case "fresh":
      return dict.property.freshnessFresh;
    case "warning":
      return dict.property.freshnessWarning;
    case "expired":
      return dict.property.freshnessExpired;
    default:
      return dict.property.freshnessUnknown;
  }
}

function FactValue({
  value,
  unknown,
}: {
  value: string;
  unknown: string;
}) {
  const missing = isUnknownFactValue(value, unknown);
  return (
    <dd
      className={cn(
        "mt-1 text-sm",
        missing
          ? "font-normal text-stone-500"
          : "font-medium text-[var(--brand-deep)]",
      )}
    >
      {value}
    </dd>
  );
}

function NearbyList({
  items,
  locale,
}: {
  items: ProjectPoi[];
  locale: Locale;
}) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2 text-sm text-stone-700">
      {items.map((item, index) => {
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
      })}
    </ul>
  );
}

async function loadSimilar(property: PropertyView) {
  const tries = [
    property.districtSlug
      ? {
          districtSlug: property.districtSlug,
          listingType: property.listingType,
        }
      : null,
    property.projectSlug
      ? {
          projectSlug: property.projectSlug,
          listingType: property.listingType,
        }
      : null,
    { listingType: property.listingType },
  ].filter(Boolean) as Array<{
    districtSlug?: string;
    projectSlug?: string;
    listingType: PropertyView["listingType"];
  }>;

  for (const opts of tries) {
    const page = await listPublishedPropertiesPaged({
      verifiedOnly: true,
      page: 1,
      pageSize: 6,
      sort: "newest_verified",
      ...opts,
    });
    const items = page.items
      .filter((item) => item.id !== property.id)
      .slice(0, 3);
    if (items.length) return items;
  }
  return [];
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const property = await getPublishedPropertyBySlug(id);
  if (!property) notFound();

  const dict = await getDictionary(lang);
  const unknown = dict.property.unknown;

  const [agent, project, similar] = await Promise.all([
    property.agentId ? getAgentById(property.agentId) : Promise.resolve(null),
    property.projectSlug
      ? getPublishedProjectBySlug(property.projectSlug)
      : Promise.resolve(null),
    loadSimilar(property),
  ]);

  const galleryImages = property.media
    .map((item) => ({
      url: item.public_url,
      alt:
        lang === "zh"
          ? item.alt_zh
          : lang === "th"
            ? item.alt_th
            : item.alt_en,
    }))
    .filter((item) => Boolean(item.url));

  if (!galleryImages.length && property.coverUrl) {
    galleryImages.push({ url: property.coverUrl, alt: property.title[lang] });
  }

  const lastVerified = formatEvidenceDate(property.lastVerifiedAt, lang);
  const sourceUpdated = formatEvidenceDate(property.sourceUpdatedAt, lang);
  const freshness = listingFreshnessStatus(property.lastVerifiedAt);
  const priceIsCurrent = mayPresentPriceAsCurrent({
    isVerifiedListing: property.isVerifiedListing,
    lastVerifiedAt: property.lastVerifiedAt,
  });
  const priceLabel = formatPrice(
    property.priceThb,
    lang,
    property.listingType,
  );
  const priceAsOfDate = lastVerified || sourceUpdated;
  const priceCaption = priceIsCurrent
    ? null
    : priceAsOfDate
      ? dict.property.priceAsOf.replace("{date}", priceAsOfDate)
      : dict.property.priceNotCurrent;

  const areaLabel =
    property.areaSqm != null
      ? `${property.areaSqm} ${dict.common.sqm}`
      : property.landAreaSqm != null
        ? `${property.landAreaSqm} ${dict.common.sqm}`
        : unknown;

  const mapReady =
    project &&
    ((project.latitude != null && project.longitude != null) ||
      project.googleMapsUrl);

  const nearbyTransport = project?.transportation ?? [];
  const nearbyPlaces = [
    ...(project?.nearbyMalls ?? []),
    ...(project?.nearbySchools ?? []),
    ...(project?.nearbyHospitals ?? []),
  ];
  const hasNearby =
    property.transitTags.length > 0 ||
    nearbyTransport.length > 0 ||
    nearbyPlaces.length > 0;

  const facts: Array<{ label: string; value: string }> = [
    {
      label: dict.common.type,
      value: propertyTypeLabel(dict, property.type),
    },
    {
      label: dict.common.sale,
      value:
        property.listingType === "rent"
          ? dict.common.rent
          : dict.common.sale,
    },
    {
      label: dict.common.price,
      value: formatPrice(property.priceThb, lang, property.listingType),
    },
    {
      label: dict.common.bedrooms,
      value: displayOrUnknown(property.bedrooms, unknown),
    },
    {
      label: dict.common.bathrooms,
      value: displayOrUnknown(property.bathrooms, unknown),
    },
    { label: dict.common.area, value: areaLabel },
    {
      label: dict.property.floor,
      value: displayOrUnknown(property.floorLabel, unknown),
    },
    {
      label: dict.property.building,
      value: displayOrUnknown(property.buildingLabel, unknown),
    },
    {
      label: dict.common.location,
      value: displayOrUnknown(property.location[lang], unknown),
    },
    {
      label: dict.property.district,
      value: displayOrUnknown(property.districtName[lang], unknown),
    },
  ];

  return (
    <PageShell
      title={property.title[lang]}
      subtitle={
        property.districtName[lang] ||
        property.location[lang] ||
        property.summary[lang]
      }
    >
      <JsonLd
        data={[
          listingSchema({
            locale: lang,
            property,
            name: property.title[lang],
            description: property.summary[lang] || property.description[lang],
          }),
          breadcrumbListSchema(lang, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.properties, path: "/properties" },
            { name: property.title[lang] },
          ]),
        ]}
      />
      <div className="grid min-h-[40rem] gap-8 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-10">
          {/* 1. Gallery */}
          <ListingGallery
            locale={lang}
            dict={dict}
            title={property.title[lang]}
            propertyType={property.type}
            images={galleryImages}
            imageSource={property.source}
          />

          {/* 2. Key Summary */}
          <SurfaceCard className="p-5!" data-slot="listing-key-summary">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">
                  {property.listingType === "rent"
                    ? dict.common.rent
                    : dict.common.sale}
                </Badge>
                {property.isVerifiedListing ? (
                  <Badge tone="verified">{dict.property.verified}</Badge>
                ) : (
                  <Badge tone="unverified">{dict.property.unverified}</Badge>
                )}
                {property.source ? (
                  <SourceBadge source={property.source} />
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <CompareButton
                  propertyId={property.id}
                  propertySlug={property.slug}
                  dict={dict}
                />
                <FavoriteButton
                  propertyId={property.id}
                  propertySlug={property.slug}
                  dict={dict}
                />
              </div>
            </div>
            <p
              className={cn(
                "font-heading mt-4 text-3xl",
                priceIsCurrent
                  ? "text-[var(--brand-deep)]"
                  : "text-[var(--brand-deep)]/90",
              )}
              data-slot="listing-price"
              data-price-current={priceIsCurrent ? "true" : "false"}
            >
              {priceLabel}
            </p>
            {priceCaption ? (
              <p
                className="mt-2 text-xs text-stone-500"
                data-slot="listing-price-caption"
              >
                {priceCaption}
              </p>
            ) : null}
            <p
              className="mt-2 text-xs text-stone-500"
              data-slot="listing-freshness"
              data-freshness={freshness}
            >
              {freshnessMessage(freshness, dict)}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="ds-caption text-stone-500">
                  {dict.common.area}
                </dt>
                <FactValue value={areaLabel} unknown={unknown} />
              </div>
              <div>
                <dt className="ds-caption text-stone-500">
                  {dict.common.bedrooms}
                </dt>
                <FactValue
                  value={displayOrUnknown(property.bedrooms, unknown)}
                  unknown={unknown}
                />
              </div>
              <div>
                <dt className="ds-caption text-stone-500">
                  {dict.common.bathrooms}
                </dt>
                <FactValue
                  value={displayOrUnknown(property.bathrooms, unknown)}
                  unknown={unknown}
                />
              </div>
              <div>
                <dt className="ds-caption text-stone-500">
                  {dict.property.floor}
                </dt>
                <FactValue
                  value={displayOrUnknown(property.floorLabel, unknown)}
                  unknown={unknown}
                />
              </div>
            </dl>
          </SurfaceCard>

          {/* 3. Property Facts */}
          <section aria-labelledby="listing-facts-heading">
            <h2
              id="listing-facts-heading"
              className="ds-h2 text-2xl"
            >
              {dict.property.facts}
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                >
                  <dt className="ds-caption text-stone-500">{fact.label}</dt>
                  <FactValue value={fact.value} unknown={unknown} />
                </div>
              ))}
            </dl>
            {property.features.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {property.features.map((feature) => {
                  const label =
                    lang === "zh"
                      ? feature.label_zh
                      : lang === "th"
                        ? feature.label_th
                        : feature.label_en;
                  const value =
                    lang === "zh"
                      ? feature.value_zh
                      : lang === "th"
                        ? feature.value_th
                        : feature.value_en;
                  if (!label) return null;
                  return (
                    <li
                      key={feature.id}
                      className="rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand-deep)]"
                    >
                      <span className="font-medium">{label}</span>
                      {value ? `: ${value}` : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {property.description[lang] ? (
              <p className="mt-5 leading-relaxed text-stone-600">
                {property.description[lang]}
              </p>
            ) : null}
          </section>

          {/* 4. Project */}
          <section aria-labelledby="listing-project-heading">
            <h2 id="listing-project-heading" className="ds-h2 text-2xl">
              {dict.property.projectSection}
            </h2>
            <div className="mt-4 grid gap-3">
              {property.projectSlug &&
              (property.projectName[lang] || property.projectName.en) ? (
                <Link
                  href={localePath(lang, `/projects/${property.projectSlug}`)}
                  className="block"
                >
                  <ProjectCardShell className="p-5">
                    <p className="ds-caption text-[var(--brand)]">
                      {dict.property.projectSection}
                    </p>
                    <h3 className="font-heading mt-1 text-xl text-[var(--brand-deep)]">
                      {property.projectName[lang] || property.projectName.en}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--brand)]">
                      {dict.property.viewProject} →
                    </p>
                  </ProjectCardShell>
                </Link>
              ) : (
                <p className="text-sm text-stone-500">{unknown}</p>
              )}

              {property.developerSlug && project?.developer ? (
                <Link
                  href={localePath(
                    lang,
                    `/developers/${property.developerSlug}`,
                  )}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 transition hover:border-[var(--brand)]"
                >
                  <p className="ds-caption text-stone-500">
                    {dict.property.developer}
                  </p>
                  <p className="mt-1 font-medium text-[var(--brand-deep)]">
                    {project.developer.name[lang] ||
                      project.developer.name.en}
                  </p>
                  <p className="mt-1 text-sm text-[var(--brand)]">
                    {dict.property.viewDeveloper} →
                  </p>
                </Link>
              ) : property.developerSlug ? (
                <Link
                  href={localePath(
                    lang,
                    `/developers/${property.developerSlug}`,
                  )}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 transition hover:border-[var(--brand)]"
                >
                  <p className="ds-caption text-stone-500">
                    {dict.property.developer}
                  </p>
                  <p className="mt-1 font-medium text-[var(--brand-deep)]">
                    {property.developerSlug}
                  </p>
                </Link>
              ) : null}

              {property.districtSlug && property.districtName[lang] ? (
                <Link
                  href={localePath(
                    lang,
                    `/districts/${property.districtSlug}`,
                  )}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 transition hover:border-[var(--brand)]"
                >
                  <p className="ds-caption text-stone-500">
                    {dict.property.district}
                  </p>
                  <p className="mt-1 font-medium text-[var(--brand-deep)]">
                    {property.districtName[lang]}
                  </p>
                  <p className="mt-1 text-sm text-[var(--brand)]">
                    {dict.property.viewDistrict} →
                  </p>
                </Link>
              ) : null}
            </div>
          </section>

          {/* 5. Map */}
          <section aria-labelledby="listing-map-heading">
            <h2 id="listing-map-heading" className="ds-h2 text-2xl">
              {dict.property.map}
            </h2>
            {mapReady && project ? (
              <SurfaceCard className="mt-4 space-y-2 p-5!">
                {project.latitude != null && project.longitude != null ? (
                  <p className="text-sm text-stone-600">
                    {dict.projectLanding.coordinates}: {project.latitude},{" "}
                    {project.longitude}
                  </p>
                ) : null}
                {project.googleMapsUrl ? (
                  <a
                    href={project.googleMapsUrl}
                    className="inline-flex text-sm font-medium text-[var(--brand)] underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Maps
                  </a>
                ) : null}
              </SurfaceCard>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                {dict.property.mapMissing}
              </p>
            )}
          </section>

          {/* 6. Nearby */}
          <section aria-labelledby="listing-nearby-heading">
            <h2 id="listing-nearby-heading" className="ds-h2 text-2xl">
              {dict.property.nearby}
            </h2>
            {hasNearby ? (
              <div className="mt-4 space-y-5">
                {property.transitTags.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--brand-deep)]">
                      {dict.property.transit}
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {property.transitTags.map((tag) => (
                        <li key={tag}>
                          <Badge tone="brand">{transitLabel(tag, dict)}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {nearbyTransport.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--brand-deep)]">
                      {dict.projectLanding.transport}
                    </h3>
                    <div className="mt-2">
                      <NearbyList items={nearbyTransport} locale={lang} />
                    </div>
                  </div>
                ) : null}
                {nearbyPlaces.length > 0 ? (
                  <div>
                    <NearbyList items={nearbyPlaces} locale={lang} />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                {dict.property.nearbyMissing}
              </p>
            )}
          </section>

          {/* 10. Source & Verification */}
          <section aria-labelledby="listing-source-heading">
            <h2 id="listing-source-heading" className="ds-h2 text-2xl">
              {dict.property.sourceVerification}
            </h2>
            <SurfaceCard className="mt-4 space-y-2 p-5!" data-slot="listing-source-evidence">
              <div className="flex flex-wrap items-center gap-2">
                {property.isVerifiedListing ? (
                  <Badge tone="verified">{dict.property.verified}</Badge>
                ) : (
                  <Badge tone="unverified">{dict.property.unverified}</Badge>
                )}
                {property.source ? (
                  <SourceBadge source={property.source} />
                ) : (
                  <span className="text-sm text-stone-500">
                    {dict.property.source}: {unknown}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600" data-freshness={freshness}>
                {freshnessMessage(freshness, dict)}
              </p>
              {lastVerified ? (
                <p className="text-sm text-stone-600">
                  {dict.property.lastVerified}: {lastVerified}
                </p>
              ) : (
                <p className="text-sm text-stone-500">
                  {dict.property.lastVerified}: {unknown}
                </p>
              )}
              {sourceUpdated ? (
                <p className="text-sm text-stone-600">
                  {dict.property.sourceUpdated}: {sourceUpdated}
                </p>
              ) : null}
              {property.listingUrl ? (
                <a
                  href={property.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-sm text-sm font-medium text-[var(--brand)] underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                >
                  {dict.property.sourceLink}
                </a>
              ) : null}
            </SurfaceCard>
          </section>
        </div>

        {/* 7–8. Contact + Request Viewing — roles stay distinct */}
        <aside
          className="space-y-4 lg:sticky lg:top-24 lg:self-start"
          data-slot="listing-inquiry-aside"
        >
          <ListingContactCard
            locale={lang}
            dict={dict}
            propertyId={property.id}
            propertySlug={property.slug}
            propertyTitle={property.title[lang] || property.title.en}
            agent={agent}
          />
        </aside>
      </div>

      {/* 9. Find Similar */}
      <section className="mt-14 space-y-6" aria-labelledby="listing-similar-heading">
        <h2 id="listing-similar-heading" className="ds-h2 text-2xl">
          {dict.property.similar}
        </h2>
        <PropertyGrid
          locale={lang}
          dict={dict}
          properties={similar}
          imagePriorityCount={0}
        />
      </section>
    </PageShell>
  );
}
