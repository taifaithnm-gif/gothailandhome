import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.aboutTitle,
    description: dict.meta.aboutDescription,
    path: "/about",
  });
}

export default async function AboutPage({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.about.title}
      subtitle={dict.about.subtitle}
      notice={dict.common.placeholderNotice}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 leading-relaxed text-stone-600 sm:p-8">
          <p>{dict.about.body1}</p>
          <p>{dict.about.body2}</p>
        </div>
        <aside className="rounded-2xl bg-[var(--brand-deep)] p-6 text-white sm:p-8">
          <h2 className="font-heading text-2xl">{dict.about.missionTitle}</h2>
          <p className="mt-3 text-white/75">{dict.about.missionBody}</p>
        </aside>
      </div>
    </PageShell>
  );
}
