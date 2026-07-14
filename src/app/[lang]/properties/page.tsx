import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.propertiesTitle,
    description: dict.meta.propertiesDescription,
    path: "/properties",
  });
}

export default async function PropertiesPage({
  params,
}: PageProps<"/[lang]/properties">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const properties = await listPublishedProperties();

  return (
    <PageShell
      title={dict.properties.title}
      subtitle={dict.properties.subtitle}
      notice={dict.common.placeholderNotice}
    >
      <PropertyGrid locale={lang} dict={dict} properties={properties} />
    </PageShell>
  );
}
