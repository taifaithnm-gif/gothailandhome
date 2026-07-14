import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
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
              {dict.contact.officeTitle}
            </h2>
            <p className="mt-3 text-white/75">{dict.contact.officeBody}</p>
          </div>
          <div className="space-y-1 text-sm text-white/80">
            <p>{dict.contact.emailValue}</p>
            <p>{dict.contact.phoneValue}</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
