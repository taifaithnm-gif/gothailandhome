import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

type SiteFooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const explore = [
    { href: localePath(locale, "/buy"), label: dict.nav.buy },
    { href: localePath(locale, "/rent"), label: dict.nav.rent },
    { href: localePath(locale, "/properties"), label: dict.nav.properties },
    { href: localePath(locale, "/projects"), label: dict.nav.projects },
    { href: localePath(locale, "/cities"), label: dict.nav.cities },
    { href: localePath(locale, "/developers"), label: dict.nav.developers },
    { href: localePath(locale, "/marketplace"), label: dict.nav.marketplace },
    { href: localePath(locale, "/search"), label: dict.nav.search },
  ];

  const company = [
    { href: localePath(locale, "/about"), label: dict.nav.about },
    { href: localePath(locale, "/knowledge"), label: dict.nav.knowledge },
    {
      href: localePath(locale, "/partners/developers"),
      label: dict.nav.partners,
    },
    { href: localePath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <footer className="mt-auto border-t border-[var(--brand-line)] bg-[var(--brand-deep)] text-white">
      <div className="ds-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-heading text-xl tracking-tight">
            {dict.common.brand}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            {dict.footer.tagline}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[var(--brand-gold)]">
            {dict.footer.explore}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[var(--brand-gold)]">
            {dict.footer.company}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            {company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="ds-container flex py-4 text-xs text-white/55">
          © {year} {dict.common.brand}. {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
