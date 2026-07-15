import * as React from "react";

import { cn } from "@/lib/utils";

const fieldControlClass =
  "h-10 w-full rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 text-sm text-[var(--brand-deep)] outline-none transition placeholder:text-stone-400 focus-visible:border-[var(--brand)] focus-visible:ring-3 focus-visible:ring-[var(--brand)]/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--danger)] aria-invalid:ring-[var(--danger)]/20";

export function Field({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5 text-sm", className)}
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("font-medium text-[var(--brand-deep)]", className)}
      {...props}
    />
  );
}

export function FieldHint({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-xs text-stone-500", className)}
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-xs font-medium text-[var(--danger)]", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(fieldControlClass, className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(fieldControlClass, "pr-8", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldControlClass,
        "min-h-28 h-auto resize-y py-2.5 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
