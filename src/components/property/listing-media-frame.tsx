"use client";

import Image from "next/image";
import { useState } from "react";

import { NoImagePlaceholder } from "@/components/ui/no-image";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isDeveloperLogoSrc } from "@/lib/media/media-fit";
import { approvedListingMediaUrl } from "@/lib/property/listing-media";
import type { PropertyType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ListingMediaProps = {
  locale: Locale;
  dict: Dictionary;
  title: string;
  /** Unique accessible description for real media; defaults to title. */
  alt?: string;
  propertyType: PropertyType;
  imageUrl: string | null;
  imageSource?: string | null;
  /** Lazy-load when below the fold / non-LCP cards. */
  priority?: boolean;
  /** Responsive slot width supplied to next/image. */
  sizes?: string;
  className?: string;
};

/**
 * Media frame with approved photo or branded placeholder.
 * Developer-logo fallbacks use contain (letterboxed); photos use cover.
 */
export function ListingMediaFrame({
  locale: _locale,
  dict: _dict,
  title,
  alt,
  propertyType,
  imageUrl,
  imageSource: _imageSource,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 420px",
  className,
}: ListingMediaProps) {
  void _locale;
  void _dict;
  void _imageSource;
  const raw = approvedListingMediaUrl(imageUrl);
  const approvedUrl =
    raw && !/placeholder/i.test(raw) ? raw : null;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const imageAlt = alt?.trim() || title;
  const showImage = Boolean(approvedUrl && approvedUrl !== failedUrl);
  const logoFallback = isDeveloperLogoSrc(approvedUrl);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] min-h-[10rem] overflow-hidden bg-[var(--brand-soft)]",
        className,
      )}
      style={{ aspectRatio: "16 / 10" }}
      data-slot="listing-media-frame"
      data-media-state={showImage ? "ready" : "branded-placeholder"}
      data-media-fit={showImage ? (logoFallback ? "contain" : "cover") : undefined}
    >
      {showImage && approvedUrl ? (
        <Image
          src={approvedUrl}
          alt={imageAlt}
          fill
          sizes={sizes}
          preload={priority}
          loading={priority ? undefined : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={cn(
            "h-full w-full transition duration-500",
            logoFallback
              ? "object-contain p-6 group-hover:scale-[1.02]"
              : "object-cover group-hover:scale-[1.03]",
          )}
          onError={() => setFailedUrl(approvedUrl)}
        />
      ) : (
        <NoImagePlaceholder
          label={imageAlt}
          propertyType={propertyType}
        />
      )}
    </div>
  );
}
