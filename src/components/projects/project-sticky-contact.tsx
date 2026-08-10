import Link from "next/link";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";

import { ContactChannelLink } from "@/components/contact/contact-channel-link";
import type { Locale } from "@/config/locales";
import {
  toLineHref,
  toTelHref,
  toWhatsAppHref,
} from "@/lib/config/contact-links";
import {
  getPlatformCustomerSuccessContacts,
  pickI18n,
} from "@/lib/config/contacts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

type ProjectStickyContactProps = {
  locale: Locale;
  dict: Dictionary;
  projectSlug: string;
  projectTitle: string;
};

/**
 * Persistent project contact strip: WhatsApp · LINE · Phone · Book Viewing.
 * Uses existing Platform Customer Success contacts — no redesign of the page.
 */
export function ProjectStickyContact({
  locale,
  dict,
  projectSlug,
  projectTitle,
}: ProjectStickyContactProps) {
  const pl = dict.projectLanding;
  const contact =
    getPlatformCustomerSuccessContacts().find((c) => c.active) ?? null;
  if (!contact) return null;

  const telHref = toTelHref(contact.phone);
  const waHref = toWhatsAppHref(contact.whatsapp);
  const lineHref = toLineHref(contact.line);
  const lineFallbackHref =
    contact.line_qr != null
      ? localePath(locale, `/contact#contact-${contact.id}`)
      : null;
  const lineAction = lineHref || lineFallbackHref;
  const viewingHref = `#lead`;
  const waMessage = encodeURIComponent(
    locale === "zh"
      ? `你好，我想了解项目：${projectTitle}`
      : locale === "th"
        ? `สวัสดี ต้องการสอบถามโครงการ ${projectTitle}`
        : `Hi, I'd like to ask about ${projectTitle}`,
  );
  const waWithContext = waHref ? `${waHref}?text=${waMessage}` : null;

  return (
    <div
      data-slot="project-sticky-contact"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--brand-line)] bg-white/95 shadow-[0_-8px_24px_rgba(6,61,56,0.1)] backdrop-blur-sm"
    >
      <div className="ds-container flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3">
        <p className="hidden text-xs text-stone-600 sm:block lg:text-sm">
          {pl.stickyLabel}
          <span className="ml-1 font-medium text-[var(--brand-deep)]">
            {projectTitle}
          </span>
        </p>
        <nav
          aria-label={pl.stickyNavLabel}
          className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
        >
          {waWithContext ? (
            <ContactChannelLink
              href={waWithContext}
              data-contact-channel="whatsapp"
              data-slot="sticky-whatsapp"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-2 text-xs font-medium text-white hover:bg-[var(--brand-deep)] sm:px-3 sm:text-sm"
            >
              <MessageCircle className="size-3.5 shrink-0" aria-hidden />
              <span>{dict.contact.whatsapp}</span>
            </ContactChannelLink>
          ) : null}
          {lineAction ? (
            lineHref ? (
              <ContactChannelLink
                href={lineHref}
                data-contact-channel="line"
                data-slot="sticky-line"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-line)] bg-white px-2 text-xs font-medium text-[var(--brand-deep)] hover:border-[var(--brand)]/40 sm:px-3 sm:text-sm"
              >
                <span>{dict.contact.line}</span>
              </ContactChannelLink>
            ) : (
              <Link
                href={lineAction}
                data-contact-channel="line"
                data-slot="sticky-line"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-line)] bg-white px-2 text-xs font-medium text-[var(--brand-deep)] hover:border-[var(--brand)]/40 sm:px-3 sm:text-sm"
              >
                <span>{dict.contact.line}</span>
              </Link>
            )
          ) : null}
          {telHref ? (
            <ContactChannelLink
              href={telHref}
              data-contact-channel="phone"
              data-slot="sticky-phone"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-line)] bg-white px-2 text-xs font-medium text-[var(--brand-deep)] hover:border-[var(--brand)]/40 sm:px-3 sm:text-sm"
            >
              <Phone className="size-3.5 shrink-0" aria-hidden />
              <span>{dict.contact.phone}</span>
            </ContactChannelLink>
          ) : null}
          <a
            href={viewingHref}
            data-slot="sticky-book-viewing"
            data-project-slug={projectSlug}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-line)] bg-white px-2 text-xs font-medium text-[var(--brand-deep)] hover:border-[var(--brand)]/40 sm:px-3 sm:text-sm"
          >
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span>{pl.bookViewing}</span>
          </a>
        </nav>
        <p className="sr-only">
          {pickI18n(contact.availability, locale)}
        </p>
      </div>
    </div>
  );
}
