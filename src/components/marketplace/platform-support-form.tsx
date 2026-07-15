"use client";

import { useActionState } from "react";

import {
  submitPlatformSupportLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

const initial: MarketplaceFormState = { ok: false, message: "" };

export function PlatformSupportForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const c = dict.contact;
  const [state, action, pending] = useActionState(
    submitPlatformSupportLead,
    initial,
  );

  if (state.ok) {
    return (
      <p className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 text-[var(--brand-deep)]">
        {m.successSupport}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-stone-500">{m.supportFormNote}</p>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{c.name}</span>
        <input name="name" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{c.email}</span>
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{c.phone}</span>
        <input name="phone" className={inputClass} />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">{c.message}</span>
        <textarea name="message" rows={5} required className={textareaClass} />
      </label>
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" name="consent" value="true" required className="mt-1" />
        <span>{m.consent}</span>
      </label>
      {state.message && !state.ok ? <p className="text-sm text-red-700">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? m.sending : c.submit}
      </button>
    </form>
  );
}

const inputClass =
  "h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const textareaClass =
  "rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60";
