"use client";

import { useActionState } from "react";

import {
  submitPlatformSupportLead,
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
};

const initial: MarketplaceFormState = {
  ok: false,
  message: "",
  errorCode: null,
  reference: null,
  mode: null,
};

/** Platform Customer Success only — Apple brand appears here, not on listing forms. */
export function PlatformSupportForm({ locale, dict }: Props) {
  const m = dict.marketplace;
  const c = dict.contact;
  const [state, action, pending] = useActionState(
    submitPlatformSupportLead,
    initial,
  );

  if (state.ok) {
    return (
      <FormSuccessState
        title={m.successTitle}
        body={m.successSupport}
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
      <FormShell notice={m.supportFormNote}>
        <input type="hidden" name="locale" value={locale} />
        <FormField label={c.name} htmlFor="pcs-name" required>
          <Input id="pcs-name" name="name" required autoComplete="name" />
        </FormField>
        <FormField label={c.email} htmlFor="pcs-email" required>
          <Input
            id="pcs-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </FormField>
        <FormField label={c.phone} htmlFor="pcs-phone">
          <Input id="pcs-phone" name="phone" type="tel" autoComplete="tel" />
        </FormField>
        <FormField label={c.message} htmlFor="pcs-message" required>
          <Textarea id="pcs-message" name="message" rows={5} required />
        </FormField>
        <ConsentCheckbox label={m.consent} />
        {errorMessage ? <FormFailureBanner message={errorMessage} /> : null}
        <FormSubmitButton
          pending={pending}
          idleLabel={c.submit}
          pendingLabel={m.sending}
        />
      </FormShell>
    </form>
  );
}
