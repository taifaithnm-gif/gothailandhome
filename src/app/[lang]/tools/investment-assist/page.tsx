import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { InvestmentAssistClient } from "@/components/tools/investment-assist";
import { isLocale, type Locale } from "@/config/locales";
import { getAiProviderMode } from "@/lib/ai/investment-assist";
import {
  isPhase2AiEnabled,
  isPhase2ToolsEnabled,
} from "@/lib/feature-flags";
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
    title: dict.tools.investMetaTitle,
    description: dict.tools.investMetaDescription,
    path: "/tools/investment-assist",
  });
}

export default async function InvestmentAssistPage({ params }: Props) {
  const { lang: raw } = await params;
  const toolsOn = isPhase2ToolsEnabled();
  const aiOn = isPhase2AiEnabled();
  if (!isLocale(raw) || (!toolsOn && !aiOn)) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const mode = getAiProviderMode(aiOn);

  if (mode === "disabled" && !toolsOn) notFound();

  return (
    <PageShell title={dict.tools.investTitle}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm">
          <Link href={localePath(lang, "/tools")} className="underline">
            {dict.tools.hubTitle}
          </Link>
        </p>
        <h1 className="font-heading mt-2 text-3xl">{dict.tools.investTitle}</h1>
        <p className="mt-2 text-stone-600">{dict.tools.investIntro}</p>
        <p className="mt-1 text-xs text-stone-500">
          Mode: {mode === "disabled" ? "tools-only calculator framing" : "rules_l0"}
        </p>
        <div className="mt-6">
          <InvestmentAssistClient
            labels={{
              ack: dict.tools.investAck,
              price: dict.tools.investPrice,
              down: dict.tools.investDown,
              rate: dict.tools.rate,
              term: dict.tools.term,
              rent: dict.tools.investRent,
              run: dict.tools.investRun,
              loan: dict.tools.investLoan,
              cashflow: dict.tools.investCashflow,
              rentOptional: dict.tools.investRentOptional,
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
