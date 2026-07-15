import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceCardVariants = cva("ds-card overflow-hidden", {
  variants: {
    tone: {
      default: "",
      soft: "bg-[var(--brand-soft)]",
      dashed: "border-dashed bg-[var(--brand-soft)]",
    },
    padding: {
      default: "",
      none: "p-0!",
      sm: "p-3! sm:p-4!",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "default",
  },
});

export function SurfaceCard({
  className,
  tone,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof surfaceCardVariants>) {
  return (
    <div
      data-slot="surface-card"
      className={cn(surfaceCardVariants({ tone, padding }), className)}
      {...props}
    />
  );
}

export function ListingCardShell({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="listing-card"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white shadow-[0_1px_0_rgba(6,61,56,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(6,61,56,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function ProjectCardShell({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="project-card"
      className={cn(
        "ds-card flex h-full flex-col gap-3 transition hover:border-[var(--brand)]/40",
        className,
      )}
      {...props}
    />
  );
}

export function DeveloperCardShell({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="developer-card"
      className={cn(
        "ds-card flex h-full flex-col gap-2 transition hover:border-[var(--brand)]/40",
        className,
      )}
      {...props}
    />
  );
}

export function DistrictCardShell({
  className,
  ...props
}: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="district-card"
      className={cn(
        "ds-card flex h-full flex-col gap-2 transition hover:border-[var(--brand)]/40",
        className,
      )}
      {...props}
    />
  );
}
