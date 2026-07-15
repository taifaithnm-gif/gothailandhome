import { notFound } from "next/navigation";

import { ListYourPropertyForm } from "@/components/marketplace/list-your-property-form";
import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.listYourPropertyTitle,
    description: dict.meta.listYourPropertyDescription,
    path: "/list-your-property",
  });
}

export default async function ListYourPropertyPage({
  params,
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.marketplace.listTitle}
      subtitle={dict.marketplace.listSubtitle}
    >
      <ListYourPropertyForm locale={lang} dict={dict} />
    </PageShell>
  );
}
