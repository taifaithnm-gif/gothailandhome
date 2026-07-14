import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, localeHtmlLang, locales } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <div
      lang={localeHtmlLang[lang]}
      className="flex min-h-full flex-1 flex-col"
    >
      <SiteHeader locale={lang} dict={dict} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={lang} dict={dict} />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(localeHtmlLang[lang])};`,
        }}
      />
    </div>
  );
}
