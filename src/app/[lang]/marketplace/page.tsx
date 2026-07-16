import { notFound } from "next/navigation";

import { MarketplaceEntryGrid } from "@/components/marketplace/marketplace-entry-grid";
import { PageShell } from "@/components/layout/page-shell";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.marketplaceTitle,
    description: dict.meta.marketplaceDescription,
    path: "/marketplace",
  });
}

export default async function MarketplaceHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const m = dict.marketplace;

  return (
    <PageShell
      title={m.hubTitle}
      subtitle={m.hubSubtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: m.hubTitle },
      ]}
    >
      <SurfaceCard className="mb-8 space-y-2 p-5! sm:p-6!">
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          {m.hubPromiseTitle}
        </p>
        <p className="text-sm leading-relaxed text-stone-600">{m.hubPromise}</p>
      </SurfaceCard>

      <MarketplaceEntryGrid locale={lang} dict={dict} />
    </PageShell>
  );
}
