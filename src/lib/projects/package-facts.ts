import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  coerceLocalizedText,
  normalizeFacilities,
  type LocalizedText,
  type ProjectFacilityZone,
} from "@/lib/projects/normalize-project-content";

/**
 * Read-only presentation fields from content packages.
 * Does not mutate packages, classifications, or listing relations.
 */
export type ProjectPackageFacts = {
  projectStatus: string | null;
  projectType: string | null;
  subdistrict: LocalizedText | null;
  facilitiesOfficial: ProjectFacilityZone[];
};

const empty: ProjectPackageFacts = {
  projectStatus: null,
  projectType: null,
  subdistrict: null,
  facilitiesOfficial: [],
};

function asStatus(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

export function getProjectPackageFacts(slug: string): ProjectPackageFacts {
  const path = join(
    process.cwd(),
    "content",
    "projects",
    slug,
    "manifest.json",
  );
  if (!existsSync(path)) return empty;

  try {
    const manifest = JSON.parse(readFileSync(path, "utf8")) as {
      project?: Record<string, unknown>;
    };
    const project = manifest.project ?? {};

    const projectStatus =
      asStatus(project.project_status) ??
      asStatus(project.construction_status);

    const projectType =
      asStatus(project.project_type) ??
      asStatus(project.property_type) ??
      asStatus(project.type);

    const subdistrict =
      coerceLocalizedText(project.subdistrict) ??
      coerceLocalizedText(project.sub_district) ??
      null;

    const facilitiesOfficial = normalizeFacilities(
      project.facilities_official ?? [],
    );

    return {
      projectStatus,
      projectType,
      subdistrict,
      facilitiesOfficial,
    };
  } catch {
    return empty;
  }
}
