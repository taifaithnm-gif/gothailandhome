"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAnalyticsConsent } from "@/components/analytics/analytics-provider";
import { trackPageView } from "@/lib/analytics";
import type { Locale } from "@/config/locales";

type AnalyticsPageViewProps = {
  locale: Locale;
};

/**
 * Fires page_view once per path after consent is granted.
 */
export function AnalyticsPageView({ locale }: AnalyticsPageViewProps) {
  const pathname = usePathname();
  const { allowed } = useAnalyticsConsent();

  useEffect(() => {
    if (!allowed || !pathname) return;
    const path = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
    trackPageView(locale, path);
  }, [allowed, locale, pathname]);

  return null;
}
