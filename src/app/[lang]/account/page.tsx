import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  customerSignOut,
} from "@/app/[lang]/account/actions";
import { getOptionalCustomer } from "@/lib/auth/customer";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/config/locales";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "Account | GoThailandHome",
    robots: { index: false, follow: false },
    alternates: { canonical: `/${lang}/account` },
  };
}

export default async function AccountDashboardPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2AccountEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const customer = await getOptionalCustomer();
  const a = dict.account;

  if (!customer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-heading text-3xl">{a.title}</h1>
        <p className="mt-2 text-stone-600">{a.signInPrompt}</p>
        <Link
          href={`/${lang}/account/sign-in`}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          {a.signIn}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">{a.title}</h1>
      <p className="mt-2 text-stone-600">
        {a.signedInAs} {customer.email ?? customer.userId}
      </p>
      <nav aria-label={a.navLabel} className="mt-8 flex flex-wrap gap-3">
        <Link className="underline" href={`/${lang}/account/saved`}>
          {a.saved}
        </Link>
        <Link className="underline" href={`/${lang}/account/searches`}>
          {a.searches}
        </Link>
        <Link className="underline" href={`/${lang}/account/alerts`}>
          {a.alerts}
        </Link>
        <Link className="underline" href={`/${lang}/favorites`}>
          {a.deviceFavorites}
        </Link>
      </nav>
      <form action={customerSignOut} className="mt-8">
        <input type="hidden" name="lang" value={lang} />
        <button
          type="submit"
          className="rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm"
        >
          {a.signOut}
        </button>
      </form>
    </main>
  );
}
