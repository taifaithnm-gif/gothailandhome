import {
  AiConcierge,
  ListingContact,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { ViewingRequestForm } from "@/components/property/viewing-request-form";
import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { AgentRow } from "@/lib/supabase/types";

type Props = {
  locale: Locale;
  dict: Dictionary;
  propertyId: string;
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
  agent,
  showAiConcierge = true,
}: Props) {
  return (
    <div className="space-y-4" data-slot="listing-contact-card">
      <SurfaceCard className="space-y-3 p-5!" data-slot="listing-contact-block">
        <p className="ds-caption text-[var(--brand)]">
          {dict.property.contactListing}
        </p>
        <ListingContact locale={locale} dict={dict} agent={agent} />
      </SurfaceCard>

      <SurfaceCard className="space-y-3 p-5!" data-slot="request-viewing-block">
        <ViewingRequestForm
          locale={locale}
          dict={dict}
          propertyId={propertyId}
        />
      </SurfaceCard>

      <SurfaceCard
        tone="dashed"
        className="space-y-3 p-5!"
        data-slot="platform-support-block"
      >
        <div>
          <p className="ds-caption text-[var(--brand)]">
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
        />
        {showAiConcierge ? <AiConcierge dict={dict} /> : null}
      </SurfaceCard>
    </div>
  );
}
