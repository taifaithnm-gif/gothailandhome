import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { PropertyType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ListingMediaProps = {
  locale: Locale;
  dict: Dictionary;
  title: string;
  propertyType: PropertyType;
  imageUrl: string | null;
  imageSource?: string | null;
  /** Lazy-load when below the fold / non-LCP cards. */
  priority?: boolean;
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
  propertyType,
  imageUrl,
  imageSource,
  priority = false,
  className,
  showSource = false,
}: ListingMediaProps) {
  void _locale;
  const unavailable = dict.common.imagesUnavailable;
  const typeHint = propertyType.replace(/_/g, " ");

  return (
    <div
      className={cn(
        "relative aspect-[16/10] min-h-[10rem] overflow-hidden bg-[linear-gradient(145deg,#0f4f49_0%,#1a6b63_48%,#c4a035_140%)]",
        className,
      )}
    >
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            width={640}
            height={400}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          {showSource && imageSource ? (
            <p className="absolute right-2 bottom-2 rounded bg-black/55 px-2 py-0.5 text-[10px] text-white">
              {dict.common.imageSource}: {imageSource}
            </p>
          ) : null}
        </>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
          role="img"
          aria-label={unavailable}
        >
          <svg
            viewBox="0 0 120 72"
            className="h-14 w-24 text-white/75"
            aria-hidden="true"
          >
            {propertyType === "land" ? (
              <path
                d="M8 52 L40 28 L72 48 L112 22 L112 60 L8 60 Z"
                fill="currentColor"
                opacity="0.35"
              />
            ) : propertyType === "villa" || propertyType === "house" ? (
              <>
                <path
                  d="M20 48 L60 18 L100 48 V60 H20 Z"
                  fill="currentColor"
                  opacity="0.35"
                />
                <rect
                  x="48"
                  y="40"
                  width="24"
                  height="20"
                  fill="currentColor"
                  opacity="0.45"
                />
              </>
            ) : (
              <>
                <rect
                  x="28"
                  y="16"
                  width="64"
                  height="44"
                  rx="2"
                  fill="currentColor"
                  opacity="0.3"
                />
                <rect
                  x="36"
                  y="24"
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
                <rect
                  x="55"
                  y="24"
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
                <rect
                  x="74"
                  y="24"
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
                <rect
                  x="36"
                  y="40"
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
                <rect
                  x="55"
                  y="40"
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
              </>
            )}
          </svg>
          <p className="text-xs font-medium tracking-wide text-white/95 uppercase">
            {unavailable}
          </p>
          <p className="sr-only">{typeHint}</p>
        </div>
      )}
    </div>
  );
}
