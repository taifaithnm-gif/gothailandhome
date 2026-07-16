import { notFound } from "next/navigation";

import { LeadErrorPanel } from "@/components/leads/lead-result";
import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  parseLeadChannelParam,
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
      title: dict.meta.leadErrorTitle,
      description: dict.meta.leadErrorDescription,
      path: "/leads/error",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function LeadErrorPage({
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
  const code = parseSingleParam(query.code);
  const dict = await getDictionary(lang);

  return (
    <PageShell
      title={dict.leads.errorTitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        { label: dict.nav.marketplace, href: localePath(lang, "/marketplace") },
        { label: dict.leads.errorTitle },
      ]}
    >
      <LeadErrorPanel
        locale={lang}
        dict={dict}
        channel={channel}
        code={code}
      />
    </PageShell>
  );
}
