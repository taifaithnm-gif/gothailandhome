import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactChannelLink } from "@/components/contact/contact-channel-link";
import { PageShell } from "@/components/layout/page-shell";
import { PlatformCustomerSuccess } from "@/components/marketplace/contact-blocks";
import { PlatformSupportForm } from "@/components/marketplace/platform-support-form";
import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import { isLocale } from "@/config/locales";
import {
  toLineHref,
  toTelHref,
  toWeChatHref,
  toWhatsAppHref,
} from "@/lib/config/contact-links";
import {
  assertApplePlatformCustomerSuccessOnly,
  formatLanguages,
  getContactsConfiguration,
  getPlatformCustomerSuccessContacts,
  pickI18n,
} from "@/lib/config/contacts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import { MARKETPLACE_HUB_PATH } from "@/lib/marketplace/journey";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
    path: "/contact",
  });
}

export default async function ContactPage({
  params,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  assertApplePlatformCustomerSuccessOnly();

  const dict = await getDictionary(lang);
  const config = getContactsConfiguration();
  const contacts = getPlatformCustomerSuccessContacts();

  return (
    <PageShell
      title={dict.contact.title}
      subtitle={dict.contact.subtitle}
      breadcrumbs={[
        { label: dict.nav.home, href: localePath(lang) },
        {
          label: dict.nav.marketplace,
          href: localePath(lang, MARKETPLACE_HUB_PATH),
        },
        { label: dict.contact.title },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <PlatformSupportForm locale={lang} dict={dict} />
          <p className="text-sm text-stone-600" data-slot="contact-privacy-note">
            {dict.contact.privacyNote}
          </p>
          <SurfaceCard className="space-y-3 p-5!" data-slot="contact-journey">
            <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
              {dict.contact.journeyTitle}
            </h2>
            <p className="text-sm text-stone-600">{dict.contact.journeyBody}</p>
            <Link
              href={localePath(lang, MARKETPLACE_HUB_PATH)}
              className={cn(buttonVariants({ variant: "secondary" }))}
              data-slot="contact-marketplace-cta"
            >
              {dict.contact.journeyCta}
            </Link>
          </SurfaceCard>
        </div>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-2xl bg-[var(--brand-deep)] p-6 text-white sm:p-8">
            <div>
              <h2 className="font-heading text-2xl">
                {pickI18n(config.office.title, lang)}
              </h2>
              <p className="mt-3 text-white/75">
                {pickI18n(config.office.body, lang)}
              </p>
              <p className="mt-4 text-sm text-[var(--brand-gold)]">
                {dict.contact.platformSection}
              </p>
              <p className="mt-2 text-sm text-white/70">{dict.contact.note}</p>
            </div>
            <div className="space-y-4 text-sm text-white/80">
              {contacts.map((contact) => {
                const telHref = toTelHref(contact.phone);
                const waHref = toWhatsAppHref(contact.whatsapp);
                const lineHref = toLineHref(contact.line);
                const wechatHref = toWeChatHref(contact.wechat);
                return (
                  <div
                    key={contact.id}
                    id={`contact-${contact.id}`}
                    className="scroll-mt-24 space-y-1 border-t border-white/15 pt-4 first:border-t-0 first:pt-0"
                    data-contact-card={contact.id}
                  >
                    <p className="font-medium text-white">{contact.name}</p>
                    <p>
                      {dict.contact.role}: {pickI18n(contact.role, lang)}
                    </p>
                    <p>
                      {dict.contact.languages}:{" "}
                      {formatLanguages(contact.languages, lang)}
                    </p>
                    {contact.phone ? (
                      <p>
                        {dict.contact.phone}:{" "}
                        {telHref ? (
                          <ContactChannelLink
                            href={telHref}
                            className="text-white"
                            data-contact-channel="phone"
                          >
                            {contact.phone}
                          </ContactChannelLink>
                        ) : (
                          contact.phone
                        )}
                      </p>
                    ) : null}
                    {contact.whatsapp ? (
                      <p>
                        {dict.contact.whatsapp}:{" "}
                        {waHref ? (
                          <ContactChannelLink
                            href={waHref}
                            className="text-white"
                            data-contact-channel="whatsapp"
                          >
                            {contact.whatsapp}
                          </ContactChannelLink>
                        ) : (
                          contact.whatsapp
                        )}
                      </p>
                    ) : null}
                    {contact.line_qr || contact.line ? (
                      <div className="pt-1 space-y-1" data-contact-channel="line-qr">
                        <p className="mb-1">{dict.contact.line}</p>
                        {contact.line_qr ? (
                          lineHref ? (
                            <ContactChannelLink
                              href={lineHref}
                              className="inline-block"
                              data-contact-channel="line"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={contact.line_qr}
                                alt={`${contact.name} LINE QR`}
                                className="h-28 w-28 rounded-md bg-white object-contain p-1"
                              />
                            </ContactChannelLink>
                          ) : (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={contact.line_qr}
                                alt={`${contact.name} LINE QR`}
                                className="h-28 w-28 rounded-md bg-white object-contain p-1"
                              />
                              <p className="text-xs text-white/70">
                                {dict.contact.qrScanHint}
                              </p>
                            </>
                          )
                        ) : lineHref ? (
                          <ContactChannelLink
                            href={lineHref}
                            className="text-white"
                            data-contact-channel="line"
                          >
                            {dict.contact.line}
                          </ContactChannelLink>
                        ) : null}
                        {lineHref && contact.line_qr ? (
                          <p className="text-xs text-white/70">
                            {dict.contact.qrScanOrTapHint}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {contact.wechat_qr || contact.wechat ? (
                      <div className="pt-1 space-y-1" data-contact-channel="wechat-qr">
                        <p className="mb-1">{dict.contact.wechat}</p>
                        {contact.wechat_qr ? (
                          wechatHref ? (
                            <ContactChannelLink
                              href={wechatHref}
                              className="inline-block"
                              data-contact-channel="wechat"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={contact.wechat_qr}
                                alt={`${contact.name} WeChat QR`}
                                className="h-28 w-28 rounded-md bg-white object-contain p-1"
                              />
                            </ContactChannelLink>
                          ) : (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={contact.wechat_qr}
                                alt={`${contact.name} WeChat QR`}
                                className="h-28 w-28 rounded-md bg-white object-contain p-1"
                              />
                              <p className="text-xs text-white/70">
                                {dict.contact.qrScanHint}
                              </p>
                            </>
                          )
                        ) : wechatHref ? (
                          <ContactChannelLink
                            href={wechatHref}
                            className="text-white"
                            data-contact-channel="wechat"
                          >
                            {dict.contact.wechat}
                          </ContactChannelLink>
                        ) : contact.wechat ? (
                          <p>{contact.wechat}</p>
                        ) : null}
                        {wechatHref && contact.wechat_qr ? (
                          <p className="text-xs text-white/70">
                            {dict.contact.qrScanOrTapHint}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {contact.email ? (
                      <p>
                        {dict.contact.email}:{" "}
                        <ContactChannelLink
                          href={`mailto:${contact.email}`}
                          className="text-white"
                          data-contact-channel="email"
                        >
                          {contact.email}
                        </ContactChannelLink>
                      </p>
                    ) : null}
                    <p>
                      {dict.contact.availability}:{" "}
                      {pickI18n(contact.availability, lang)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <PlatformCustomerSuccess
            locale={lang}
            dict={dict}
            showEscalationLink={false}
          />
        </aside>
      </div>
    </PageShell>
  );
}
