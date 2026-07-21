import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteSavedItemAction,
  migrateDeviceFavoritesAction,
} from "@/app/[lang]/account/actions";
import { listSavedItems } from "@/lib/account/customer";
import { requireCustomer } from "@/lib/auth/customer";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DeviceFavoritesMigrate } from "@/app/[lang]/account/device-migrate";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saved | GoThailandHome",
    robots: { index: false, follow: false },
  };
}

export default async function AccountSavedPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2AccountEnabled()) notFound();
  const lang = raw as Locale;
  const customer = await requireCustomer(lang);
  const dict = await getDictionary(lang);
  const items = await listSavedItems(customer.userId);
  const a = dict.account;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">{a.savedTitle}</h1>
      <p className="mt-2 text-stone-600">{a.savedHelp}</p>
      <DeviceFavoritesMigrate
        lang={lang}
        label={a.mergeDeviceFavorites}
        action={migrateDeviceFavoritesAction}
      />
      <ul className="mt-8 space-y-3">
        {items.length === 0 ? (
          <li className="text-stone-500">
            {a.savedEmpty}{" "}
            <Link className="underline" href={`/${lang}/properties`}>
              {a.browseProperties}
            </Link>
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {item.propertySlug ?? item.propertyId ?? "—"}
                </p>
                <p className="text-xs text-stone-500">{item.kind}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.propertySlug ? (
                  <Link
                    className="text-sm underline"
                    href={`/${lang}/properties/${item.propertySlug}`}
                  >
                    {a.view}
                  </Link>
                ) : null}
                <form action={deleteSavedItemAction}>
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-sm text-red-700">
                    {a.remove}
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
      <Link className="mt-8 inline-block underline" href={`/${lang}/account`}>
        {a.backToAccount}
      </Link>
    </main>
  );
}
