"use client";

import { useActionState } from "react";

import {
  submitFindMyHomeLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

const initial: MarketplaceFormState = { ok: false, message: "" };

export function FindMyHomeForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(submitFindMyHomeLead, initial);

  if (state.ok) {
    return (
      <p className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 text-[var(--brand-deep)]">
        {m.successPrivate}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-stone-500">{m.findPrivacyNote}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={m.buyOrRent} name="buy_or_rent" required>
          <select name="buy_or_rent" required className={inputClass}>
            <option value="buy">{m.buy}</option>
            <option value="rent">{m.rent}</option>
          </select>
        </Field>
        <Field label={m.propertyType} name="property_type" required>
          <select name="property_type" required className={inputClass}>
            <option value="condo">{m.condo}</option>
            <option value="house">{m.house}</option>
            <option value="villa">{m.villa}</option>
            <option value="other">{m.other}</option>
          </select>
        </Field>
        <Field label={m.preferredAreas} name="preferred_areas">
          <input name="preferred_areas" className={inputClass} placeholder={m.areasPlaceholder} />
        </Field>
        <Field label={m.preferredProjects} name="preferred_projects">
          <input name="preferred_projects" className={inputClass} />
        </Field>
        <Field label={m.btsMrtPreference} name="bts_mrt_preference">
          <input name="bts_mrt_preference" className={inputClass} />
        </Field>
        <Field label={m.preferredLanguage} name="preferred_language">
          <select name="preferred_language" className={inputClass} defaultValue={locale}>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="th">ไทย</option>
          </select>
        </Field>
        <Field label={m.budgetMin} name="budget_min">
          <input name="budget_min" type="number" min={0} className={inputClass} />
        </Field>
        <Field label={m.budgetMax} name="budget_max">
          <input name="budget_max" type="number" min={0} className={inputClass} />
        </Field>
        <Field label={m.bedrooms} name="bedrooms">
          <input name="bedrooms" type="number" min={0} className={inputClass} />
        </Field>
        <Field label={m.bathrooms} name="bathrooms">
          <input name="bathrooms" type="number" min={0} step="0.5" className={inputClass} />
        </Field>
        <Field label={m.moveInDate} name="move_in_date">
          <input name="move_in_date" type="date" className={inputClass} />
        </Field>
        <Field label={m.furnished} name="furnished">
          <select name="furnished" className={inputClass}>
            <option value="">{m.any}</option>
            <option value="furnished">{m.yes}</option>
            <option value="unfurnished">{m.no}</option>
          </select>
        </Field>
        <Field label={m.petFriendly} name="pet_friendly">
          <select name="pet_friendly" className={inputClass}>
            <option value="">{m.any}</option>
            <option value="yes">{m.yes}</option>
            <option value="no">{m.no}</option>
          </select>
        </Field>
        <Field label={m.nationality} name="nationality">
          <input name="nationality" className={inputClass} />
        </Field>
        <Field label={m.name} name="name" required>
          <input name="name" required className={inputClass} />
        </Field>
        <Field label={m.phone} name="phone">
          <input name="phone" className={inputClass} />
        </Field>
        <Field label={m.line} name="line">
          <input name="line" className={inputClass} />
        </Field>
        <Field label={m.whatsapp} name="whatsapp">
          <input name="whatsapp" className={inputClass} />
        </Field>
        <Field label={m.email} name="email">
          <input name="email" type="email" className={inputClass} />
        </Field>
      </div>

      <Field label={m.notes} name="notes">
        <textarea name="notes" rows={4} className={textareaClass} />
      </Field>

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
  name: string;
  required?: boolean;
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
