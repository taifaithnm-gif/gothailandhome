"use client";

import Image from "next/image";
import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import { NoImagePlaceholder } from "@/components/ui/no-image";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isApprovedListingMediaUrl } from "@/lib/property/listing-media";
import type { PropertyType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type GalleryImage = {
  url: string;
  alt?: string | null;
};

type ListingGalleryProps = {
  locale: Locale;
  dict: Dictionary;
  title: string;
  propertyType: PropertyType;
  images: GalleryImage[];
  imageSource?: string | null;
};

export function ListingGallery({
  locale,
  dict,
  title,
  propertyType,
  images,
  imageSource,
}: ListingGalleryProps) {
  const galleryId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(
    () => new Set(),
  );
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const approvedImages = useMemo(
    () => images.filter((image) => isApprovedListingMediaUrl(image.url)),
    [images],
  );
  const index = selectedIndex < approvedImages.length ? selectedIndex : 0;
  const active = approvedImages[index] ?? null;

  function selectImage(nextIndex: number) {
    setSelectedIndex(nextIndex);
    thumbnailRefs.current[nextIndex]?.focus();
  }

  function handleThumbnailKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % approvedImages.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + approvedImages.length) % approvedImages.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = approvedImages.length - 1;
    }
    if (nextIndex == null) return;
    event.preventDefault();
    selectImage(nextIndex);
  }

  function markThumbnailFailed(url: string) {
    setFailedThumbnails((current) => {
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }

  return (
    <section aria-label={dict.property.gallery} className="space-y-3">
      <div
        id={`${galleryId}-media`}
        className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white"
      >
        <ListingMediaFrame
          locale={locale}
          dict={dict}
          title={title}
          alt={active?.alt?.trim() || title}
          propertyType={propertyType}
          imageUrl={active?.url ?? null}
          imageSource={imageSource}
          priority
          showSource={Boolean(active?.url && imageSource)}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="aspect-[16/10] min-h-[14rem] sm:min-h-[18rem]"
        />
      </div>
      {approvedImages.length > 1 ? (
        <ul
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label={dict.property.gallery}
        >
          {approvedImages.map((image, i) => (
            <li key={`${image.url}-${i}`} className="shrink-0">
              <button
                ref={(node) => {
                  thumbnailRefs.current[i] = node;
                }}
                type="button"
                className={cn(
                  "relative h-[70px] w-[112px] overflow-hidden rounded-lg border-2 bg-[var(--brand-deep)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand)]/30",
                  i === index
                    ? "border-[var(--brand)]"
                    : "border-transparent opacity-80 hover:opacity-100",
                )}
                aria-label={`${dict.property.gallery} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                aria-controls={`${galleryId}-media`}
                onClick={() => setSelectedIndex(i)}
                onKeyDown={(event) => handleThumbnailKeyDown(event, i)}
              >
                {failedThumbnails.has(image.url) ? (
                  <NoImagePlaceholder
                    label={dict.common.imagesUnavailable}
                    propertyType={propertyType}
                    compact
                    decorative
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt=""
                    width={112}
                    height={70}
                    sizes="112px"
                    className="h-[70px] w-[112px] object-cover"
                    loading="lazy"
                    onError={() => markThumbnailFailed(image.url)}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
