import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyGrid } from "@/components/property/property-grid";
import { SearchForm } from "@/components/search/search-form";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { getFeaturedProperties } from "@/lib/properties";

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
  const featured = getFeaturedProperties();

  const destinations = [
    { label: dict.home.bangkok, query: "Bangkok" },
    { label: dict.home.phuket, query: "Phuket" },
    { label: dict.home.chiangMai, query: "Chiang Mai" },
    { label: dict.home.huaHin, query: "Hua Hin" },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--brand-line)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#063d38_0%,#0a5c54_42%,#1d7a6d_72%,#c9a227_140%)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_15%_20%,white_0,transparent_28%),radial-gradient(circle_at_85%_15%,#e0b34d_0,transparent_22%),linear-gradient(transparent_0%,rgb(6_61_56_/0.35)_100%)] opacity-35" />
        <div className="relative mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-end px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl space-y-6 text-white">
            <p className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl">
              {dict.common.brand}
            </p>
            <h1 className="max-w-xl text-2xl leading-snug font-medium text-white/95 sm:text-3xl">
              {dict.home.headline}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              {dict.home.subheadline}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={localePath(lang, "/search")}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand-gold)] px-5 text-sm font-semibold text-[var(--brand-deep)] transition hover:bg-[#f0c666]"
              >
                {dict.common.searchCta}
              </Link>
              <Link
                href={localePath(lang, "/properties")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
              >
                {dict.common.viewAll}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
            {dict.home.featuredTitle}
          </h2>
          <p className="text-stone-600">{dict.home.featuredSubtitle}</p>
        </div>
        <PropertyGrid locale={lang} dict={dict} properties={featured} />
      </section>

      <section className="border-y border-[var(--brand-line)] bg-white/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 max-w-2xl space-y-2">
            <h2 className="font-heading text-3xl text-[var(--brand-deep)]">
              {dict.home.destinationsTitle}
            </h2>
            <p className="text-stone-600">{dict.home.destinationsSubtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.query}
                href={`${localePath(lang, "/search")}?location=${encodeURIComponent(destination.query)}`}
                className="rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-5 py-8 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
              >
                <span className="font-heading text-xl text-[var(--brand-deep)]">
                  {destination.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 rounded-[1.75rem] bg-[var(--brand-deep)] px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl">{dict.home.whyTitle}</h2>
            <p className="max-w-xl text-white/75">{dict.home.whyBody}</p>
          </div>
          <SearchForm locale={lang} dict={dict} />
        </div>
      </section>
    </>
  );
}
