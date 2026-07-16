import { notFound } from "next/navigation";

import { AgencyPartnershipForm } from "@/components/marketplace/agency-partnership-form";
import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.agencyPartnerTitle,
    description: dict.meta.agencyPartnerDescription,
    path: "/partners/agencies",
  });
}

export default async function AgencyPartnersPage({
  params,
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.marketplace.agencyPartnerTitle}
      subtitle={dict.marketplace.agencyPartnerSubtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.marketplace, href: localePath(lang, "/marketplace") },
        { label: dict.marketplace.agencyPartnerTitle },
      ]}
    >
      <AgencyPartnershipForm locale={lang} dict={dict} />
    </PageShell>
  );
}
