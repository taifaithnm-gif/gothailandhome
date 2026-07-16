"use client";

import { useActionState } from "react";

import {
  submitFindMyHomeLead,
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

export function FindMyHomeForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const [state, action, pending] = useActionState(submitFindMyHomeLead, initial);

  if (state.ok) {
    return (
      <FormSuccessState
        title={m.successTitle}
        body={m.successPrivate}
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
      <FormShell notice={m.findPrivacyNote}>
        <input type="hidden" name="locale" value={locale} />
        <FormGrid>
          <FormField label={m.buyOrRent} htmlFor="buy_or_rent" required>
            <Select id="buy_or_rent" name="buy_or_rent" required defaultValue="buy">
              <option value="buy">{m.buy}</option>
              <option value="rent">{m.rent}</option>
            </Select>
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
          <FormField label={m.preferredAreas} htmlFor="preferred_areas">
            <Input
              id="preferred_areas"
              name="preferred_areas"
              placeholder={m.areasPlaceholder}
            />
          </FormField>
          <FormField label={m.preferredProjects} htmlFor="preferred_projects">
            <Input id="preferred_projects" name="preferred_projects" />
          </FormField>
          <FormField label={m.btsMrtPreference} htmlFor="bts_mrt_preference">
            <Input id="bts_mrt_preference" name="bts_mrt_preference" />
          </FormField>
          <FormField label={m.preferredLanguage} htmlFor="preferred_language">
            <Select
              id="preferred_language"
              name="preferred_language"
              defaultValue={locale}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="th">ไทย</option>
            </Select>
          </FormField>
          <FormField label={m.budgetMin} htmlFor="budget_min">
            <Input id="budget_min" name="budget_min" type="number" min={0} />
          </FormField>
          <FormField label={m.budgetMax} htmlFor="budget_max">
            <Input id="budget_max" name="budget_max" type="number" min={0} />
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
          <FormField label={m.moveInDate} htmlFor="move_in_date">
            <Input id="move_in_date" name="move_in_date" type="date" />
          </FormField>
          <FormField label={m.furnished} htmlFor="furnished">
            <Select id="furnished" name="furnished" defaultValue="">
              <option value="">{m.any}</option>
              <option value="furnished">{m.yes}</option>
              <option value="unfurnished">{m.no}</option>
            </Select>
          </FormField>
          <FormField label={m.petFriendly} htmlFor="pet_friendly">
            <Select id="pet_friendly" name="pet_friendly" defaultValue="">
              <option value="">{m.any}</option>
              <option value="yes">{m.yes}</option>
              <option value="no">{m.no}</option>
            </Select>
          </FormField>
          <FormField label={m.nationality} htmlFor="nationality">
            <Input id="nationality" name="nationality" />
          </FormField>
          <FormField label={m.name} htmlFor="name" required>
            <Input id="name" name="name" required autoComplete="name" />
          </FormField>
          <FormField label={m.phone} htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </FormField>
          <FormField label={m.line} htmlFor="line">
            <Input id="line" name="line" />
          </FormField>
          <FormField label={m.whatsapp} htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" />
          </FormField>
          <FormField label={m.email} htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" />
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
