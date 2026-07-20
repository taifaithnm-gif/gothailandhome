"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { locales, localeLabels, type Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import {
  getSiteNavGroups,
  isNavLinkActive,
  swapLocaleHref,
  type SiteNavLink,
} from "@/lib/navigation/site-nav";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

const navLinkFocusClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]";

function LocaleSwitcher({
  locale,
  dict,
  className,
  linkClassName,
  onNavigate,
}: {
  locale: Locale;
  dict: Dictionary;
  className?: string;
  linkClassName?: (active: boolean) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <div className={className} aria-label={dict.nav.language}>
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={swapLocaleHref(pathname, item, search)}
            className={cn(navLinkFocusClass, linkClassName?.(active))}
            hrefLang={item === "zh" ? "zh-CN" : item}
            aria-current={active ? "true" : undefined}
            onClick={onNavigate}
          >
            {localeLabels[item]}
          </Link>
        );
      })}
    </div>
  );
}

function LocaleSwitcherFallback({
  locale,
  dict,
  pathname,
  className,
  linkClassName,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
  className?: string;
  linkClassName?: (active: boolean) => string;
}) {
  return (
    <div className={className} aria-label={dict.nav.language}>
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={swapLocaleHref(pathname, item)}
            className={cn(navLinkFocusClass, linkClassName?.(active))}
            hrefLang={item === "zh" ? "zh-CN" : item}
            aria-current={active ? "true" : undefined}
          >
            {localeLabels[item]}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const homeHref = localePath(locale);
  const groups = getSiteNavGroups(locale, dict);

  function renderLink(link: SiteNavLink, onNavigate?: () => void) {
    const active = isNavLinkActive(pathname, link.href, homeHref);

    return (
      <Link
        key={link.id}
        href={link.href}
        className={cn(
          "rounded-sm text-sm transition-colors",
          navLinkFocusClass,
          active ? "text-[var(--brand-gold)]" : "text-white/80 hover:text-white",
        )}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  }

  function renderMobileLink(link: SiteNavLink) {
    const active = isNavLinkActive(pathname, link.href, homeHref);

    return (
      <Link
        key={link.id}
        href={link.href}
        className={cn(
          "rounded-md px-3 py-2 text-sm transition-colors",
          navLinkFocusClass,
          active
            ? "bg-white/15 text-[var(--brand-gold)]"
            : "text-white/90 hover:bg-white/10",
        )}
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </Link>
    );
  }

  const localeLinkClass = (active: boolean) =>
    cn(
      "rounded-md px-2 py-1 text-xs transition-colors",
      active
        ? "bg-white/15 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white",
    );

  const mobileLocaleLinkClass = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2 text-sm transition-colors",
      active
        ? "bg-white/15 text-white"
        : "text-white/70 hover:bg-white/10",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur-md">
      <div className="ds-container flex h-16 items-center justify-between gap-4">
        <Link
          href={homeHref}
          className={cn(
            "font-heading text-lg tracking-tight transition-opacity hover:opacity-90 sm:text-xl",
            navLinkFocusClass,
          )}
        >
          {dict.common.brand}
        </Link>

        <nav
          className="hidden max-w-[42rem] items-center gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex xl:max-w-none xl:gap-6"
          aria-label="Primary"
        >
          {groups.map((group, index) => (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className={cn(
                "flex shrink-0 items-center gap-5 xl:gap-6",
                index > 0 &&
                  "border-l border-white/15 pl-5 xl:pl-6",
              )}
            >
              {group.links.map((link) => renderLink(link))}
            </div>
          ))}
        </nav>

        <Suspense
          fallback={
            <LocaleSwitcherFallback
              locale={locale}
              dict={dict}
              pathname={pathname}
              className="hidden items-center gap-2 md:flex"
              linkClassName={localeLinkClass}
            />
          }
        >
          <LocaleSwitcher
            locale={locale}
            dict={dict}
            className="hidden items-center gap-2 md:flex"
            linkClassName={localeLinkClass}
          />
        </Suspense>

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
            {groups.map((group) => (
              <nav
                key={group.id}
                aria-label={group.label}
                className="flex flex-col gap-1"
              >
                <p className="ds-caption px-3 text-white/50">{group.label}</p>
                {group.links.map((link) => renderMobileLink(link))}
              </nav>
            ))}
            <Suspense
              fallback={
                <LocaleSwitcherFallback
                  locale={locale}
                  dict={dict}
                  pathname={pathname}
                  className="flex flex-wrap gap-2 border-t border-white/10 pt-3"
                  linkClassName={mobileLocaleLinkClass}
                />
              }
            >
              <LocaleSwitcher
                locale={locale}
                dict={dict}
                className="flex flex-wrap gap-2 border-t border-white/10 pt-3"
                linkClassName={mobileLocaleLinkClass}
                onNavigate={() => setOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      ) : null}
    </header>
  );
}
