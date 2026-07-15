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

  const links = [
    { href: localePath(locale), label: dict.nav.home },
    { href: localePath(locale, "/properties"), label: dict.nav.properties },
    { href: localePath(locale, "/projects"), label: dict.nav.projects },
    { href: localePath(locale, "/cities"), label: dict.nav.cities },
    { href: localePath(locale, "/developers"), label: dict.nav.developers },
    { href: localePath(locale, "/find-my-home"), label: dict.nav.findMyHome },
    {
      href: localePath(locale, "/list-your-property"),
      label: dict.nav.listProperty,
    },
    { href: localePath(locale, "/search"), label: dict.nav.search },
    { href: localePath(locale, "/about"), label: dict.nav.about },
    { href: localePath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={localePath(locale)}
          className="font-heading text-lg tracking-tight transition-opacity hover:opacity-90 sm:text-xl"
        >
          {dict.common.brand}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== localePath(locale) &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "text-[var(--brand-gold)]"
                    : "text-white/80 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
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
                "rounded-md px-2 py-1 text-xs transition-colors",
                item === locale
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
              hrefLang={item}
            >
              {localeLabels[item]}
            </Link>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white md:hidden"
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
          className="border-t border-white/10 bg-[var(--brand-deep)] md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
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
                  onClick={() => setOpen(false)}
                >
                  {localeLabels[item]}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
