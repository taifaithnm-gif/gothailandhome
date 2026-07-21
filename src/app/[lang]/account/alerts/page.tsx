import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireCustomer } from "@/lib/auth/customer";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { defaultNotificationPrefs } from "@/lib/notifications/prefs";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Alerts | GoThailandHome",
    robots: { index: false, follow: false },
  };
}

export default async function AccountAlertsPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2AccountEnabled()) notFound();
  const lang = raw as Locale;
  await requireCustomer(lang);
  const dict = await getDictionary(lang);
  const a = dict.account;
  const prefs = defaultNotificationPrefs();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">{a.alertsTitle}</h1>
      <p className="mt-2 text-stone-600">{a.alertsHelp}</p>
      <dl className="mt-8 space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt>{a.emailAlerts}</dt>
          <dd>{prefs.emailEnabled ? a.on : a.off}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{a.pushAlerts}</dt>
          <dd>{prefs.pushEnabled ? a.on : a.off}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{a.savedSearchAlerts}</dt>
          <dd>{prefs.savedSearchAlerts ? a.on : a.off}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-stone-500">{a.alertsNote}</p>
      <Link className="mt-8 inline-block underline" href={`/${lang}/account`}>
        {a.backToAccount}
      </Link>
    </main>
  );
}
