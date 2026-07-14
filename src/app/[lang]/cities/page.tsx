import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { listCities } from "@/lib/data/geography";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/cities">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.citiesTitle,
    description: dict.meta.citiesDescription,
    path: "/cities",
  });
}

export default async function CitiesIndexPage({
  params,
}: PageProps<"/[lang]/cities">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, cities] = await Promise.all([getDictionary(lang), listCities()]);

  return (
    <PageShell title={dict.cities.title} subtitle={dict.cities.subtitle}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <li key={city.id}>
            <Link
              href={localePath(lang, `/cities/${city.slug}`)}
              className="block rounded-2xl border border-[var(--brand-line)] bg-white p-6 transition hover:border-[var(--brand)]"
            >
              <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                {city.name[lang]}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                {city.summary[lang]}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
