import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AiConcierge,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge, VerificationBadge } from "@/components/ui/badge";
import { DeveloperCardShell, SurfaceCard } from "@/components/ui/card";
import { isLocale, type Locale } from "@/config/locales";
import {
  getPublishedDeveloperBySlug,
  listProjectsForDeveloperSlug,
  listPublishedDevelopers,
  type DeveloperView,
} from "@/lib/data/developers";
import {
  listPublishedPropertiesPaged,
  type PropertyView,
} from "@/lib/data/properties";
import {
  listPublishedProjects,
  type ProjectView,
} from "@/lib/data/projects";
import {
  DEVELOPER_LISTING_PREVIEW_SIZE,
  DEVELOPER_PROJECT_PREVIEW_SIZE,
  evidenceLabelKey,
  getDeveloperEvidence,
  hasVerifiedOfficialLogo,
  mayPresentFact,
  presentationClassFor,
  toVerificationLevel,
  type DeveloperPresentationClass,
} from "@/lib/developers/evidence";
import { getDeveloperPackageFacts } from "@/lib/developers/package-facts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  buildPageMetadata,
  fillTemplate,
  localePath,
} from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/developers/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const developer = await getPublishedDeveloperBySlug(slug);
  if (!developer) return {};
  return buildPageMetadata({
    locale: lang,
    title: developer.seoTitle[lang],
    description: developer.seoDescription[lang],
    path: `/developers/${slug}`,
  });
}

function evidenceLabel(
  dict: Dictionary,
  cls: DeveloperPresentationClass,
): string {
  return dict.developers[evidenceLabelKey(cls)];
}

function FactCell({
  label,
  value,
  cls,
  dict,
}: {
  label: string;
  value: string | null | undefined;
  cls: DeveloperPresentationClass;
  dict: Dictionary;
}) {
  const show =
    mayPresentFact(cls) && value != null && String(value).trim() !== "";
  return (
    <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
      <dt className="ds-caption text-stone-500">{label}</dt>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <dd className="text-sm font-medium text-[var(--brand-deep)]">
          {show ? value : dict.developers.unavailable}
        </dd>
        <VerificationBadge
          level={toVerificationLevel(cls)}
          label={evidenceLabel(dict, cls)}
        />
      </div>
    </div>
  );
}

