import { notFound } from "next/navigation";

import { CompareView } from "@/components/compare/compare-view";
import { PageShell } from "@/components/layout/page-shell";
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
    title: dict.meta.compareTitle,
    description: dict.meta.compareDescription,
    path: "/compare",
    // State-dependent local-device selection — keep out of the index.
    robots: { index: false, follow: true },
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.compare.title}
      subtitle={dict.compare.subtitle}
      notice={dict.compare.retentionNote}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.compare.title },
      ]}
    >
      <CompareView locale={lang} dict={dict} />
    </PageShell>
  );
}
