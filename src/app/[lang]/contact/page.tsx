import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import {
  formatLanguages,
  getActiveContacts,
  getContactsConfiguration,
  pickI18n,
} from "@/lib/config/contacts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/i18n/metadata";

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

  const dict = await getDictionary(lang);
  const config = getContactsConfiguration();
  const contacts = getActiveContacts();

  return (
    <PageShell
      title={dict.contact.title}
      subtitle={dict.contact.subtitle}
      notice={dict.common.placeholderNotice}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--brand-deep)]">
              {dict.contact.name}
            </span>
            <input
              type="text"
              name="name"
              className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--brand-deep)]">
              {dict.contact.email}
            </span>
            <input
              type="email"
              name="email"
              className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-[var(--brand-deep)]">
              {dict.contact.message}
            </span>
            <textarea
              name="message"
              rows={5}
              className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
          >
            {dict.contact.submit}
          </button>
          <p className="text-sm text-stone-500">{dict.contact.note}</p>
        </form>

        <aside className="space-y-4 rounded-2xl bg-[var(--brand-deep)] p-6 text-white sm:p-8">
          <div>
            <h2 className="font-heading text-2xl">
              {pickI18n(config.office.title, lang)}
            </h2>
            <p className="mt-3 text-white/75">
              {pickI18n(config.office.body, lang)}
            </p>
          </div>
          <div className="space-y-4 text-sm text-white/80">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="space-y-1 border-t border-white/15 pt-4 first:border-t-0 first:pt-0"
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
                    {dict.contact.phone}: {contact.phone}
                  </p>
                ) : null}
                {contact.whatsapp ? (
                  <p>
                    {dict.contact.whatsapp}: {contact.whatsapp}
                  </p>
                ) : null}
                {contact.line ? (
                  <p>
                    {dict.contact.line}: {contact.line}
                  </p>
                ) : null}
                {contact.line_qr ? (
                  <div className="pt-1">
                    <p className="mb-1">{dict.contact.line}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contact.line_qr}
                      alt={`${contact.name} LINE QR`}
                      className="h-28 w-28 rounded-md bg-white object-contain p-1"
                    />
                  </div>
                ) : null}
                {contact.wechat ? (
                  <p>
                    {dict.contact.wechat}: {contact.wechat}
                  </p>
                ) : null}
                {contact.wechat_qr ? (
                  <div className="pt-1">
                    <p className="mb-1">{dict.contact.wechat}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contact.wechat_qr}
                      alt={`${contact.name} WeChat QR`}
                      className="h-28 w-28 rounded-md bg-white object-contain p-1"
                    />
                  </div>
                ) : null}
                {contact.email ? (
                  <p>
                    {dict.contact.email}: {contact.email}
                  </p>
                ) : null}
                <p>
                  {dict.contact.availability}:{" "}
                  {pickI18n(contact.availability, lang)}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
