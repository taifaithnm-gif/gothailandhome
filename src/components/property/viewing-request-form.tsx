"use client";

import { useActionState } from "react";

import {
  submitViewingRequestLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
  propertyId: string;
};

const initial: MarketplaceFormState = { ok: false, message: "" };

export function ViewingRequestForm({ locale, dict, propertyId }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitViewingRequestLead,
    initial,
  );

  if (state.ok) {
    return (
      <p className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] p-4 text-sm text-[var(--brand-deep)]">
        {m.successViewing}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="property_id" value={propertyId} />
      <p className="text-sm font-medium text-[var(--brand-deep)]">
        {dict.property.requestViewing}
      </p>
      <input name="name" required placeholder={m.name} className={inputClass} />
      <input name="phone" placeholder={m.phone} className={inputClass} />
      <input name="email" type="email" placeholder={m.email} className={inputClass} />
      <input name="preferred_datetime" placeholder={m.preferredDatetime} className={inputClass} />
      <textarea name="notes" rows={3} placeholder={m.notes} className={textareaClass} />
      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input type="checkbox" name="consent" value="true" required className="mt-0.5" />
        <span>{m.consent}</span>
      </label>
      {state.message && !state.ok ? <p className="text-xs text-red-700">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? m.sending : m.submitViewing}
      </button>
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 text-sm transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const textareaClass =
  "w-full rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-2 text-sm transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const buttonClass =
  "inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60";
