import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { LegalChecklistClient } from "@/components/tools/legal-checklist";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2ToolsEnabled } from "@/lib/feature-flags";
import { LEGAL_WORKFLOW_DISCLAIMER } from "@/lib/legal/workflow";
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
    title: dict.tools.legalMetaTitle,
    description: dict.tools.legalMetaDescription,
    path: "/tools/legal",
  });
}

export default async function LegalToolsPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2ToolsEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const t = dict.tools;

  return (
    <PageShell title={t.legalTitle}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm">
          <Link href={localePath(lang, "/tools")} className="underline">
            {t.hubTitle}
          </Link>
        </p>
        <h1 className="font-heading mt-2 text-3xl">{t.legalTitle}</h1>
        <p className="mt-2 text-stone-600">{t.legalIntro}</p>
        <p className="mt-2 text-sm text-amber-900">{LEGAL_WORKFLOW_DISCLAIMER}</p>
        <div className="mt-6">
          <LegalChecklistClient
            lang={lang}
            labels={{
              ackLabel: t.legalAck,
              continueLabel: t.legalContinue,
              progress: t.legalProgress,
              openGuide: t.openGuide,
              itemOwnershipGuide: t.itemOwnershipGuide,
              helpOwnershipGuide: t.helpOwnershipGuide,
              itemTenure: t.itemTenure,
              helpTenure: t.helpTenure,
              itemTitleDocs: t.itemTitleDocs,
              helpTitleDocs: t.helpTitleDocs,
              itemFees: t.itemFees,
              helpFees: t.helpFees,
              itemCounsel: t.itemCounsel,
              helpCounsel: t.helpCounsel,
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
