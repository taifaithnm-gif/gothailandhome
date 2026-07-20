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
  propertySlug: string;
  propertyTitle: string;
};

const initial: MarketplaceFormState = {
  ok: false,
  message: "",
  errorCode: null,
  reference: null,
  mode: null,
};

export function ViewingRequestForm({
  locale,
  dict,
  propertyId,
  propertySlug,
  propertyTitle,
}: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitViewingRequestLead,
    initial,
  );

  const errorMessage =
    state.errorCode || state.message
      ? resolveMarketplaceError(m, state.errorCode, state.message)
      : null;

  return (
    <form action={action} data-slot="viewing-request-form">
      <FormShell className="p-4! sm:p-5!">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="property_id" value={propertyId} />
        <input type="hidden" name="property_slug" value={propertySlug} />
        <input type="hidden" name="property_title" value={propertyTitle} />
        <input type="hidden" name="context_kind" value="property" />
        <input type="hidden" name="context_ref" value={propertySlug} />
        <input type="hidden" name="context_label" value={propertyTitle} />
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          {dict.property.requestViewing}
        </p>
        <p className="text-xs text-stone-500" data-slot="listing-inquiry-context">
          {propertyTitle}
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
