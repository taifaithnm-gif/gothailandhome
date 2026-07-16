"use client";

import { useActionState } from "react";

import {
  submitAgencyPartnershipLead,
  type MarketplaceFormState,
} from "@/app/[lang]/marketplace/actions";
import {
  ConsentCheckbox,
  FormFailureBanner,
  FormField,
  FormGrid,
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
};

const initial: MarketplaceFormState = {
  ok: false,
  message: "",
  errorCode: null,
  reference: null,
  mode: null,
};

export function AgencyPartnershipForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitAgencyPartnershipLead,
    initial,
  );

  if (state.ok) {
    return (
      <FormSuccessState
        title={m.successTitle}
        body={m.successPending}
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
      <FormShell notice={m.partnerPendingNote}>
        <input type="hidden" name="locale" value={locale} />
        <FormGrid>
          <FormField label={m.agencyName} htmlFor="agency_name" required>
            <Input id="agency_name" name="agency_name" required />
          </FormField>
          <FormField label={m.licenseRegistration} htmlFor="license_registration">
            <Input id="license_registration" name="license_registration" />
          </FormField>
          <FormField label={m.representative} htmlFor="representative" required>
            <Input id="representative" name="representative" required />
          </FormField>
          <FormField label={m.serviceAreas} htmlFor="service_areas">
            <Input id="service_areas" name="service_areas" />
          </FormField>
          <FormField label={m.listingVolume} htmlFor="listing_volume">
            <Input id="listing_volume" name="listing_volume" />
          </FormField>
          <FormField label={m.languages} htmlFor="languages">
            <Input id="languages" name="languages" />
          </FormField>
          <FormField label={m.phone} htmlFor="phone">
            <Input id="phone" name="phone" type="tel" />
          </FormField>
          <FormField label={m.email} htmlFor="email">
            <Input id="email" name="email" type="email" />
          </FormField>
          <FormField label={m.line} htmlFor="line">
            <Input id="line" name="line" />
          </FormField>
          <FormField label={m.whatsapp} htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" />
          </FormField>
        </FormGrid>
        <FormField label={m.notes} htmlFor="notes">
          <Textarea id="notes" name="notes" rows={4} />
        </FormField>
        <ConsentCheckbox label={m.consent} />
        {errorMessage ? <FormFailureBanner message={errorMessage} /> : null}
        <FormSubmitButton
          pending={pending}
          idleLabel={m.submit}
          pendingLabel={m.sending}
        />
      </FormShell>
    </form>
  );
}
