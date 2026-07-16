"use client";

import { useActionState } from "react";

import {
  submitViewingRequestLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import {
  ConsentCheckbox,
  FormFailureBanner,
  FormField,
  FormShell,
  FormSubmitButton,
  FormSuccessState,
  Input,
  Textarea,
  resolveMarketplaceError,
} from "@/components/marketplace/form-kit";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  locale: Locale;
  dict: Dictionary;
  propertyId: string;
};

const initial: MarketplaceFormState = {
  ok: false,
  message: "",
  errorCode: null,
  reference: null,
  mode: null,
};

export function ViewingRequestForm({ locale, dict, propertyId }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitViewingRequestLead,
    initial,
  );

  if (state.ok) {
    return (
      <FormSuccessState
        title={m.successTitle}
        body={m.successViewing}
        reference={state.reference}
        referenceLabel={m.referenceLabel}
        nextSteps={m.nextSteps}
      />
    );
  }

  const errorMessage =
    state.errorCode || state.message
      ? resolveMarketplaceError(m, state.errorCode, state.message)
      : null;

  return (
    <form action={action}>
      <FormShell className="p-4! sm:p-5!">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="property_id" value={propertyId} />
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          {dict.property.requestViewing}
        </p>
        <FormField label={m.name} htmlFor="viewing-name" required>
          <Input id="viewing-name" name="name" required autoComplete="name" />
        </FormField>
        <FormField label={m.phone} htmlFor="viewing-phone">
          <Input id="viewing-phone" name="phone" type="tel" />
        </FormField>
        <FormField label={m.email} htmlFor="viewing-email">
          <Input id="viewing-email" name="email" type="email" />
        </FormField>
        <FormField label={m.preferredDatetime} htmlFor="preferred_datetime">
          <Input id="preferred_datetime" name="preferred_datetime" />
        </FormField>
        <FormField label={m.notes} htmlFor="viewing-notes">
          <Textarea id="viewing-notes" name="notes" rows={3} />
        </FormField>
        <ConsentCheckbox label={m.consent} />
        {errorMessage ? <FormFailureBanner message={errorMessage} /> : null}
        <FormSubmitButton
          pending={pending}
          idleLabel={m.submitViewing}
          pendingLabel={m.sending}
          className="w-full"
        />
      </FormShell>
    </form>
  );
}
