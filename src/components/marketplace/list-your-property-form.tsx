"use client";

import { useActionState } from "react";

import {
  submitListYourPropertyLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

const initial: MarketplaceFormState = { ok: false, message: "" };

export function ListYourPropertyForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitListYourPropertyLead,
    initial,
  );

  if (state.ok) {
    return (
      <p className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 text-[var(--brand-deep)]">
        {m.successReview}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-stone-500">{m.listReviewNote}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={m.ownerOrAgent}>
          <select name="owner_or_authorized_agent" required className={inputClass}>
            <option value="owner">{m.owner}</option>
            <option value="authorized_agent">{m.authorizedAgent}</option>
          </select>
        </Field>
        <Field label={m.project}>
          <input name="project" required className={inputClass} />
        </Field>
        <Field label={m.propertyType}>
          <select name="property_type" required className={inputClass}>
            <option value="condo">{m.condo}</option>
            <option value="house">{m.house}</option>
            <option value="villa">{m.villa}</option>
            <option value="other">{m.other}</option>
          </select>
        </Field>
        <Field label={m.saleOrRent}>
          <select name="sale_or_rent" required className={inputClass}>
            <option value="sale">{m.sale}</option>
            <option value="rent">{m.rent}</option>
          </select>
        </Field>
        <Field label={m.price}>
          <input name="price" required className={inputClass} />
        </Field>
        <Field label={m.bedrooms}>
          <input name="bedrooms" type="number" min={0} className={inputClass} />
        </Field>
        <Field label={m.bathrooms}>
          <input name="bathrooms" type="number" min={0} step="0.5" className={inputClass} />
        </Field>
        <Field label={m.area}>
          <input name="area" className={inputClass} />
        </Field>
        <Field label={m.floor}>
          <input name="floor" className={inputClass} />
        </Field>
        <Field label={m.furnishing}>
          <input name="furnishing" className={inputClass} />
        </Field>
        <Field label={m.availability}>
          <input name="availability" className={inputClass} />
        </Field>
        <Field label={m.name}>
          <input name="name" required className={inputClass} />
        </Field>
        <Field label={m.phone}>
          <input name="phone" className={inputClass} />
        </Field>
        <Field label={m.email}>
          <input name="email" type="email" className={inputClass} />
        </Field>
        <Field label={m.line}>
          <input name="line" className={inputClass} />
        </Field>
        <Field label={m.whatsapp}>
          <input name="whatsapp" className={inputClass} />
        </Field>
      </div>

      <Field label={m.notes}>
        <textarea name="notes" rows={4} className={textareaClass} />
      </Field>

      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" name="authorization" value="true" required className="mt-1" />
        <span>{m.authorization}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" name="consent" value="true" required className="mt-1" />
        <span>{m.consent}</span>
      </label>

      {state.message && !state.ok ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60"
      >
        {pending ? m.sending : m.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
