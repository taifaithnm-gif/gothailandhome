import { notFound } from "next/navigation";

import { AnalyticsConsentBanner } from "@/components/analytics/consent-banner";
import { AnalyticsPageView } from "@/components/analytics/page-view-tracker";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { CompareProvider } from "@/components/compare/compare-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, localeHtmlLang, locales } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  documentBodyStyle,
  documentFontClassName,
  documentMetadata,
} from "@/lib/ui/document-fonts";

import "../globals.css";

export const metadata = documentMetadata;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Locale root layout — owns `<html lang>` so EN/ZH/TH are server-rendered
 * (BCP 47 via `localeHtmlLang`) without a client hydration patch.
 * See Next.js App Router i18n guide: root layout may live under `app/[lang]`.
 */
export default async function LocaleRootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const htmlLang = localeHtmlLang[lang];

  return (
    <html lang={htmlLang} className={documentFontClassName}>
      <body
        className="flex min-h-full flex-col font-sans"
        style={documentBodyStyle}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/70"
        >
          {dict.nav.skipToContent}
        </a>
        <AnalyticsProvider>
          <FavoritesProvider>
            <CompareProvider>
              <div className="flex min-h-full flex-1 flex-col">
                <SiteHeader locale={lang} dict={dict} />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <SiteFooter locale={lang} dict={dict} />
              </div>
              <AnalyticsPageView locale={lang} />
              <AnalyticsConsentBanner dict={dict} />
            </CompareProvider>
          </FavoritesProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
