import type { PropertyType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type NoImagePlaceholderProps = {
  label: string;
  propertyType: PropertyType;
  className?: string;
  compact?: boolean;
  decorative?: boolean;
};

/**
 * Neutral, property-type-aware media fallback.
 * It never substitutes stock, generated, or unapproved remote imagery.
 */
export function NoImagePlaceholder({
  label,
  propertyType,
  className,
  compact = false,
  decorative = false,
}: NoImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-[var(--brand-deep)] px-4 text-center text-white",
        compact ? "gap-0.5 p-1" : "gap-2",
        className,
      )}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      data-slot="no-image-placeholder"
    >
      <svg
        viewBox="0 0 120 72"
        className={cn(
          "text-white/75",
          compact ? "h-7 w-12" : "h-14 w-24",
        )}
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
            {[24, 40].flatMap((y) =>
              [36, 55, 74].map((x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="10"
                  height="8"
                  fill="currentColor"
                  opacity="0.55"
                />
              )),
            )}
          </>
        )}
      </svg>
      {!compact ? (
        <p className="text-xs font-medium tracking-wide text-white/95 uppercase">
          {label}
        </p>
      ) : null}
    </div>
  );
}
