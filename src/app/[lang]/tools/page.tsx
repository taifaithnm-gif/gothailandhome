import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2ToolsEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.tools.hubMetaTitle,
    description: dict.tools.hubMetaDescription,
    path: "/tools",
  });
}

export default async function ToolsHubPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2ToolsEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const t = dict.tools;

  return (
    <PageShell title={t.hubTitle}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-heading text-3xl">{t.hubTitle}</h1>
        <p className="mt-2 text-stone-600">{t.hubIntro}</p>
        <ul className="mt-8 space-y-3">
          <li>
            <Link
              className="text-lg underline"
              href={localePath(lang, "/tools/mortgage")}
            >
              {t.mortgageTitle}
            </Link>
          </li>
          <li>
            <Link
              className="text-lg underline"
              href={localePath(lang, "/tools/legal")}
            >
              {t.legalTitle}
            </Link>
          </li>
          <li>
            <Link
              className="text-lg underline"
              href={localePath(lang, "/tools/investment-assist")}
            >
              {t.investTitle}
            </Link>
          </li>
        </ul>
      </main>
    </PageShell>
  );
}
