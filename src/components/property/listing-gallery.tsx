"use client";

import { useState } from "react";

import { ListingMediaFrame } from "@/components/property/listing-media-frame";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
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
  const [index, setIndex] = useState(0);
  const active = images[index] ?? null;

  return (
    <section aria-label={dict.property.gallery} className="space-y-3">
      <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white">
        <ListingMediaFrame
          locale={locale}
          dict={dict}
          title={active?.alt || title}
          propertyType={propertyType}
          imageUrl={active?.url ?? null}
          imageSource={imageSource}
          priority
          showSource={Boolean(active?.url && imageSource)}
          className="aspect-[16/10] min-h-[14rem] sm:min-h-[18rem]"
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={`${image.url}-${i}`} className="shrink-0">
              <button
                type="button"
                className={cn(
                  "overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand)]/30",
                  i === index
                    ? "border-[var(--brand)]"
                    : "border-transparent opacity-80 hover:opacity-100",
                )}
                aria-label={`${dict.property.gallery} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  width={112}
                  height={70}
                  className="h-[70px] w-[112px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