function NeutralDeveloperMark({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const initial = (name.trim().slice(0, 1) || "?").toUpperCase();
  return (
    <div
      className="flex aspect-square w-full max-w-[10rem] flex-col items-center justify-center gap-2 rounded-[var(--card-radius)] bg-[linear-gradient(145deg,#0f4f49_0%,#1a6b63_48%,#c4a035_140%)] text-white"
      role="img"
      aria-label={label}
      data-slot="developer-logo-placeholder"
    >
      <span className="font-heading text-4xl">{initial}</span>
      <span className="px-3 text-center text-[10px] tracking-wide uppercase opacity-80">
        {label}
      </span>
    </div>
  );
}

async function loadSimilarDevelopers(
  developer: DeveloperView,
  projects: ProjectView[],
): Promise<DeveloperView[]> {
  const districtIds = new Set(
    projects.map((p) => p.districtId).filter(Boolean) as string[],
  );
  if (!districtIds.size) return [];

  const [allDevelopers, allProjects] = await Promise.all([
    listPublishedDevelopers(),
    listPublishedProjects(),
  ]);

  const projectsByDeveloper = new Map<string, ProjectView[]>();
  for (const project of allProjects) {
    const key = project.developer?.slug;
    if (!key) continue;
    const list = projectsByDeveloper.get(key) ?? [];
    list.push(project);
    projectsByDeveloper.set(key, list);
  }

  const scored: Array<{ developer: DeveloperView; score: number }> = [];
  for (const candidate of allDevelopers) {
    if (candidate.slug === developer.slug) continue;
    const candidateProjects = projectsByDeveloper.get(candidate.slug) ?? [];
    const overlap = candidateProjects.filter(
      (p) => p.districtId && districtIds.has(p.districtId),
    ).length;
    if (overlap > 0) {
      scored.push({ developer: candidate, score: overlap });
    }
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || a.developer.slug.localeCompare(b.developer.slug),
  );
  return scored.slice(0, 4).map((row) => row.developer);
}

export default async function DeveloperDetailPage({
  params,
}: PageProps<"/[lang]/developers/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const developer = await getPublishedDeveloperBySlug(slug);
  if (!developer) notFound();
  const developerSlug = developer.slug;

  const evidence = getDeveloperEvidence(slug);
  const packageFacts = getDeveloperPackageFacts(slug);
  const dict = await getDictionary(locale);
  const d = dict.developers;

  const projects = await listProjectsForDeveloperSlug(developerSlug);

  const listingCountByProject = new Map<string, number>();
  await Promise.all(
    projects.map(async (project) => {
      const page = await listPublishedPropertiesPaged({
        projectSlug: project.slug,
        verifiedOnly: true,
        page: 1,
        pageSize: 1,
        sort: "newest_verified",
      });
      listingCountByProject.set(project.slug, page.total);
    }),
  );

  const withListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) > 0,
  );
  const withoutListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) === 0,
  );

  const [salePage, rentPage, similar] = await Promise.all([
    listPublishedPropertiesPaged({
      developerSlug,
      listingType: "sale",
      verifiedOnly: true,
      page: 1,
      pageSize: DEVELOPER_LISTING_PREVIEW_SIZE,
      sort: "newest_verified",
    }),
    listPublishedPropertiesPaged({
      developerSlug,
      listingType: "rent",
      verifiedOnly: true,
      page: 1,
      pageSize: DEVELOPER_LISTING_PREVIEW_SIZE,
      sort: "newest_verified",
    }),
    loadSimilarDevelopers(developer, projects),
  ]);

  const nameCls = presentationClassFor(evidence, "official_name");
  const websiteCls = presentationClassFor(evidence, "official_website");
  const profileCls = presentationClassFor(evidence, "company_profile");
  const yearCls = presentationClassFor(evidence, "established_year");
  const hqCls = presentationClassFor(evidence, "headquarters");
  const completedCls = presentationClassFor(evidence, "completed_projects");
  const activeCls = presentationClassFor(evidence, "active_projects");
  const logoOfficial = hasVerifiedOfficialLogo(evidence);

  const displayName = developer.name[locale] || developer.name.en;
  const profileText =
    mayPresentFact(profileCls) && packageFacts.companyProfile
      ? packageFacts.companyProfile[locale] ||
        packageFacts.companyProfile.en ||
        developer.description[locale]
      : mayPresentFact(profileCls)
        ? developer.description[locale] || developer.description.en
        : null;

  const yearValue =
    mayPresentFact(yearCls) && packageFacts.establishedYear != null
      ? String(packageFacts.establishedYear)
      : null;

  const hqValue =
    mayPresentFact(hqCls) && packageFacts.headquarters
      ? packageFacts.headquarters[locale] ||
        packageFacts.headquarters.en ||
        null
      : null;

  const website =
    mayPresentFact(websiteCls) && developer.website
      ? developer.website
      : null;

  const irSources = packageFacts.sources.filter(
    (s) =>
      s.type === "official_developer" ||
      /about|ir|set|factsheet|investor/i.test(s.name + s.url),
  );

  const officialContact =
    website ||
    (mayPresentFact(nameCls) && (developer.phone || developer.email));

  function renderListingBlock(
    title: string,
    items: PropertyView[],
    total: number,
    listingType: "sale" | "rent",
  ) {
    const href = localePath(
      locale,
      `/properties?developer=${encodeURIComponent(developerSlug)}&listing_type=${listingType}`,
    );
    return (
      <div data-slot={`developer-listings-${listingType}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {title}
          </h3>
          <p className="text-sm text-stone-600">
            {fillTemplate(d.listingsCount, { count: String(total) })}
          </p>
        </div>
        {items.length ? (
          <div className="mt-4">
            <PropertyGrid
              locale={locale}
              dict={dict}
              properties={items}
              imagePriorityCount={0}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">{d.listingsEmpty}</p>
        )}
        {total > 0 ? (
          <Link
            href={href}
            className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
          >
            {d.listingsViewAll}
          </Link>
        ) : null}
      </div>
    );
  }

  function renderProjectGroup(
    title: string,
    items: ProjectView[],
  ) {
    const preview = items.slice(0, DEVELOPER_PROJECT_PREVIEW_SIZE);
    if (!preview.length) {
      return (
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {title}
          </h3>
          <p className="mt-2 text-sm text-stone-500">{d.unavailable}</p>
        </div>
      );
    }
    return (
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
          {title}{" "}
          <span className="font-normal normal-case text-stone-500">
            ({items.length})
          </span>
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {preview.map((project) => (
            <li key={project.id}>
              <Link
                href={localePath(locale, `/projects/${project.slug}`)}
                className="block rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand)]"
              >
                <p className="font-medium text-[var(--brand-deep)]">
                  {project.name[locale] || project.name.en}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {d.projectsViewProject}
                  {(listingCountByProject.get(project.slug) ?? 0) > 0
                    ? ` · ${listingCountByProject.get(project.slug)} listings`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-[var(--brand-canvas)]">
      {/* 1. Developer hero */}
      <section
        className="border-b border-[var(--brand-line)]"
        data-slot="developer-hero"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[auto_1fr] lg:items-center lg:py-14">
          <div>
            {logoOfficial && developer.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={developer.logoUrl}
                alt={displayName}
                width={160}
                height={160}
                className="h-40 w-40 rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white object-contain p-3"
              />
            ) : (
              <NeutralDeveloperMark name={displayName} label={d.logoMissing} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{d.hero}</Badge>
              <VerificationBadge
                level={toVerificationLevel(nameCls)}
                label={evidenceLabel(dict, nameCls)}
              />
            </div>
            <h1 className="font-heading mt-3 text-4xl text-[var(--brand-deep)] sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 text-lg text-stone-600">
              {developer.legalName[locale] || developer.legalName.en}
            </p>
            {profileText ? (
              <p className="mt-4 max-w-2xl text-sm text-stone-700 sm:text-base">
                {profileText}
              </p>
            ) : null}
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <FactCell
                label={d.established}
                value={yearValue}
                cls={yearCls}
                dict={dict}
              />
              <FactCell
                label={d.headquarters}
                value={hqValue}
                cls={hqCls}
                dict={dict}
              />
              <FactCell
                label={d.website}
                value={website}
                cls={websiteCls}
                dict={dict}
              />
            </dl>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
              >
                {d.website}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-12">
          {/* 2. Overview */}
          <section aria-labelledby="developer-overview-heading">
            <h2 id="developer-overview-heading" className="ds-h2 text-2xl">
              {d.overview}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{d.overviewNote}</p>
            <div className="mt-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-[var(--brand)] uppercase">
                  {d.officialFacts}
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <FactCell
                    label={d.legalName}
                    value={
                      mayPresentFact(nameCls)
                        ? developer.legalName[locale] || developer.legalName.en
                        : null
                    }
                    cls={nameCls}
                    dict={dict}
                  />
                  <FactCell
                    label={d.website}
                    value={website}
                    cls={websiteCls}
                    dict={dict}
                  />
                </dl>
                {profileText ? (
                  <p className="mt-3 text-sm text-stone-700">{profileText}</p>
                ) : null}
              </div>
              <SurfaceCard className="p-4!" tone="soft">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--brand-deep)]">
                    {d.factoryLinked}
                  </h3>
                  <VerificationBadge
                    level="derived"
                    label={d.evidenceFactory}
                  />
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {d.factoryLinkedNote}
                </p>
                <p className="mt-3 text-sm text-[var(--brand-deep)]">
                  {projects.length} {d.projectsOnPlatform.toLowerCase()}
                  {" · "}
                  {withListings.length} {d.projectsWithListings.toLowerCase()}
                </p>
              </SurfaceCard>
            </div>
          </section>

          {/* 3. Projects on platform */}
          <section aria-labelledby="developer-projects-heading">
            <h2 id="developer-projects-heading" className="ds-h2 text-2xl">
              {d.projectsOnPlatform}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{d.projectsDisclaimer}</p>
            <div className="mt-6 space-y-8">
              {renderProjectGroup(d.projectsWithListings, withListings)}
              {renderProjectGroup(d.projectsWithoutListings, withoutListings)}
            </div>
          </section>

          {/* 4. Available listings */}
          <section aria-labelledby="developer-listings-heading">
            <h2 id="developer-listings-heading" className="ds-h2 text-2xl">
              {d.listings}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{d.listingsNote}</p>
            <div className="mt-6 space-y-10">
              {renderListingBlock(
                d.listingsSale,
                salePage.items,
                salePage.total,
                "sale",
              )}
              {renderListingBlock(
                d.listingsRent,
                rentPage.items,
                rentPage.total,
                "rent",
              )}
            </div>
          </section>

          {/* 5. Official source and evidence */}
          <section aria-labelledby="developer-evidence-heading">
            <h2 id="developer-evidence-heading" className="ds-h2 text-2xl">
              {d.evidenceTitle}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              {website ? (
                <li>
                  <span className="font-medium">{d.website}: </span>
                  <a
                    href={website}
                    className="text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {website}
                  </a>
                  <VerificationBadge
                    level={toVerificationLevel(websiteCls)}
                    label={evidenceLabel(dict, websiteCls)}
                    className="ml-2"
                  />
                </li>
              ) : null}
              {irSources.length || packageFacts.listedCompany?.profileUrl ? (
                <li>
                  <span className="font-medium">{d.irSource}: </span>
                  <ul className="mt-1 space-y-1">
                    {packageFacts.listedCompany?.profileUrl ? (
                      <li>
                        <a
                          href={packageFacts.listedCompany.profileUrl}
                          className="text-[var(--brand)] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {[
                            packageFacts.listedCompany.exchange,
                            packageFacts.listedCompany.ticker,
                          ]
                            .filter(Boolean)
                            .join(" ") || packageFacts.listedCompany.profileUrl}
                        </a>
                      </li>
                    ) : null}
                    {irSources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          className="text-[var(--brand)] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
              <li>
                <span className="font-medium">{d.lastVerified}: </span>
                {packageFacts.verifiedAt || d.unavailable}
              </li>
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  "OFFICIAL",
                  "PARTIAL",
                  "FACTORY_LINKED",
                  "UNVERIFIED",
                ] as DeveloperPresentationClass[]
              ).map((cls) => (
                <li key={cls} className="flex items-center gap-2 text-sm">
                  <VerificationBadge
                    level={toVerificationLevel(cls)}
                    label={evidenceLabel(dict, cls)}
                  />
                  <span className="text-stone-600">
                    {evidenceLabel(dict, cls)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. Other verified information */}
          <section aria-labelledby="developer-other-heading">
            <h2 id="developer-other-heading" className="ds-h2 text-2xl">
              {d.otherInfo}
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <FactCell
                label={d.completedProjects}
                value={
                  mayPresentFact(completedCls)
                    ? String(
                        evidence?.completed_n ??
                          packageFacts.completedProjects.length,
                      )
                    : null
                }
                cls={completedCls}
                dict={dict}
              />
              <FactCell
                label={d.activeProjects}
                value={
                  mayPresentFact(activeCls)
                    ? String(
                        evidence?.active_n ??
                          packageFacts.activeProjects.length,
                      )
                    : null
                }
                cls={activeCls}
                dict={dict}
              />
            </dl>
            <div className="mt-4">
              <p className="ds-caption text-stone-500">{d.companyHistory}</p>
              <p className="mt-1 text-sm text-stone-600">
                {profileCls === "OFFICIAL" && profileText
                  ? profileText
                  : d.unavailable}
              </p>
            </div>
          </section>

          {/* 8. Trust disclosure */}
          <section aria-labelledby="developer-trust-heading">
            <h2 id="developer-trust-heading" className="ds-h2 text-2xl">
              {d.trustTitle}
            </h2>
            <SurfaceCard className="mt-4 p-5!" tone="dashed">
              <p className="text-sm text-stone-700">{d.trustBody}</p>
            </SurfaceCard>
          </section>

          {/* 9. Similar developers */}
          {similar.length ? (
            <section aria-labelledby="developer-similar-heading">
              <h2 id="developer-similar-heading" className="ds-h2 text-2xl">
                {d.similar}
              </h2>
              <p className="mt-2 text-sm text-stone-600">{d.similarNote}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {similar.map((item) => (
                  <DeveloperCardShell key={item.slug}>
                    <Link
                      href={localePath(locale, `/developers/${item.slug}`)}
                      className="font-medium text-[var(--brand-deep)] hover:underline"
                    >
                      {item.name[locale] || item.name.en}
                    </Link>
                    <p className="text-sm text-stone-600">
                      {item.legalName[locale] || item.legalName.en}
                    </p>
                  </DeveloperCardShell>
                ))}
              </div>
            </section>
          ) : null}

          {/* 10. Partnership CTA */}
          <section aria-labelledby="developer-partnership-heading">
            <h2 id="developer-partnership-heading" className="ds-h2 text-2xl">
              {d.partnershipTitle}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{d.partnershipBody}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={localePath(locale, "/partners/developers")}
                className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
              >
                {d.contactPartnershipCta}
              </Link>
              <Link
                href={localePath(locale, "/partners/developers")}
                className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-deep)]/20 bg-white px-5 text-sm font-medium text-[var(--brand-deep)]"
              >
                {d.profileClaim}
              </Link>
              <Link
                href={localePath(locale, "/partners/developers")}
                className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-deep)]/20 bg-white px-5 text-sm font-medium text-[var(--brand-deep)]"
              >
                {d.projectSubmission}
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* 6. Developer contact A/B/C */}
          <SurfaceCard className="p-5!" data-slot="contact-official">
            <h2 className="ds-h3 text-xl">{d.contactOfficial}</h2>
            {officialContact ? (
              <div className="mt-3 space-y-2 text-sm text-stone-700">
                <p className="font-medium text-[var(--brand-deep)]">
                  {displayName}
                </p>
                {website ? (
                  <a
                    href={website}
                    className="inline-flex text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.website}
                  </a>
                ) : null}
                {developer.phone ? <p>{developer.phone}</p> : null}
                {developer.email ? <p>{developer.email}</p> : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                {d.contactOfficialMissing}
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard className="p-5!" data-slot="contact-partnership">
            <h2 className="ds-h3 text-xl">{d.contactPartnership}</h2>
            <p className="mt-2 text-sm text-stone-600">
              {d.contactPartnershipBody}
            </p>
            <Link
              href={localePath(locale, "/partners/developers")}
              className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
            >
              {d.contactPartnershipCta}
            </Link>
          </SurfaceCard>

          <div data-slot="contact-platform">
            <h2 className="ds-h3 mb-3 text-xl">{d.contactPlatform}</h2>
            <p className="mb-3 text-sm text-stone-600">{d.contactPlatformNote}</p>
            <PlatformCustomerSuccess locale={locale} dict={dict} />
            <div className="mt-4">
              <AiConcierge dict={dict} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
