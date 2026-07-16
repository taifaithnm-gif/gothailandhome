import { notFound } from "next/navigation";

import { FindMyHomeForm } from "@/components/marketplace/find-my-home-form";
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
    title: dict.meta.findMyHomeTitle,
    description: dict.meta.findMyHomeDescription,
    path: "/find-my-home",
  });
}

export default async function FindMyHomePage({
  params,
}: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.marketplace.findTitle}
      subtitle={dict.marketplace.findSubtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.marketplace, href: localePath(lang, "/marketplace") },
        { label: dict.marketplace.findTitle },
      ]}
    >
      <FindMyHomeForm locale={lang} dict={dict} />
    </PageShell>
  );
}
