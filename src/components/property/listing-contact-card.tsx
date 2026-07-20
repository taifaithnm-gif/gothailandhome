import {
  AiConcierge,
  ListingContact,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { ViewingRequestForm } from "@/components/property/viewing-request-form";
import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import {
  buildListingInquiryContext,
  listingContactEscalationPath,
} from "@/lib/property/listing-trust";
import type { AgentRow } from "@/lib/supabase/types";

type Props = {
  locale: Locale;
  dict: Dictionary;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  agent: AgentRow | null;
  showAiConcierge?: boolean;
};

/**
 * Contact presentation for Listing Detail Alpha.
 * A = listing contact only when evidence exists (never invent).
 * B = Platform Customer Success (Apple) + AI Concierge — platform help only.
 * Never silently substitutes Apple/platform CS as the listing owner.
 */
export function ListingContactCard({
  locale,
  dict,
  propertyId,
  propertySlug,
  propertyTitle,
  agent,
  showAiConcierge = true,
}: Props) {
  const inquiry = buildListingInquiryContext({
    propertyId,
    propertySlug,
    propertyTitle,
  });
  const escalationHref = listingContactEscalationPath(
    localePath(locale, "/contact"),
    inquiry.propertySlug,
  );

  return (
    <div className="space-y-4" data-slot="listing-contact-card">
      <SurfaceCard
        className="space-y-3 p-5!"
        data-slot="listing-contact-block"
        aria-labelledby="listing-contact-heading"
      >
        <p
          id="listing-contact-heading"
          className="ds-caption text-[var(--brand)]"
        >
          {dict.property.contactListing}
        </p>
        <ListingContact locale={locale} dict={dict} agent={agent} />
      </SurfaceCard>

      <SurfaceCard
        className="space-y-3 p-5!"
        data-slot="request-viewing-block"
        aria-labelledby="listing-inquiry-heading"
      >
        <p
          id="listing-inquiry-heading"
          className="ds-caption text-[var(--brand)]"
        >
          {dict.property.inquiryForListing}
        </p>
        <ViewingRequestForm
          locale={locale}
          dict={dict}
          propertyId={inquiry.propertyId}
          propertySlug={inquiry.propertySlug}
          propertyTitle={inquiry.propertyTitle}
        />
      </SurfaceCard>

      <SurfaceCard
        tone="dashed"
        className="space-y-3 p-5!"
        data-slot="platform-support-block"
        aria-labelledby="platform-support-heading"
      >
        <div>
          <p
            id="platform-support-heading"
            className="ds-caption text-[var(--brand)]"
          >
            {dict.property.contactPlatform}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            {dict.property.contactPlatformNote}
          </p>
        </div>
        <PlatformCustomerSuccess
          locale={locale}
          dict={dict}
          showEscalationLink
          escalationHref={escalationHref}
        />
        {showAiConcierge ? <AiConcierge dict={dict} /> : null}
      </SurfaceCard>
    </div>
  );
}
