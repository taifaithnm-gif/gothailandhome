"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

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
  /** When false, Blog is omitted from desktop/mobile chrome. */
  showBlog?: boolean;
};

/** Always visible on desktop — fits common widths without clipping. */
const DESKTOP_PRIMARY_IDS = new Set([
  "buy",
  "rent",
  "properties",
  "projects",
  "cities",
  "developers",
  "marketplace",
  "knowledge",
]);

/** Reachable via More menu — never clipped/hidden without a control. */
const DESKTOP_MORE_IDS = new Set([
  "favorites",
  "compare",
  "faq",
  "blog",
  "about",
  "partners",
]);

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

export function SiteHeader({ locale, dict, showBlog = true }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreMenuId = useId();
  const homeHref = localePath(locale);
  const groups = getSiteNavGroups(locale, dict, { showBlog });
  const allLinks = groups.flatMap((group) => group.links);
  const contactLink = allLinks.find((link) => link.id === "contact");
  const desktopPrimary = allLinks.filter((link) =>
    DESKTOP_PRIMARY_IDS.has(link.id),
  );
  const desktopMore = allLinks.filter((link) => DESKTOP_MORE_IDS.has(link.id));
  const moreActive = desktopMore.some((link) =>
    isNavLinkActive(pathname, link.href, homeHref),
  );

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  function renderLink(link: SiteNavLink, onNavigate?: () => void) {
    const active = isNavLinkActive(pathname, link.href, homeHref);

    return (
      <Link
        key={link.id}
        href={link.href}
        className={cn(
          "rounded-sm text-sm whitespace-nowrap transition-colors",
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

  const moreLabel =
    locale === "zh" ? "更多" : locale === "th" ? "เพิ่มเติม" : "More";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur-md">
      <div className="ds-container flex h-16 items-center justify-between gap-3">
        <Link
          href={homeHref}
          className={cn(
            "shrink-0 font-heading text-lg tracking-tight transition-opacity hover:opacity-90 sm:text-xl",
            navLinkFocusClass,
          )}
        >
          {dict.common.brand}
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex xl:gap-5"
          aria-label={dict.nav.primary}
          data-slot="desktop-primary-nav"
        >
          {desktopPrimary.map((link) => renderLink(link))}
          {desktopMore.length ? (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm text-sm whitespace-nowrap transition-colors",
                  navLinkFocusClass,
                  moreOpen || moreActive
                    ? "text-[var(--brand-gold)]"
                    : "text-white/80 hover:text-white",
                )}
                aria-expanded={moreOpen}
                aria-controls={moreMenuId}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((value) => !value)}
              >
                {moreLabel}
                <ChevronDown
                  className={cn(
                    "size-3.5 transition",
                    moreOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {moreOpen ? (
                <div
                  id={moreMenuId}
                  role="menu"
                  className="absolute top-full right-0 z-50 mt-2 min-w-[11rem] rounded-lg border border-white/10 bg-[var(--brand-deep)] py-2 shadow-lg"
                >
                  {desktopMore.map((link) => {
                    const active = isNavLinkActive(
                      pathname,
                      link.href,
                      homeHref,
                    );
                    return (
                      <Link
                        key={link.id}
                        role="menuitem"
                        href={link.href}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          navLinkFocusClass,
                          active
                            ? "bg-white/10 text-[var(--brand-gold)]"
                            : "text-white/90 hover:bg-white/10 hover:text-white",
                        )}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        {contactLink ? (
          <Link
            href={contactLink.href}
            className={cn(
              "hidden shrink-0 rounded-sm text-sm font-medium transition-colors lg:inline",
              navLinkFocusClass,
              isNavLinkActive(pathname, contactLink.href, homeHref)
                ? "text-[var(--brand-gold)]"
                : "text-white hover:text-[var(--brand-gold)]",
            )}
            aria-current={
              isNavLinkActive(pathname, contactLink.href, homeHref)
                ? "page"
                : undefined
            }
            data-nav="contact-pinned"
          >
            {contactLink.label}
          </Link>
        ) : null}

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
            className="hidden shrink-0 items-center gap-2 md:flex"
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
