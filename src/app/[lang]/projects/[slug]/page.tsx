import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  AdsTrackingPlaceholders,
  projectOpenGraphImages,
} from "@/components/ads/ads-tracking-placeholders";
import { ProjectLeadForm } from "@/components/projects/project-lead-form";
import { isLocale, type Locale } from "@/config/locales";
import {
  getPublishedProjectBySlug,
  listPublishedPropertiesForProject,
  type ProjectPoi,
  type ProjectView,
} from "@/lib/data/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  facilityZoneHasHeading,
  poiDisplayName,
} from "@/lib/projects/normalize-project-content";

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

function PoiList({ items, locale }: { items: ProjectPoi[]; locale: Locale }) {
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

function SpecGrid({
  project,
  locale,
  dict,
}: {
  project: ProjectView;
  locale: Locale;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const specs = [
    {
      label: dict.projectLanding.completion,
      value: project.completionYear?.toString() ?? "—",
    },
    {
      label: dict.projectLanding.floors,
      value: project.totalFloors?.toString() ?? "—",
    },
    {
      label: dict.projectLanding.units,
      value: project.totalUnits?.toLocaleString() ?? "—",
    },
    {
      label: dict.projectLanding.buildings,
      value: project.buildingCount?.toString() ?? "—",
    },
    {
      label: dict.projectLanding.land,
      value: project.landAreaRai
        ? `${project.landAreaRai} ${dict.projectLanding.rai}`
        : "—",
    },
    {
      label: dict.projectLanding.parking,
      value: project.parkingSpaces?.toLocaleString() ?? "—",
    },
    {
      label: dict.projectLanding.commonFee,
      value:
        project.commonFeeThbPerSqm != null
          ? `${project.commonFeeThbPerSqm} ${dict.projectLanding.thbPerSqm}`
          : "—",
    },
    {
      label: dict.projectLanding.ceiling,
      value:
        project.ceilingHeightM != null ? `${project.ceilingHeightM} m` : "—",
    },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {specs.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-[var(--brand-soft)] px-4 py-3"
        >
          <dt className="text-xs tracking-wide text-stone-500 uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 font-medium text-[var(--brand-deep)]">
            {item.value}
          </dd>
        </div>
      ))}
      <div className="rounded-xl bg-[var(--brand-soft)] px-4 py-3 sm:col-span-2 lg:col-span-4">
        <dt className="text-xs tracking-wide text-stone-500 uppercase">
          {dict.common.location}
        </dt>
        <dd className="mt-1 font-medium text-[var(--brand-deep)]">
          {project.address[locale]}
        </dd>
      </div>
    </dl>
  );
}

function formatPrice(price: number, listingType: string, locale: Locale) {
  const formatted = new Intl.NumberFormat(
    locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-US",
  ).format(price);
  return listingType === "rent" ? `${formatted} / mo` : formatted;
}

