import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import { listPublishedPropertiesPaged } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const PREVIEW = 12;

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
    title: dict.meta.rentTitle,
    description: dict.meta.rentDescription,
    path: "/rent",
  });
}

export default async function RentLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const b = dict.buyRent;
  const paged = await listPublishedPropertiesPaged({
    verifiedOnly: true,
    listingType: "rent",
    citySlug: "bangkok",
    sort: "newest_verified",
    page: 1,
    pageSize: PREVIEW,
  });
  const allHref = localePath(lang, "/properties?listing_type=rent");

  return (
    <PageShell
      title={b.rentTitle}
      subtitle={b.rentSubtitle}
      notice={b.trustNote}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: b.rentTitle },
      ]}
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href={allHref} className={buttonVariants({ variant: "primary" })}>
          {b.browseRent}
        </Link>
        <Link
          href={localePath(lang, "/find-my-home")}
          className={buttonVariants({ variant: "secondary" })}
        >
          {dict.nav.findMyHome}
        </Link>
        <Link
          href={localePath(lang, "/buy")}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {b.switchToBuy}
        </Link>
      </div>

      <SurfaceCard className="mb-8 p-5!" tone="soft">
        <p className="text-sm text-stone-600">{b.inventoryNote}</p>
        <p className="mt-2 text-sm font-medium text-[var(--brand-deep)]">
          {paged.total} {b.verifiedRentCount}
        </p>
      </SurfaceCard>

      <section className="space-y-4">
        <h2 className="ds-h3 text-xl">{b.previewTitle}</h2>
        <PropertyGrid locale={lang} dict={dict} properties={paged.items} />
        <Link
          href={allHref}
          className={cn(buttonVariants({ variant: "secondary" }), "mt-2")}
        >
          {b.browseRent}
        </Link>
      </section>
    </PageShell>
  );
}
