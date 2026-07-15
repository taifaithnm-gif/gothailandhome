import Link from "next/link";

import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import {
  formatLanguages,
  getPlatformCustomerSuccessContacts,
  isPlatformCustomerSuccess,
  pickI18n,
  type ContactRecord,
} from "@/lib/config/contacts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import type { AgentRow } from "@/lib/supabase/types";

/**
 * Listing contact block — renders DB agent only.
 * Never renders Apple / platform CS here.
 */
export function ListingContact({
  locale,
  dict,
  agent,
}: {
  locale: Locale;
  dict: Dictionary;
  agent: AgentRow | null;
}) {
  const m = dict.marketplace;

  return (
    <div data-slot="listing-contact">
      <h3 className="ds-h3 text-xl">{m.listingContactTitle}</h3>
      {agent ? (
        <div className="mt-3 space-y-1 text-sm text-stone-600">
          <p className="font-medium text-[var(--brand-deep)]">
            {locale === "zh"
              ? agent.name_zh
              : locale === "th"
                ? agent.name_th
                : agent.name_en}
          </p>
          <p className="ds-caption">{m.listingContactRole}</p>
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
  );
}

/**
 * Platform Customer Success — Apple and other CS contacts only.
 * Must never be labeled as listing agent / owner.
 */
export function PlatformCustomerSuccess({
  locale,
  dict,
  contacts,
  showEscalationLink = true,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Optional override; defaults to configured platform CS contacts. */
  contacts?: ContactRecord[];
  showEscalationLink?: boolean;
}) {
  const m = dict.marketplace;
  const support = (contacts ?? getPlatformCustomerSuccessContacts()).filter(
    (contact) => isPlatformCustomerSuccess(contact),
  );

  return (
    <SurfaceCard
      tone="dashed"
      padding="sm"
      data-slot="platform-customer-success"
      className="border-dashed"
    >
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
      {showEscalationLink ? (
        <Link
          href={localePath(locale, "/contact")}
          className="mt-3 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
        >
          {m.escalationCta}
        </Link>
      ) : null}
    </SurfaceCard>
  );
}

/**
 * AI Concierge — assistive UI only. Never presents Apple as a listing agent.
 * Does not substitute for ListingContact or Platform Customer Success.
 */
export function AiConcierge({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  const c = dict.marketplace.aiConcierge;

  return (
    <SurfaceCard
      tone="soft"
      padding="sm"
      data-slot="ai-concierge"
      className={className}
    >
      <p className="ds-caption text-[var(--brand)]">{c.eyebrow}</p>
      <p className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
        {c.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-600">{c.note}</p>
    </SurfaceCard>
  );
}
