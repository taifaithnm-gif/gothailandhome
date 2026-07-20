import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Authoritative public logo.meta.json statuses (P0 / Phase 11 contract).
 * Never treat placeholder SVG as an official trademark.
 */
export type DeveloperLogoMetaStatus =
  | "placeholder"
  | "official_remote"
  | "official_cached";

export type DeveloperLogoPresentation = {
  status: DeveloperLogoMetaStatus;
  /** Site-relative path safe to render as an official mark, else null. */
  displaySrc: string | null;
  officialLogoUrl: string | null;
  /** True only when a local official mirror is present and status is official_cached. */
  canPresentOfficialMark: boolean;
};

const ALLOWED = new Set<DeveloperLogoMetaStatus>([
  "placeholder",
  "official_remote",
  "official_cached",
]);

function normalizeStatus(raw: unknown): DeveloperLogoMetaStatus {
  const value = String(raw ?? "placeholder").toLowerCase();
  if (ALLOWED.has(value as DeveloperLogoMetaStatus)) {
    return value as DeveloperLogoMetaStatus;
  }
  return "placeholder";
}

function publicFileExists(sitePath: string): boolean {
  if (!sitePath.startsWith("/")) return false;
  return existsSync(join(process.cwd(), "public", sitePath.replace(/^\//, "")));
}

/**
 * Read-only logo presentation from public/developers/{slug}/logo.meta.json.
 * Prefer local cached mirrors; never hotlink remote assets as if they were
 * approved local marks; never upgrade placeholder glyphs to official.
 */
export function getDeveloperLogoPresentation(
  slug: string,
): DeveloperLogoPresentation {
  const metaPath = join(
    process.cwd(),
    "public",
    "developers",
    slug,
    "logo.meta.json",
  );

  if (!existsSync(metaPath)) {
    return {
      status: "placeholder",
      displaySrc: null,
      officialLogoUrl: null,
      canPresentOfficialMark: false,
    };
  }

  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf8")) as Record<
      string,
      unknown
    >;
    const status = normalizeStatus(meta.status);
    const officialLogoUrl =
      typeof meta.official_logo_url === "string" &&
      /^https?:\/\//i.test(meta.official_logo_url.trim())
        ? meta.official_logo_url.trim()
        : null;

    if (status === "official_cached") {
      const cached =
        typeof meta.cached_local_path === "string"
          ? meta.cached_local_path.trim()
          : "";
      if (cached.startsWith("/") && publicFileExists(cached)) {
        return {
          status,
          displaySrc: cached,
          officialLogoUrl,
          canPresentOfficialMark: true,
        };
      }
      // Cached claim without a present file fails closed to placeholder mark.
      return {
        status: "placeholder",
        displaySrc: null,
        officialLogoUrl,
        canPresentOfficialMark: false,
      };
    }

    // official_remote / placeholder: do not present remote URL as local mark.
    return {
      status,
      displaySrc: null,
      officialLogoUrl,
      canPresentOfficialMark: false,
    };
  } catch {
    return {
      status: "placeholder",
      displaySrc: null,
      officialLogoUrl: null,
      canPresentOfficialMark: false,
    };
  }
}

export function logoStatusLabelKey(
  status: DeveloperLogoMetaStatus,
):
  | "logoStatusPlaceholder"
  | "logoStatusOfficialRemote"
  | "logoStatusOfficialCached" {
  switch (status) {
    case "official_cached":
      return "logoStatusOfficialCached";
    case "official_remote":
      return "logoStatusOfficialRemote";
    default:
      return "logoStatusPlaceholder";
  }
}
