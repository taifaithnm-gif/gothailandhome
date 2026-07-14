import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { listPublishedProjects } from "@/lib/data/projects";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title:
      lang === "zh"
        ? "项目 | GoThailandHome"
        : lang === "th"
          ? "โครงการ | GoThailandHome"
          : "Projects | GoThailandHome",
    description: dict.projectLanding.listingsNote,
    path: "/projects",
  });
}

export default async function ProjectsIndexPage({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, projects] = await Promise.all([
    getDictionary(lang),
    listPublishedProjects(),
  ]);

  return (
    <PageShell
      title={dict.nav.projects}
      subtitle={
        lang === "zh"
          ? "真实楼盘项目资料与公开挂牌。"
          : lang === "th"
            ? "โปรไฟล์โครงการจริงและประกาศสาธารณะ"
            : "Real condominium project profiles and public listings."
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={localePath(lang, `/projects/${project.slug}`)}
              className="block rounded-2xl border border-[var(--brand-line)] bg-white p-6 transition hover:border-[var(--brand)]"
            >
              <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                {project.name[lang]}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                {project.description[lang]}
              </p>
              <p className="mt-3 text-xs text-stone-500">
                {project.address[lang]}
              </p>
            </Link>
          </li>
        ))}
        {!projects.length ? (
          <li className="text-sm text-stone-500">{dict.common.noResults}</li>
        ) : null}
      </ul>
    </PageShell>
  );
}
