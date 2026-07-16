import { notFound } from "next/navigation";

import { DeveloperCenter } from "@/components/developer/developer-center";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { isLocale, type Locale } from "@/config/locales";
import {
  getPublishedDeveloperBySlug,
  listProjectsForDeveloperSlug,
  listPublishedDevelopers,
  type DeveloperView,
} from "@/lib/data/developers";
import {
  listPublishedPropertiesPaged,
} from "@/lib/data/properties";
import {
  listPublishedProjects,
  type ProjectView,
} from "@/lib/data/projects";
import {
  DEVELOPER_LISTING_PREVIEW_SIZE,
  getDeveloperEvidence,
} from "@/lib/developers/evidence";
import { getDeveloperPackageFacts } from "@/lib/developers/package-facts";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

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

async function loadRelatedDevelopers(
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

  const [salePage, rentPage, related] = await Promise.all([
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
    loadRelatedDevelopers(developer, projects),
  ]);

  return (
    <>
      <div className="ds-container bg-[var(--brand-canvas)] pt-6">
        <Breadcrumb
          items={[
            { label: dict.nav.home, href: localePath(locale) },
            {
              label: dict.nav.developers,
              href: localePath(locale, "/developers"),
            },
            { label: developer.name[locale] || developer.name.en },
          ]}
        />
      </div>
      <DeveloperCenter
        locale={locale}
        dict={dict}
        developer={developer}
        evidence={evidence}
        packageFacts={packageFacts}
        projects={projects}
        listingCountByProject={listingCountByProject}
        saleItems={salePage.items}
        saleTotal={salePage.total}
        rentItems={rentPage.items}
        rentTotal={rentPage.total}
        related={related}
      />
    </>
  );
}
