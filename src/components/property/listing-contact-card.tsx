import Link from "next/link";

import { ViewingRequestForm } from "@/components/property/viewing-request-form";
import type { Locale } from "@/config/locales";
import {
  formatLanguages,
  getPlatformCustomerSuccessContacts,
  pickI18n,
} from "@/lib/config/contacts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import type { AgentRow } from "@/lib/supabase/types";

type Props = {
  locale: Locale;
  dict: Dictionary;
  propertyId: string;
  agent: AgentRow | null;
};

/**
 * Listing contact card — never silently substitutes Apple/platform CS as the listing owner.
 * Platform support is shown only as a separate help/escalation path.
 */
export function ListingContactCard({ locale, dict, propertyId, agent }: Props) {
  const m = dict.marketplace;
  const support = getPlatformCustomerSuccessContacts();

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-[0_1px_0_rgba(6,61,56,0.04)]">
      <div>
        <h3 className="font-heading text-xl text-[var(--brand-deep)]">
          {m.listingContactTitle}
        </h3>
        {agent ? (
          <div className="mt-3 space-y-1 text-sm text-stone-600">
            <p className="font-medium text-[var(--brand-deep)]">
              {locale === "zh"
                ? agent.name_zh
                : locale === "th"
                  ? agent.name_th
                  : agent.name_en}
            </p>
            <p className="text-xs tracking-wide text-stone-500 uppercase">
              {m.listingContactRole}
            </p>
            {agent.phone ? (
              <p>
                {dict.contact.phone}: {agent.phone}
              </p>
            ) : null}
            {agent.email ? (
              <p>
                {dict.contact.email}: {agent.email}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-600">{m.listingContactMissing}</p>
        )}
      </div>

      <ViewingRequestForm locale={locale} dict={dict} propertyId={propertyId} />

      <div className="rounded-xl border border-dashed border-[var(--brand-line)] bg-[var(--brand-soft)] p-4">
        <p className="text-sm font-medium text-[var(--brand-deep)]">
          {m.platformSupportTitle}
        </p>
        <p className="mt-1 text-xs text-stone-600">{m.platformSupportNote}</p>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {support.map((contact) => (
            <li key={contact.id}>
              <span className="font-medium">{contact.name}</span>
              {" · "}
              {pickI18n(contact.role, locale)}
              {contact.phone ? ` · ${contact.phone}` : ""}
              <span className="block text-xs text-stone-500">
                {formatLanguages(contact.languages, locale)}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={localePath(locale, "/contact")}
          className="mt-3 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
        >
          {m.escalationCta}
        </Link>
      </div>
    </div>
  );
}
