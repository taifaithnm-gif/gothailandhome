"use client";

import { useActionState } from "react";

import {
  submitAgencyPartnershipLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

const initial: MarketplaceFormState = { ok: false, message: "" };

export function AgencyPartnershipForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitAgencyPartnershipLead,
    initial,
  );

  if (state.ok) {
    return (
      <p className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 text-[var(--brand-deep)]">
        {m.successPending}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-stone-500">{m.partnerPendingNote}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={m.agencyName}><input name="agency_name" required className={inputClass} /></Field>
        <Field label={m.licenseRegistration}><input name="license_registration" className={inputClass} /></Field>
        <Field label={m.representative}><input name="representative" required className={inputClass} /></Field>
        <Field label={m.serviceAreas}><input name="service_areas" className={inputClass} /></Field>
        <Field label={m.listingVolume}><input name="listing_volume" className={inputClass} /></Field>
        <Field label={m.languages}><input name="languages" className={inputClass} /></Field>
        <Field label={m.phone}><input name="phone" className={inputClass} /></Field>
        <Field label={m.email}><input name="email" type="email" className={inputClass} /></Field>
        <Field label={m.line}><input name="line" className={inputClass} /></Field>
        <Field label={m.whatsapp}><input name="whatsapp" className={inputClass} /></Field>
      </div>
      <Field label={m.notes}><textarea name="notes" rows={4} className={textareaClass} /></Field>
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" name="consent" value="true" required className="mt-1" />
        <span>{m.consent}</span>
      </label>
      {state.message && !state.ok ? <p className="text-sm text-red-700">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? m.sending : m.submit}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-[var(--brand-deep)]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const textareaClass =
  "rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60";
