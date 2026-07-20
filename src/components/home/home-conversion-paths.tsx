import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type HomeConversionPathsProps = {
  locale: Locale;
  dict: Dictionary;
};

const pathCardClass =
  "flex h-full flex-col rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 transition outline-none hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[var(--shadow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35";

/**
 * Primary homepage conversion paths: buy → rent → filtered sale scan.
 * Inquiry (Find My Home / contact) stays in hero and support sections.
 */
export function HomeConversionPaths({
  locale,
  dict,
}: HomeConversionPathsProps) {
  const h = dict.home;
  const paths = [
    {
      id: "buy",
      href: localePath(locale, "/buy"),
      title: h.buy,
      body: h.buyBody,
      cta: h.buyCta,
    },
    {
      id: "rent",
      href: localePath(locale, "/rent"),
      title: h.rent,
      body: h.rentBody,
      cta: h.rentCta,
    },
    {
      id: "sale-scan",
      href: `${localePath(locale, "/properties")}?listing_type=sale&city=bangkok&sort=price_asc`,
      title: h.investment,
      body: h.investmentBody,
      cta: h.investmentCta,
    },
  ] as const;

  return (
    <section
      data-home-section="paths"
      className="border-b border-[var(--brand-line)] bg-[var(--brand-soft)]"
      aria-labelledby="home-paths-heading"
    >
      <div className="ds-container ds-section">
        <div className="mb-8 max-w-2xl">
          <h2 id="home-paths-heading" className="ds-h2">
            {h.pathsTitle}
          </h2>
          <p className="mt-2 text-stone-600">{h.pathsSubtitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={path.href}
              data-home-cta={path.id}
              className={cn(pathCardClass)}
            >
              <h3 className="font-heading text-lg text-[var(--brand-deep)]">
                {path.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                {path.body}
              </p>
              <span className="mt-4 text-sm font-medium text-[var(--brand)]">
                {path.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
