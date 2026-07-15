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
  /** Optional Alpha assistive panel — never a listing agent substitute. */
  showAiConcierge?: boolean;
};

/**
 * Listing contact card — composes ListingContact + viewing form + Platform CS.
 * Never silently substitutes Apple/platform CS as the listing owner.
 * Platform support is shown only as a separate help/escalation path.
 */
export function ListingContactCard({
  locale,
  dict,
  propertyId,
  agent,
  showAiConcierge = true,
}: Props) {
  return (
    <SurfaceCard className="space-y-4 p-6!" data-slot="listing-contact-card">
      <ListingContact locale={locale} dict={dict} agent={agent} />

      <ViewingRequestForm locale={locale} dict={dict} propertyId={propertyId} />

      <PlatformCustomerSuccess locale={locale} dict={dict} />

      {showAiConcierge ? <AiConcierge dict={dict} /> : null}
    </SurfaceCard>
  );
}
