"use client";

import Image from "next/image";
import { useState } from "react";

import { NoImagePlaceholder } from "@/components/ui/no-image";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
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
  /** Show source disclosure under/over real media. */
  showSource?: boolean;
};

/**
 * Neutral, property-type-aware missing-media foundation.
 * Never uses fake interiors or building photos.
 */
export function ListingMediaFrame({
  locale: _locale,
  dict,
  title,
  alt,
  propertyType,
  imageUrl,
  imageSource,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 420px",
  className,
  showSource = false,
}: ListingMediaProps) {
  void _locale;
  const approvedUrl = approvedListingMediaUrl(imageUrl);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const unavailable = dict.common.imagesUnavailable;
  const imageAlt = alt?.trim() || title;
  const showImage = Boolean(approvedUrl && approvedUrl !== failedUrl);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] min-h-[10rem] overflow-hidden bg-[var(--brand-deep)]",
        className,
      )}
      style={{ aspectRatio: "16 / 10" }}
      data-slot="listing-media-frame"
      data-media-state={showImage ? "ready" : "unavailable"}
    >
      {showImage && approvedUrl ? (
        <>
          <Image
            src={approvedUrl}
            alt={imageAlt}
            fill
            sizes={sizes}
            preload={priority}
            loading={priority ? undefined : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setFailedUrl(approvedUrl)}
          />
          {showSource && imageSource ? (
            <p className="absolute right-2 bottom-2 rounded bg-black/55 px-2 py-0.5 text-[10px] text-white">
              {dict.common.imageSource}: {imageSource}
            </p>
          ) : null}
        </>
      ) : (
        <NoImagePlaceholder
          label={unavailable}
          propertyType={propertyType}
        />
      )}
    </div>
  );
}
