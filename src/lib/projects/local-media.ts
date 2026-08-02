import "server-only";

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { isApprovedListingMediaUrl } from "@/lib/property/listing-media";

export type ProjectLocalMedia = {
  /** Site-relative approved hero photo, or null when only a placeholder exists. */
  heroSrc: string | null;
  /** Site-relative gallery photos (never includes floor-plan or placeholder SVGs). */
  gallery: Array<{ url: string; alt: string }>;
};

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const PLACEHOLDER_NAME = /placeholder/i;

function publicProjectDir(slug: string): string {
  return join(process.cwd(), "public", "projects", slug);
}

function toSitePath(slug: string, filename: string): string {
  return `/projects/${slug}/${filename}`;
}

/**
 * Resolve approved local project media under public/projects/{slug}.
 * Prefers real raster hero/gallery assets; never treats *placeholder* SVGs as photos.
 */
export function getProjectLocalMedia(
  slug: string,
  projectTitle: string,
): ProjectLocalMedia {
  const dir = publicProjectDir(slug);
  if (!existsSync(dir)) {
    return { heroSrc: null, gallery: [] };
  }

  let files: string[] = [];
  try {
    files = readdirSync(dir);
  } catch {
    return { heroSrc: null, gallery: [] };
  }

  const heroCandidates = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"];
  let heroSrc: string | null = null;
  for (const name of heroCandidates) {
    if (files.includes(name) && !PLACEHOLDER_NAME.test(name)) {
      const path = toSitePath(slug, name);
      if (isApprovedListingMediaUrl(path)) {
        heroSrc = path;
        break;
      }
    }
  }

  const gallery = files
    .filter(
      (name) =>
        /^gallery[-_]?\d+/i.test(name) &&
        IMAGE_EXT.test(name) &&
        !PLACEHOLDER_NAME.test(name),
    )
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((name, index) => {
      const url = toSitePath(slug, name);
      return {
        url,
        alt: `${projectTitle} — photo ${index + 1}`,
      };
    })
    .filter((item) => isApprovedListingMediaUrl(item.url));

  return { heroSrc, gallery };
}

/**
 * Prefer local approved hero, then a DB/package path that is an approved media URL.
 */
export function resolveProjectHeroSrc(
  slug: string,
  projectTitle: string,
  dbHeroPath: string | null | undefined,
): string | null {
  const local = getProjectLocalMedia(slug, projectTitle);
  if (local.heroSrc) return local.heroSrc;
  const approved = isApprovedListingMediaUrl(dbHeroPath) ? dbHeroPath.trim() : null;
  if (!approved) return null;
  if (PLACEHOLDER_NAME.test(approved)) return null;
  // Only accept local site paths or already-approved URLs; skip missing local files.
  if (approved.startsWith("/projects/")) {
    const abs = join(process.cwd(), "public", approved.replace(/^\//, ""));
    if (!existsSync(abs)) return null;
  }
  return approved;
}
