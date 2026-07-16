import { notFound } from "next/navigation";

import { LeadSuccessPanel } from "@/components/leads/lead-result";
import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  parseLeadChannelParam,
  parseLeadModeParam,
  parseSingleParam,
} from "@/lib/leads/urls";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    ...buildPageMetadata({
      locale: lang,
      title: dict.meta.leadSuccessTitle,
      description: dict.meta.leadSuccessDescription,
      path: "/leads/success",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function LeadSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const query = await searchParams;
  const channel = parseLeadChannelParam(query.channel);
  if (!channel) notFound();

  const dict = await getDictionary(lang);
  const reference = parseSingleParam(query.ref);
  const mode = parseLeadModeParam(query.mode);

  return (
    <PageShell
      title={dict.leads.successTitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.marketplace, href: localePath(lang, "/marketplace") },
        { label: dict.leads.successTitle },
      ]}
    >
      <LeadSuccessPanel
        locale={lang}
        dict={dict}
        channel={channel}
        reference={reference}
        mode={mode}
      />
    </PageShell>
  );
}
