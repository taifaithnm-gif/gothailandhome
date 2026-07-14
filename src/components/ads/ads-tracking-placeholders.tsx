import type { Metadata } from "next";

type AdsTrackingPlaceholdersProps = {
  pagePath: string;
  projectSlug?: string;
};

/**
 * Placeholder hooks for future Meta Pixel + Google Ads tagging.
 * Real IDs should be injected via NEXT_PUBLIC_META_PIXEL_ID /
 * NEXT_PUBLIC_GOOGLE_ADS_ID when campaigns go live.
 */
export function AdsTrackingPlaceholders({
  pagePath,
  projectSlug,
}: AdsTrackingPlaceholdersProps) {
  const metaPixelId =
    process.env.NEXT_PUBLIC_META_PIXEL_ID || "META_PIXEL_ID_PLACEHOLDER";
  const googleAdsId =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-CONVERSION_ID_PLACEHOLDER";

  const bootstrap = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.fbq = window.fbq || function(){(window.fbq.q=window.fbq.q||[]).push(arguments);};
window.__gthAds = {
  metaPixelId: ${JSON.stringify(metaPixelId)},
  googleAdsId: ${JSON.stringify(googleAdsId)},
  pagePath: ${JSON.stringify(pagePath)},
  projectSlug: ${JSON.stringify(projectSlug ?? null)},
  ready: false,
  note: "Placeholder only — replace env IDs before paid traffic"
};
`.trim();

  return (
    <>
      <script
        id="gth-ads-placeholders"
        dangerouslySetInnerHTML={{ __html: bootstrap }}
      />
      <noscript>
        {/* Meta Pixel noscript placeholder — replace with real pixel GIF when live */}
        <span
          data-ads-meta-pixel-placeholder={metaPixelId}
          style={{ display: "none" }}
        />
      </noscript>
    </>
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
