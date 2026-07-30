import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale, type Locale } from "@/config/locales";
import {
  cityParagraphs,
  getCityPackage,
  localizedCityFaq,
} from "@/lib/cities/package";
import { getCityBySlug, listDistrictsByCity } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { localizedOrNull, type DistrictAmenity } from "@/lib/districts/package";
import {
  breadcrumbListSchema,
  citySchema,
  platformFaqSchema,
} from "@/lib/seo/schema";

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

function AmenityCards({
  items,
  locale,
  sourceLabel,
}: {
  items: DistrictAmenity[];
  locale: Locale;
  sourceLabel: string;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const name =
          localizedOrNull(item.name, locale) ||
          item.name.en ||
          item.name.th ||
          item.name.zh;
        return (
          <li key={`${name}-${index}`}>
            <SurfaceCard className="h-full space-y-1 p-4!">
              <p className="text-sm font-medium text-[var(--brand-deep)]">
                {name}
                {item.mode ? (
                  <span className="ml-2 text-xs font-normal tracking-wide text-stone-500 uppercase">
                    {item.mode}
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

  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const pkg = getCityPackage(city.slug);

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
  const c = dict.cities;

  const overview = cityParagraphs(pkg.overview, lang);
  const lifestyle = cityParagraphs(pkg.lifestyle, lang);
  const investment = localizedOrNull(pkg.investmentSummary, lang);
  const rental = localizedOrNull(pkg.rentalSummary, lang);

  // Visible FAQ and FAQPage schema stay identical.
  const cityFaqs = localizedCityFaq(pkg.faq, lang);
  const faqSchema = platformFaqSchema(lang, cityFaqs);

  const subtitle =
    localizedOrNull(pkg.summary, lang) || city.summary[lang] || undefined;

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

      {overview.length ? (
        <CitySection id="overview" title={c.overview} note={c.contentNote}>
          <Paragraphs rows={overview} />
        </CitySection>
      ) : null}

      <section className="mt-10 space-y-4" id="districts">
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

      <section className="mt-10 space-y-4" id="projects">
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

      <section className="mt-10 space-y-4" id="listings">
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
          />
        </CitySection>
      ) : null}

      {pkg.schools.length ? (
        <CitySection id="schools" title={c.schools} note={c.amenityNote}>
          <AmenityCards
            items={pkg.schools}
            locale={lang}
            sourceLabel={c.amenitySource}
          />
        </CitySection>
      ) : null}

      {pkg.hospitals.length ? (
        <CitySection id="hospitals" title={c.hospitals} note={c.amenityNote}>
          <AmenityCards
            items={pkg.hospitals}
            locale={lang}
            sourceLabel={c.amenitySource}
          />
        </CitySection>
      ) : null}

      {pkg.shopping.length ? (
        <CitySection id="shopping" title={c.shopping} note={c.amenityNote}>
          <AmenityCards
            items={pkg.shopping}
            locale={lang}
            sourceLabel={c.amenitySource}
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
