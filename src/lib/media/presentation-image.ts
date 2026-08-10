import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

import { isDeveloperLogoSrc } from "@/lib/media/media-fit";
import { getDeveloperLogoPresentation } from "@/lib/developers/logo-presentation";
import { approvedListingMediaUrl } from "@/lib/property/listing-media";
import { resolveProjectHeroSrc } from "@/lib/projects/local-media";

const PLACEHOLDER_PATH = /placeholder/i;
const RASTER_EXT = /\.(jpe?g|png|webp)$/i;

function publicFileExists(sitePath: string): boolean {
  if (!sitePath.startsWith("/") || sitePath.startsWith("//")) return false;
  return existsSync(join(process.cwd(), "public", sitePath.replace(/^\//, "")));
}

/** Reject internal placeholder assets and non-displayable paths. */
export function isPublicDisplayImage(src: string | null | undefined): src is string {
  const approved = approvedListingMediaUrl(src);
  if (!approved) return false;
  if (PLACEHOLDER_PATH.test(approved)) return false;
  if (approved.startsWith("/")) {
    if (!publicFileExists(approved)) return false;
    // next/image card frames expect raster for local fallbacks.
    if (approved.startsWith("/developers/") && !RASTER_EXT.test(approved)) {
      return false;
    }
  }
  return true;
}

function resolveAreaImageSrc(areaSlug: string | null | undefined): string | null {
  if (!areaSlug) return null;
  const candidates = [
    `/cities/${areaSlug}-hero.webp`,
    `/cities/${areaSlug}-hero.jpg`,
    `/cities/${areaSlug}-hero.jpeg`,
    `/cities/${areaSlug}-hero.png`,
    `/cities/${areaSlug}/hero.webp`,
    `/cities/${areaSlug}/hero.jpg`,
    `/cities/${areaSlug}/hero.png`,
    `/districts/${areaSlug}-hero.webp`,
    `/districts/${areaSlug}-hero.jpg`,
    `/districts/${areaSlug}/hero.webp`,
    `/districts/${areaSlug}/hero.jpg`,
  ];
  for (const path of candidates) {
    if (isPublicDisplayImage(path)) return path;
  }
  return null;
}

function resolveDeveloperImageSrc(
  developerSlug: string | null | undefined,
): string | null {
  if (!developerSlug) return null;
  const presentation = getDeveloperLogoPresentation(developerSlug);
  if (isPublicDisplayImage(presentation.displaySrc)) {
    return presentation.displaySrc;
  }
  const rasterCandidates = [
    `/developers/${developerSlug}/official-logo.jpg`,
    `/developers/${developerSlug}/official-logo.jpeg`,
    `/developers/${developerSlug}/official-logo.png`,
    `/developers/${developerSlug}/official-logo.webp`,
  ];
  for (const path of rasterCandidates) {
    if (isPublicDisplayImage(path)) return path;
  }
  return null;
}

export type PresentationImageInput = {
  /** Listing/project primary photo when present. */
  primarySrc?: string | null;
  projectSlug?: string | null;
  projectTitle?: string | null;
  developerSlug?: string | null;
  areaSlug?: string | null;
};

/**
 * Public media priority:
 * real project image → developer image → area image → null (branded placeholder).
 * Never returns internal placeholder paths.
 */
export function resolvePresentationImageSrc(
  input: PresentationImageInput,
): string | null {
  return resolvePresentationImage(input).src;
}

export type PresentationImageKind = "photo" | "developer" | "area";

export type PresentationImageResult = {
  src: string | null;
  kind: PresentationImageKind | null;
};

/** Re-export client-safe logo detector for server callers. */
export { isDeveloperLogoSrc };

/**
 * Same cascade as resolvePresentationImageSrc, with kind for fit/framing.
 * developer → object-contain; photo/area → object-cover.
 */
export function resolvePresentationImage(
  input: PresentationImageInput,
): PresentationImageResult {
  if (isPublicDisplayImage(input.primarySrc)) {
    const src = input.primarySrc.trim();
    return {
      src,
      kind: isDeveloperLogoSrc(src) ? "developer" : "photo",
    };
  }

  if (input.projectSlug) {
    const projectHero = resolveProjectHeroSrc(
      input.projectSlug,
      input.projectTitle || input.projectSlug,
      null,
    );
    if (isPublicDisplayImage(projectHero)) {
      return { src: projectHero, kind: "photo" };
    }
  }

  const developerSrc = resolveDeveloperImageSrc(input.developerSlug);
  if (developerSrc) return { src: developerSrc, kind: "developer" };

  const areaSrc = resolveAreaImageSrc(input.areaSlug);
  if (areaSrc) return { src: areaSrc, kind: "area" };

  return { src: null, kind: null };
}