export default async function ProjectLandingPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, project] = await Promise.all([
    getDictionary(lang),
    getPublishedProjectBySlug(slug),
  ]);

  if (!project) notFound();

  const listings = await listPublishedPropertiesForProject(project.id);
  const saleListings = listings.filter((item) => item.listing_type === "sale");
  const rentListings = listings.filter((item) => item.listing_type === "rent");

  return (
    <div className="bg-[var(--brand-canvas)]">
      <AdsTrackingPlaceholders
        pagePath={`/projects/${slug}`}
        projectSlug={slug}
      />

      <section className="relative overflow-hidden border-b border-[var(--brand-line)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,83,90,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(180,120,60,0.16),transparent_40%),linear-gradient(180deg,#f7f3ec,#efe7db)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <p className="text-sm tracking-[0.18em] text-[var(--brand)] uppercase">
              {project.developer?.name[lang] || dict.projectLanding.developer}
            </p>
            <h1 className="font-heading mt-3 text-4xl text-[var(--brand-deep)] sm:text-5xl">
              {project.name[lang]}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-stone-700 sm:text-lg">
              {project.description[lang]}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#lead"
                className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
              >
                {dict.projectLanding.ctaLead}
              </a>
              <Link
                href={localePath(lang, "/properties")}
                className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-deep)]/20 bg-white/70 px-5 text-sm font-medium text-[var(--brand-deep)]"
              >
                {dict.nav.properties}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/40 bg-white/50 shadow-[0_20px_60px_rgba(40,30,10,0.12)]">
            <Image
              src={
                project.heroImagePath ||
                "/projects/the-livin-ramkhamhaeng/hero-placeholder.svg"
              }
              alt={project.name[lang]}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-12">
          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.projectLanding.specs}
            </h2>
            <div className="mt-5">
              <SpecGrid project={project} locale={lang} dict={dict} />
            </div>
            {(project.latitude != null && project.longitude != null) ||
            project.googleMapsUrl ? (
              <p className="mt-4 text-sm text-stone-600">
                {dict.projectLanding.coordinates}: {project.latitude},{" "}
                {project.longitude}
                {project.googleMapsUrl ? (
                  <>
                    {" · "}
                    <a
                      href={project.googleMapsUrl}
                      className="text-[var(--brand)] underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google Maps
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.projectLanding.unitTypes}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.unitTypes.map((unit, index) => (
                <li
                  key={`${unit.code}-${index}`}
                  className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                >
                  <p className="font-medium text-[var(--brand-deep)]">
                    {unit.label[lang] || unit.label.en || unit.code}
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

          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.projectLanding.facilities}
            </h2>
            <div className="mt-4 space-y-5">
              {project.facilities.map((zone, zoneIndex) => (
                <div key={`facility-zone-${zoneIndex}`}>
                  {facilityZoneHasHeading(zone) ? (
                    <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
                      {zone.zone[lang] || zone.zone.en}
                    </h3>
                  ) : null}
                  <ul
                    className={
                      facilityZoneHasHeading(zone)
                        ? "mt-2 flex flex-wrap gap-2"
                        : "flex flex-wrap gap-2"
                    }
                  >
                    {zone.items.map((item, itemIndex) => {
                      const label = item[lang] || item.en || item.zh || item.th;
                      if (!label) return null;
                      return (
                        <li
                          key={`${label}-${itemIndex}`}
                          className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm text-stone-700"
                        >
                          {label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
                {dict.projectLanding.transport}
              </h2>
              <div className="mt-3">
                <PoiList items={project.transportation} locale={lang} />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
                {dict.projectLanding.malls}
              </h2>
              <div className="mt-3">
                <PoiList items={project.nearbyMalls} locale={lang} />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
                {dict.projectLanding.schools}
              </h2>
              <div className="mt-3">
                <PoiList items={project.nearbySchools} locale={lang} />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
                {dict.projectLanding.hospitals}
              </h2>
              <div className="mt-3">
                <PoiList items={project.nearbyHospitals} locale={lang} />
              </div>
            </div>
          </section>

          {project.developer ? (
            <section>
              <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
                {dict.projectLanding.developer}
              </h2>
              <p className="mt-2 font-medium text-[var(--brand-deep)]">
                {project.developer.legalName[lang] ||
                  project.developer.name[lang]}
              </p>
              <p className="mt-2 text-stone-700">
                {project.developer.description[lang]}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {project.developer.website ? (
                  <a
                    href={project.developer.website}
                    className="text-[var(--brand)] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {dict.projectLanding.officialSite}
                  </a>
                ) : null}
                {project.developer.facebookUrl ? (
                  <a
                    href={project.developer.facebookUrl}
                    className="text-[var(--brand)] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Facebook
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.projectLanding.listings}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {dict.projectLanding.listingsNote}
            </p>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                  {dict.common.sale}
                </h3>
                <ul className="mt-3 space-y-3">
                  {saleListings.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-[var(--brand-line)] bg-white p-4"
                    >
                      <Link
                        href={localePath(lang, `/properties/${item.slug}`)}
                        className="font-medium text-[var(--brand-deep)] hover:underline"
                      >
                        {lang === "zh"
                          ? item.title_zh
                          : lang === "th"
                            ? item.title_th
                            : item.title_en}
                      </Link>
                      <p className="mt-1 text-sm text-stone-600">
                        ฿{formatPrice(Number(item.price_thb), "sale", lang)}
                        {item.area_sqm
                          ? ` · ${item.area_sqm} ${dict.common.sqm}`
                          : ""}
                        {item.floor_label ? ` · fl. ${item.floor_label}` : ""}
                      </p>
                      {item.source && item.listing_url ? (
                        <p className="mt-2 text-xs text-stone-500">
                          {item.source} ·{" "}
                          <a
                            href={item.listing_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-2 hover:underline"
                          >
                            {dict.projectLanding.sourceLink}
                          </a>
                          {item.source_updated_at
                            ? ` · ${item.source_updated_at.slice(0, 10)}`
                            : ""}
                        </p>
                      ) : null}
                    </li>
                  ))}
                  {!saleListings.length ? (
                    <li className="text-sm text-stone-500">—</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                  {dict.common.rent}
                </h3>
                <ul className="mt-3 space-y-3">
                  {rentListings.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-[var(--brand-line)] bg-white p-4"
                    >
                      <Link
                        href={localePath(lang, `/properties/${item.slug}`)}
                        className="font-medium text-[var(--brand-deep)] hover:underline"
                      >
                        {lang === "zh"
                          ? item.title_zh
                          : lang === "th"
                            ? item.title_th
                            : item.title_en}
                      </Link>
                      <p className="mt-1 text-sm text-stone-600">
                        ฿{formatPrice(Number(item.price_thb), "rent", lang)}
                        {item.area_sqm
                          ? ` · ${item.area_sqm} ${dict.common.sqm}`
                          : ""}
                        {item.floor_label ? ` · fl. ${item.floor_label}` : ""}
                      </p>
                      {item.source && item.listing_url ? (
                        <p className="mt-2 text-xs text-stone-500">
                          {item.source} ·{" "}
                          <a
                            href={item.listing_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-2 hover:underline"
                          >
                            {dict.projectLanding.sourceLink}
                          </a>
                          {item.source_updated_at
                            ? ` · ${item.source_updated_at.slice(0, 10)}`
                            : ""}
                        </p>
                      ) : null}
                    </li>
                  ))}
                  {!rentListings.length ? (
                    <li className="text-sm text-stone-500">—</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.projectLanding.faq}
            </h2>
            <div className="mt-4 space-y-4">
              {project.faq.map((item, index) => {
                const question =
                  item.question[lang] ||
                  item.question.en ||
                  item.question.zh ||
                  item.question.th;
                const answer =
                  item.answer[lang] ||
                  item.answer.en ||
                  item.answer.zh ||
                  item.answer.th;
                if (!question || !answer) return null;
                return (
                  <details
                    key={`faq-${index}`}
                    className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                  >
                    <summary className="cursor-pointer font-medium text-[var(--brand-deep)]">
                      {question}
                    </summary>
                    <p className="mt-2 text-sm text-stone-700">{answer}</p>
                  </details>
                );
              })}
            </div>
          </section>
        </div>

        <aside id="lead" className="lg:sticky lg:top-24 lg:self-start">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6">
                {dict.projectLanding.leadTitle}
              </div>
            }
          >
            <ProjectLeadForm locale={lang} projectId={project.id} dict={dict} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
