import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildPageMetadata,
  fillTemplate,
  localePath,
  propertyTypeLabel,
} from "@/lib/i18n/metadata";
import {
  formatPrice,
  getPropertyById,
  properties,
} from "@/lib/properties";

export function generateStaticParams() {
  return properties.flatMap((property) =>
    ["en", "zh", "th"].map((lang) => ({
      lang,
      id: property.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};

  const property = getPropertyById(id);
  if (!property) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: fillTemplate(dict.meta.propertyDetailTitle, {
      title: property.title[lang],
    }),
    description: fillTemplate(dict.meta.propertyDetailDescription, {
      summary: property.summary[lang],
    }),
    path: `/properties/${property.id}`,
  });
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const property = getPropertyById(id);
  if (!property) notFound();

  const dict = await getDictionary(lang);
  const similar = properties
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  return (
    <PageShell
      title={property.title[lang]}
      subtitle={property.location[lang]}
      notice={dict.common.placeholderNotice}
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--brand-line)]">
            <div className="aspect-[16/9] bg-[linear-gradient(135deg,#063d38_0%,#0a5c54_40%,#e0b34d_140%)]" />
          </div>

          <section className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white p-6">
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.property.overview}
            </h2>
            <p className="leading-relaxed text-stone-600">
              {property.description[lang]}
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-[0_1px_0_rgba(6,61,56,0.04)]">
            <p className="text-sm tracking-wide text-[var(--brand)] uppercase">
              {propertyTypeLabel(dict, property.type)}
            </p>
            <p className="mt-3 font-heading text-3xl text-[var(--brand-deep)]">
              {formatPrice(property.priceThb, lang)}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-stone-600">
              <div>
                <dt>{dict.common.bedrooms}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.bedrooms}
                </dd>
              </div>
              <div>
                <dt>{dict.common.bathrooms}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.bathrooms}
                </dd>
              </div>
              <div>
                <dt>{dict.common.area}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.areaSqm} {dict.common.sqm}
                </dd>
              </div>
              <div>
                <dt>{dict.common.location}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.location[lang]}
                </dd>
              </div>
            </dl>
            <Link
              href={localePath(lang, "/contact")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
            >
              {dict.property.enquire}
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-14 space-y-6">
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.property.similar}
        </h2>
        <PropertyGrid locale={lang} dict={dict} properties={similar} />
      </section>
    </PageShell>
  );
}
