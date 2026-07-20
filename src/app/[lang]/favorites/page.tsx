import { notFound } from "next/navigation";

import { FavoritesBoard } from "@/components/favorites/favorites-board";
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
    title: dict.meta.favoritesTitle,
    description: dict.meta.favoritesDescription,
    path: "/favorites",
  });
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.favorites.title}
      subtitle={dict.favorites.subtitle}
      notice={dict.favorites.retentionNote}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.favorites.title },
      ]}
    >
      <FavoritesBoard locale={lang} dict={dict} />
    </PageShell>
  );
}
