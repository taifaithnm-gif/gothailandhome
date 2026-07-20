"use client";

import { Button } from "@/components/ui/button";
import { useAnalyticsConsent } from "@/components/analytics/analytics-provider";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AnalyticsConsentBannerProps = {
  dict: Dictionary;
};

export function AnalyticsConsentBanner({ dict }: AnalyticsConsentBannerProps) {
  const { consent, hydrated, grant, deny } = useAnalyticsConsent();
  const a = dict.analytics;

  if (!hydrated || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-body"
      data-slot="analytics-consent-banner"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--brand-line)] bg-white p-4 shadow-[0_-8px_24px_rgba(6,61,56,0.12)]"
    >
      <div className="ds-container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p
            id="analytics-consent-title"
            className="text-sm font-medium text-[var(--brand-deep)]"
          >
            {a.consentTitle}
          </p>
          <p id="analytics-consent-body" className="text-xs leading-relaxed text-stone-600">
            {a.consentBody}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={deny}>
            {a.deny}
          </Button>
          <Button type="button" size="sm" onClick={grant}>
            {a.grant}
          </Button>
        </div>
      </div>
    </div>
  );
}
