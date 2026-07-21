import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createSavedSearchAction,
  deleteSavedSearchAction,
  updateSavedSearchAlertAction,
} from "@/app/[lang]/account/actions";
import {
  buildPropertiesHref,
} from "@/lib/account/saved-search";
import { listSavedSearches } from "@/lib/account/customer";
import { requireCustomer } from "@/lib/auth/customer";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saved searches | GoThailandHome",
    robots: { index: false, follow: false },
  };
}

export default async function AccountSearchesPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2AccountEnabled()) notFound();
  const lang = raw as Locale;
  const customer = await requireCustomer(lang);
  const dict = await getDictionary(lang);
  const searches = await listSavedSearches(customer.userId);
  const a = dict.account;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">{a.searchesTitle}</h1>
      <p className="mt-2 text-stone-600">{a.searchesHelp}</p>

      <form
        action={createSavedSearchAction}
        className="mt-8 space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4"
      >
        <input type="hidden" name="lang" value={lang} />
        <input
          type="hidden"
          name="filtersJson"
          value={JSON.stringify({ listingType: "all", sort: "newest" })}
        />
        <div>
          <label htmlFor="search-name" className="block text-sm font-medium">
            {a.searchName}
          </label>
          <input
            id="search-name"
            name="name"
            required
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="alert-frequency" className="block text-sm font-medium">
            {a.alertFrequency}
          </label>
          <select
            id="alert-frequency"
            name="alertFrequency"
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
            defaultValue="off"
          >
            <option value="off">{a.freqOff}</option>
            <option value="instant">{a.freqInstant}</option>
            <option value="daily">{a.freqDaily}</option>
            <option value="weekly">{a.freqWeekly}</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          {a.createSearch}
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {searches.length === 0 ? (
          <li className="text-stone-500">{a.searchesEmpty}</li>
        ) : (
          searches.map((search) => (
            <li
              key={search.id}
              className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{search.name}</p>
                  <p className="text-xs text-stone-500">
                    {search.alertFrequency} · {search.locale}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    className="text-sm underline"
                    href={buildPropertiesHref(lang, search.filters)}
                  >
                    {a.openSearch}
                  </Link>
                  <form action={updateSavedSearchAlertAction} className="flex items-center gap-2">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={search.id} />
                    <label className="sr-only" htmlFor={`freq-${search.id}`}>
                      {a.alertFrequency}
                    </label>
                    <select
                      id={`freq-${search.id}`}
                      name="alertFrequency"
                      defaultValue={search.alertFrequency}
                      className="rounded border border-[var(--brand-line)] px-2 py-1 text-sm"
                    >
                      <option value="off">{a.freqOff}</option>
                      <option value="instant">{a.freqInstant}</option>
                      <option value="daily">{a.freqDaily}</option>
                      <option value="weekly">{a.freqWeekly}</option>
                    </select>
                    <button type="submit" className="text-sm underline">
                      {a.save}
                    </button>
                  </form>
                  <form action={deleteSavedSearchAction}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={search.id} />
                    <button type="submit" className="text-sm text-red-700">
                      {a.remove}
                    </button>
                  </form>
                </div>
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
