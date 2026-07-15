import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-stone-100 text-stone-600",
        brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
        gold: "bg-[var(--accent)] text-[var(--brand-deep)]",
        success: "bg-[var(--success-soft)] text-[var(--success)]",
        warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
        official: "bg-[var(--brand-deep)] text-white",
        verified: "bg-[var(--evidence-verified)] text-white",
        portal: "bg-[var(--evidence-portal)] text-white",
        derived: "bg-[var(--evidence-derived)] text-white",
        unverified: "bg-[var(--evidence-unverified)] text-white",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export type VerificationLevel =
  | "official"
  | "verified_portal"
  | "derived"
  | "unverified";

const verificationTone: Record<
  VerificationLevel,
  VariantProps<typeof badgeVariants>["tone"]
> = {
  official: "official",
  verified_portal: "verified",
  derived: "derived",
  unverified: "unverified",
};

const verificationLabel: Record<VerificationLevel, string> = {
  official: "Official",
  verified_portal: "Verified portal",
  derived: "Derived",
  unverified: "Unverified",
};

export function VerificationBadge({
  level,
  label,
  className,
}: {
  level: VerificationLevel;
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      tone={verificationTone[level]}
      className={className}
      title={label || verificationLabel[level]}
    >
      {label || verificationLabel[level]}
    </Badge>
  );
}

export function SourceBadge({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <Badge tone="portal" className={className} title={`Source: ${source}`}>
      {source}
    </Badge>
  );
}
