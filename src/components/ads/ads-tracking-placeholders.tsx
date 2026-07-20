import type { Metadata } from "next";

/**
 * Consent-aware replacement for historical ads placeholders.
 * Does not inject network pixels or gtag bootstrap before consent.
 * Measurement loads via AnalyticsProvider + adapter (P1-31).
 */
export function AdsTrackingPlaceholders({
  pagePath,
  projectSlug,
}: {
  pagePath: string;
  projectSlug?: string;
}) {
  return (
    <span
      hidden
      data-ads-tracking="consent-gated"
      data-page-path={pagePath}
      data-project-slug={projectSlug ?? ""}
    />
  );
}

export function projectOpenGraphImages(
  ogImagePath: string | null | undefined,
): NonNullable<Metadata["openGraph"]>["images"] {
  const path = ogImagePath || "/og/projects/placeholder.svg";
  return [
    {
      url: path,
      width: 1200,
      height: 630,
      alt: "GoThailandHome project Open Graph placeholder",
    },
  ];
}
