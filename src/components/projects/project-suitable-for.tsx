import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import {
  getFeaturedLaunchProjectById,
  getLaunchAreaById,
  projectSummary,
  type LocalizedString,
} from "@/lib/launch/content-launch-v1";
import { cn } from "@/lib/utils";

type ProjectSuitableForProps = {
  locale: Locale;
  dict: Dictionary;
  projectSlug: string;
  /** City slug used for area-level retirement / lifestyle context when present. */
  citySlug?: string | null;
};

function pickLocalized(
  value: LocalizedString | undefined,
  locale: Locale,
): string | null {
  if (!value) return null;
  const text = (value[locale] || value.en || "").trim();
  return text || null;
}

function mentionsFamily(text: string): boolean {
  return /famil(?:y|ies)|家庭|ครอบครัว/i.test(text);
}

function mentionsRetirement(text: string): boolean {
  return /retire|退休|เกษียณ/i.test(text);
}

/**
 * Enquiry-motivation blocks from existing launch corpus only.
 * Never invents buyer personas — hides sections without verified copy.
 */
export function ProjectSuitableFor({
  locale,
  dict,
  projectSlug,
  citySlug,
}: ProjectSuitableForProps) {
  const pl = dict.projectLanding;
  const featured = getFeaturedLaunchProjectById(projectSlug);
  if (!featured) return null;

  const buyerFit = pickLocalized(featured.buyer_fit, locale);
  const investment = pickLocalized(featured.investment_angle, locale);
  const living =
    pickLocalized(featured.facility_summary, locale) ||
    projectSummary(featured, locale) ||
    null;

  const area = getLaunchAreaById(citySlug === "bangkok" || !citySlug ? "bangkok" : citySlug)
    ?? getLaunchAreaById("bangkok");
  const areaProfile = pickLocalized(area?.suitable_buyer_profile, locale);
  const areaLifestyle = pickLocalized(area?.lifestyle_characteristics, locale);
  const areaInvestment = pickLocalized(area?.investment_considerations, locale);

  const familyText = buyerFit && mentionsFamily(buyerFit) ? buyerFit : null;
  const retirementText =
    areaProfile && mentionsRetirement(areaProfile) ? areaProfile : null;

  const livingText = living || areaLifestyle;
  const investmentText = investment || areaInvestment;

  if (
    !buyerFit &&
    !investmentText &&
    !livingText &&
    !familyText &&
    !retirementText
  ) {
    return null;
  }

  return (
    <section
      id="suitable-for"
      className="scroll-mt-24 space-y-4"
      aria-labelledby="project-suitable-heading"
      data-slot="project-suitable-for"
    >
      <div>
        <h2 id="project-suitable-heading" className="ds-h2 text-2xl">
          {pl.suitableForTitle}
        </h2>
        <p className="mt-2 text-sm text-stone-600">{pl.suitableForNote}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {buyerFit ? (
          <SurfaceCard className="space-y-2 p-4!" data-slot="suitable-overview">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
              {pl.suitableForTitle}
            </h3>
            <p className="text-sm leading-relaxed text-stone-700">{buyerFit}</p>
          </SurfaceCard>
        ) : null}

        {investmentText ? (
          <SurfaceCard className="space-y-2 p-4!" data-slot="suitable-investment">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
              {pl.suitableInvestment}
            </h3>
            <p className="text-sm leading-relaxed text-stone-700">
              {investmentText}
            </p>
            <Link
              href={localePath(
                locale,
                "/knowledge/articles/rental-investment-thailand",
              )}
              className="inline-flex text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
            >
              {dict.contentLinks.rentalInvestment}
            </Link>
          </SurfaceCard>
        ) : null}

        {livingText ? (
          <SurfaceCard className="space-y-2 p-4!" data-slot="suitable-living">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
              {pl.suitableLiving}
            </h3>
            <p className="text-sm leading-relaxed text-stone-700">{livingText}</p>
          </SurfaceCard>
        ) : null}

        {familyText ? (
          <SurfaceCard className="space-y-2 p-4!" data-slot="suitable-family">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
              {pl.suitableFamily}
            </h3>
            <Link
              href={localePath(
                locale,
                "/knowledge/articles/family-living-thailand",
              )}
              className="inline-flex text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
            >
              {dict.contentLinks.familyLiving}
            </Link>
          </SurfaceCard>
        ) : null}

        {retirementText ? (
          <SurfaceCard
            className="space-y-2 p-4!"
            data-slot="suitable-retirement"
          >
            <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
              {pl.suitableRetirement}
            </h3>
            <p className="text-sm leading-relaxed text-stone-700">
              {retirementText}
            </p>
            <Link
              href={localePath(
                locale,
                "/knowledge/articles/thailand-retirement-guide",
              )}
              className="inline-flex text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
            >
              {dict.contentLinks.retirementGuide}
            </Link>
          </SurfaceCard>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="#lead"
          className={cn(buttonVariants({ variant: "primary" }))}
          data-slot="suitable-enquire-cta"
        >
          {pl.ctaLead}
        </a>
        <Link
          href={localePath(locale, "/contact")}
          className={cn(buttonVariants({ variant: "secondary" }))}
          data-slot="suitable-contact-cta"
        >
          {dict.common.contactCta}
        </Link>
      </div>
    </section>
  );
}
