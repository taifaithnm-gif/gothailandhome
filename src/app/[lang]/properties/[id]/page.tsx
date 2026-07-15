import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ListingContactCard } from "@/components/property/listing-contact-card";
import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import {
  formatPrice,
  getAgentById,
  getPublishedPropertyBySlug,
  listPublishedPropertiesPaged,
} from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildPageMetadata,
  fillTemplate,
  propertyTypeLabel,
} from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};

  const property = await getPublishedPropertyBySlug(id);
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
    path: `/properties/${property.slug}`,
  });
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/[lang]/properties/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const property = await getPublishedPropertyBySlug(id);
  if (!property) notFound();

  const dict = await getDictionary(lang);
  const agent = property.agentId
    ? await getAgentById(property.agentId)
    : null;
  const similarPage = await listPublishedPropertiesPaged({
    verifiedOnly: true,
    page: 1,
    pageSize: 4,
    sort: "newest",
  });
  const similar = similarPage.items
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  return (
    <PageShell
      title={property.title[lang]}
      subtitle={property.location[lang]}
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--brand-line)]">
            <ListingMediaFrame
              locale={lang}
              dict={dict}
              title={property.title[lang]}
              propertyType={property.type}
              imageUrl={property.coverUrl}
              imageSource={property.source}
              priority
              showSource={Boolean(property.coverUrl && property.source)}
              className="aspect-[16/9]"
            />
          </div>

          <section className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white p-6">
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.property.overview}
            </h2>
            <p className="leading-relaxed text-stone-600">
              {property.description[lang]}
            </p>
            {property.features.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {property.features.map((feature) => (
                  <li
                    key={feature.id}
                    className="rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand-deep)]"
                  >
                    <span className="font-medium">
                      {lang === "zh"
                        ? feature.label_zh
                        : lang === "th"
                          ? feature.label_th
                          : feature.label_en}
                    </span>
                    {(lang === "zh"
                      ? feature.value_zh
                      : lang === "th"
                        ? feature.value_th
                        : feature.value_en) && (
                      <>
                        {": "}
                        {lang === "zh"
                          ? feature.value_zh
                          : lang === "th"
                            ? feature.value_th
                            : feature.value_en}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-[0_1px_0_rgba(6,61,56,0.04)]">
            <p className="text-sm tracking-wide text-[var(--brand)] uppercase">
              {propertyTypeLabel(dict, property.type)} ·{" "}
              {property.listingType === "rent"
                ? dict.common.rent
                : dict.common.sale}
            </p>
            <p className="font-heading mt-3 text-3xl text-[var(--brand-deep)]">
              {formatPrice(property.priceThb, lang, property.listingType)}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-stone-600">
              <div>
                <dt>{dict.common.bedrooms}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.bedrooms ?? "—"}
                </dd>
              </div>
              <div>
                <dt>{dict.common.bathrooms}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.bathrooms ?? "—"}
                </dd>
              </div>
              <div>
                <dt>{dict.common.area}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.areaSqm != null
                    ? `${property.areaSqm} ${dict.common.sqm}`
                    : property.landAreaSqm != null
                      ? `${property.landAreaSqm} ${dict.common.sqm}`
                      : "—"}
                </dd>
              </div>
              <div>
                <dt>{dict.common.location}</dt>
                <dd className="mt-1 font-medium text-[var(--brand-deep)]">
                  {property.location[lang]}
                </dd>
              </div>
            </dl>
          </div>

          <ListingContactCard
            locale={lang}
            dict={dict}
            propertyId={property.id}
            agent={agent}
          />
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
