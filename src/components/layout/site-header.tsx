"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { locales, localeLabels, type Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

function swapLocale(pathname: string, nextLocale: Locale) {
  const segments = pathname.split("/");
  if (segments.length > 1) {
    segments[1] = nextLocale;
  }
  return segments.join("/") || `/${nextLocale}`;
}

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const browse = [
    { href: localePath(locale), label: dict.nav.home },
    { href: localePath(locale, "/buy"), label: dict.nav.buy },
    { href: localePath(locale, "/rent"), label: dict.nav.rent },
    { href: localePath(locale, "/projects"), label: dict.nav.projects },
    { href: localePath(locale, "/cities"), label: dict.nav.cities },
    { href: localePath(locale, "/developers"), label: dict.nav.developers },
  ];

  const marketplace = [
    { href: localePath(locale, "/marketplace"), label: dict.nav.marketplace },
  ];

  const company = [
    { href: localePath(locale, "/knowledge"), label: dict.nav.knowledge },
    { href: localePath(locale, "/properties"), label: dict.nav.properties },
    { href: localePath(locale, "/about"), label: dict.nav.about },
    { href: localePath(locale, "/contact"), label: dict.nav.contact },
  ];

  const desktopLinks = [...browse, ...marketplace, ...company];

  function renderLink(
    link: { href: string; label: string },
    onNavigate?: () => void,
  ) {
    const active =
      pathname === link.href ||
      (link.href !== localePath(locale) && pathname.startsWith(link.href));

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "rounded-sm text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]",
          active
            ? "text-[var(--brand-gold)]"
            : "text-white/80 hover:text-white",
        )}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur-md">
      <div className="ds-container flex h-16 items-center justify-between gap-4">
        <Link
          href={localePath(locale)}
          className="font-heading text-lg tracking-tight transition-opacity hover:opacity-90 sm:text-xl"
        >
          {dict.common.brand}
        </Link>

        <nav
          className="hidden max-w-[42rem] items-center gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex xl:max-w-none xl:gap-6"
          aria-label="Primary"
        >
          {desktopLinks.map((link) => renderLink(link))}
        </nav>

        <div
          className="hidden items-center gap-2 md:flex"
          aria-label={dict.nav.language}
        >
          {locales.map((item) => (
            <Link
              key={item}
              href={swapLocale(pathname, item)}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]",
                item === locale
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
              hrefLang={item === "zh" ? "zh-CN" : item}
            >
              {localeLabels[item]}
            </Link>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? dict.nav.close : dict.nav.menu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-[var(--brand-deep)] lg:hidden"
        >
          <div className="ds-container flex flex-col gap-4 py-4">
            <nav
              aria-label={dict.nav.sectionBrowse}
              className="flex flex-col gap-1"
            >
              <p className="ds-caption px-3 text-white/50">
                {dict.nav.sectionBrowse}
              </p>
              {browse.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav
              aria-label={dict.nav.sectionMarketplace}
              className="flex flex-col gap-1"
            >
              <p className="ds-caption px-3 text-white/50">
                {dict.nav.sectionMarketplace}
              </p>
              {marketplace.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav
              aria-label={dict.nav.sectionCompany}
              className="flex flex-col gap-1"
            >
              <p className="ds-caption px-3 text-white/50">
                {dict.nav.sectionCompany}
              </p>
              {company.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
              {locales.map((item) => (
                <Link
                  key={item}
                  href={swapLocale(pathname, item)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm",
                    item === locale
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10",
                  )}
                  hrefLang={item === "zh" ? "zh-CN" : item}
                  onClick={() => setOpen(false)}
                >
                  {localeLabels[item]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
