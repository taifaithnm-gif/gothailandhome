import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroSearch } from "@/components/listings/hero-search";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { listCities } from "@/lib/data/geography";
import { listPublishedProjects } from "@/lib/data/projects";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

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
  const [cities, developers, projects, featured, latest, sale, rent] =
    await Promise.all([
      listCities(),
      listPublishedDevelopers(),
      listPublishedProjects(),
      listPublishedProperties({
        featuredOnly: true,
        verifiedOnly: true,
        sort: "featured",
      }),
      listPublishedProperties({ verifiedOnly: true, sort: "newest" }),
      listPublishedProperties({
        listingType: "sale",
        verifiedOnly: true,
        sort: "newest",
      }),
      listPublishedProperties({
        listingType: "rent",
        verifiedOnly: true,
        sort: "newest",
      }),
    ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--brand-line)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#063d38_0%,#0a5c54_42%,#1d7a6d_72%,#c9a227_140%)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_15%_20%,white_0,transparent_28%),radial-gradient(circle_at_85%_15%,#e0b34d_0,transparent_22%)] opacity-35" />
        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-end gap-8 px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl space-y-4 text-white">
            <p className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl">
              {dict.common.brand}
            </p>
            <h1 className="max-w-xl text-2xl leading-snug font-medium text-white/95 sm:text-3xl">
              {dict.home.headline}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              {dict.home.subheadline}
            </p>
          </div>
          <HeroSearch locale={lang} dict={dict} cities={cities} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
              {dict.home.featuredProjectsTitle}
            </h2>
            <p className="mt-2 text-stone-600">
              {dict.home.featuredProjectsSubtitle}
            </p>
          </div>
          <Link
            href={localePath(lang, "/projects")}
            className="text-sm text-[var(--brand)] hover:underline"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project) => (
            <Link
              key={project.id}
              href={localePath(lang, `/projects/${project.slug}`)}
              className="rounded-2xl border border-[var(--brand-line)] bg-white p-5 transition hover:border-[var(--brand)]"
            >
              <p className="text-xs tracking-wide text-[var(--brand)] uppercase">
                {project.developer?.name[lang]}
              </p>
              <h3 className="font-heading mt-2 text-xl text-[var(--brand-deep)]">
                {project.name[lang]}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                {project.description[lang]}
              </p>
            </Link>
          ))}
          {!projects.length ? (
            <p className="text-sm text-stone-500">
              {dict.cities.emptyProjects}
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-y border-[var(--brand-line)] bg-white/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8">
            <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
              {dict.home.latestListingsTitle}
            </h2>
            <p className="mt-2 text-stone-600">
              {dict.home.latestListingsSubtitle}
            </p>
          </div>
          <PropertyGrid
            locale={lang}
            dict={dict}
            properties={(featured.length ? featured : latest).slice(0, 6)}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
              {dict.home.citiesTitle}
            </h2>
            <p className="mt-2 text-stone-600">{dict.home.citiesSubtitle}</p>
          </div>
          <Link
            href={localePath(lang, "/cities")}
            className="text-sm text-[var(--brand)] hover:underline"
          >
            {dict.common.viewAll}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={localePath(lang, `/cities/${city.slug}`)}
              className="rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-5 py-8 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
            >
              <span className="font-heading text-xl text-[var(--brand-deep)]">
                {city.name[lang]}
              </span>
              <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                {city.summary[lang]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--brand-line)] bg-white/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
                {dict.home.developersTitle}
              </h2>
              <p className="mt-2 text-stone-600">
                {dict.home.developersSubtitle}
              </p>
            </div>
            <Link
              href={localePath(lang, "/developers")}
              className="text-sm text-[var(--brand)] hover:underline"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((developer) => (
              <Link
                key={developer.id}
                href={localePath(lang, `/developers/${developer.slug}`)}
                className="rounded-2xl border border-[var(--brand-line)] bg-white p-5 hover:border-[var(--brand)]"
              >
                <h3 className="font-heading text-xl text-[var(--brand-deep)]">
                  {developer.name[lang]}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                  {developer.description[lang]}
                </p>
              </Link>
            ))}
            {!developers.length ? (
              <p className="text-sm text-stone-500">{dict.common.noResults}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6">
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.home.buy}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{dict.home.buyBody}</p>
            <PropertyGrid
              locale={lang}
              dict={dict}
              properties={sale.slice(0, 2)}
            />
            <Link
              href={`${localePath(lang, "/properties")}?listing_type=sale`}
              className="mt-4 inline-flex text-sm text-[var(--brand)] hover:underline"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6">
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.home.rent}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{dict.home.rentBody}</p>
            <PropertyGrid
              locale={lang}
              dict={dict}
              properties={rent.slice(0, 2)}
            />
            <Link
              href={`${localePath(lang, "/properties")}?listing_type=rent`}
              className="mt-4 inline-flex text-sm text-[var(--brand)] hover:underline"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="rounded-2xl bg-[var(--brand-deep)] p-6 text-white">
            <h2 className="font-heading text-2xl">{dict.home.investment}</h2>
            <p className="mt-2 text-sm text-white/75">
              {dict.home.investmentBody}
            </p>
            <Link
              href={`${localePath(lang, "/properties")}?listing_type=sale&sort=price_asc`}
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--brand-gold)] px-5 text-sm font-semibold text-[var(--brand-deep)]"
            >
              {dict.home.investmentCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--brand-line)] bg-[var(--brand-soft)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
              {dict.home.ctaTitle}
            </h2>
            <p className="mt-2 max-w-xl text-stone-600">{dict.home.ctaBody}</p>
          </div>
          <Link
            href={localePath(lang, "/contact")}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            {dict.home.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
