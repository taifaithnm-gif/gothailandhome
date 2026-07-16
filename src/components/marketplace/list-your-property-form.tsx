"use client";

import { useActionState } from "react";

import {
  submitListYourPropertyLead,
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
  Select,
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

export function ListYourPropertyForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(
    submitListYourPropertyLead,
    initial,
  );

  if (state.ok) {
    return (
      <FormSuccessState
        title={m.successTitle}
        body={m.successReview}
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
      <FormShell notice={m.listReviewNote}>
        <input type="hidden" name="locale" value={locale} />
        <FormGrid>
          <FormField label={m.ownerOrAgent} htmlFor="owner_or_authorized_agent" required>
            <Select
              id="owner_or_authorized_agent"
              name="owner_or_authorized_agent"
              required
              defaultValue="owner"
            >
              <option value="owner">{m.owner}</option>
              <option value="authorized_agent">{m.authorizedAgent}</option>
            </Select>
          </FormField>
          <FormField label={m.project} htmlFor="project" required>
            <Input id="project" name="project" required />
          </FormField>
          <FormField label={m.propertyType} htmlFor="property_type" required>
            <Select
              id="property_type"
              name="property_type"
              required
              defaultValue="condo"
            >
              <option value="condo">{m.condo}</option>
              <option value="house">{m.house}</option>
              <option value="villa">{m.villa}</option>
              <option value="other">{m.other}</option>
            </Select>
          </FormField>
          <FormField label={m.saleOrRent} htmlFor="sale_or_rent" required>
            <Select
              id="sale_or_rent"
              name="sale_or_rent"
              required
              defaultValue="sale"
            >
              <option value="sale">{m.sale}</option>
              <option value="rent">{m.rent}</option>
            </Select>
          </FormField>
          <FormField label={m.price} htmlFor="price" required>
            <Input id="price" name="price" required />
          </FormField>
          <FormField label={m.bedrooms} htmlFor="bedrooms">
            <Input id="bedrooms" name="bedrooms" type="number" min={0} />
          </FormField>
          <FormField label={m.bathrooms} htmlFor="bathrooms">
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              step="0.5"
            />
          </FormField>
          <FormField label={m.area} htmlFor="area">
            <Input id="area" name="area" />
          </FormField>
          <FormField label={m.floor} htmlFor="floor">
            <Input id="floor" name="floor" />
          </FormField>
          <FormField label={m.furnishing} htmlFor="furnishing">
            <Input id="furnishing" name="furnishing" />
          </FormField>
          <FormField label={m.availability} htmlFor="availability">
            <Input id="availability" name="availability" />
          </FormField>
          <FormField label={m.name} htmlFor="name" required>
            <Input id="name" name="name" required autoComplete="name" />
          </FormField>
          <FormField label={m.phone} htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </FormField>
          <FormField label={m.email} htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" />
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

        <ConsentCheckbox name="authorization" label={m.authorization} />
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
