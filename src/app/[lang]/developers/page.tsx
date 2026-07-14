import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/developers">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.developersTitle,
    description: dict.meta.developersDescription,
    path: "/developers",
  });
}

export default async function DevelopersIndexPage({
  params,
}: PageProps<"/[lang]/developers">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, developers] = await Promise.all([
    getDictionary(lang),
    listPublishedDevelopers(),
  ]);

  return (
    <PageShell
      title={dict.developers.title}
      subtitle={dict.developers.subtitle}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {developers.map((developer) => (
          <li key={developer.id}>
            <Link
              href={localePath(lang, `/developers/${developer.slug}`)}
              className="block rounded-2xl border border-[var(--brand-line)] bg-white p-6 hover:border-[var(--brand)]"
            >
              <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                {developer.name[lang]}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                {developer.description[lang]}
              </p>
            </Link>
          </li>
        ))}
        {!developers.length ? (
          <li className="text-sm text-stone-500">{dict.common.noResults}</li>
        ) : null}
      </ul>
    </PageShell>
  );
}
