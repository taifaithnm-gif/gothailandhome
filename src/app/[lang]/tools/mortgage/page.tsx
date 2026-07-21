import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { MortgageCalculator } from "@/components/tools/mortgage-calculator";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2ToolsEnabled } from "@/lib/feature-flags";
import { FINANCE_DISCLAIMER } from "@/lib/finance/mortgage";
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
    title: dict.tools.mortgageMetaTitle,
    description: dict.tools.mortgageMetaDescription,
    path: "/tools/mortgage",
  });
}

export default async function MortgageToolPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2ToolsEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const t = dict.tools;

  return (
    <PageShell title={t.mortgageTitle}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm">
          <Link href={localePath(lang, "/tools")} className="underline">
            {t.hubTitle}
          </Link>
        </p>
        <h1 className="font-heading mt-2 text-3xl">{t.mortgageTitle}</h1>
        <p className="mt-2 text-stone-600">{t.mortgageIntro}</p>
        <p className="mt-2 text-sm text-amber-800">{FINANCE_DISCLAIMER}</p>
        <div className="mt-6">
          <MortgageCalculator
            labels={{
              principal: t.principal,
              rate: t.rate,
              term: t.term,
              calculate: t.calculate,
              monthly: t.monthly,
              total: t.total,
              interest: t.interest,
              assumptions: t.assumptions,
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
