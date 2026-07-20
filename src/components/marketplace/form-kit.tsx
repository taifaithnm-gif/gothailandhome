"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { MarketplaceValidationCode } from "@/lib/marketplace/form-validation";
import { cn } from "@/lib/utils";

export {
  Field,
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Select,
  Textarea,
};

type MarketplaceCopy = Dictionary["marketplace"];

export function resolveMarketplaceError(
  m: MarketplaceCopy,
  code: MarketplaceValidationCode | string | null | undefined,
  fallback?: string,
): string {
  if (!code) return fallback || m.errors.generic;
  const errors = m.errors as Record<string, string>;
  return errors[code] || fallback || m.errors.generic;
}

export function FormShell({
  children,
  className,
  notice,
}: {
  children: ReactNode;
  className?: string;
  notice?: string;
}) {
  return (
    <SurfaceCard
      data-slot="marketplace-form"
      className={cn("space-y-4 p-5! sm:p-8!", className)}
    >
      {notice ? <p className="text-sm text-stone-500">{notice}</p> : null}
      {children}
    </SurfaceCard>
  );
}

export function FormSuccessState({
  title,
  body,
  reference,
  referenceLabel = "Reference",
  nextSteps,
}: {
  title: string;
  body: string;
  reference?: string | null;
  referenceLabel?: string;
  nextSteps?: string;
}) {
  return (
    <SurfaceCard
      data-slot="marketplace-form-success"
      className="space-y-3 p-5! sm:p-8!"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-[var(--success)]"
          aria-hidden
        />
        <div className="space-y-2">
          <p className="ds-h3 text-xl text-[var(--brand-deep)]">{title}</p>
          <p className="text-sm text-stone-700">{body}</p>
          {reference ? (
            <p className="text-sm text-stone-600">
              <span className="font-medium text-[var(--brand-deep)]">
                {referenceLabel}:
              </span>{" "}
              <code className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-xs">
                {reference}
              </code>
            </p>
          ) : null}
          {nextSteps ? (
            <p className="text-sm text-stone-600">{nextSteps}</p>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}

export function FormFailureBanner({ message }: { message: string }) {
  return (
    <div
      data-slot="marketplace-form-failure"
      role="alert"
      className="rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
    >
      {message}
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-[var(--danger)]" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>
      {children}
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </Field>
  );
}

export function ConsentCheckbox({
  name = "consent",
  label,
  required = true,
}: {
  name?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-stone-600">
      <input
        type="checkbox"
        name={name}
        value="true"
        required={required}
        className="mt-1 size-4 rounded border-[var(--brand-line)] accent-[var(--brand)]"
      />
      <span>{label}</span>
    </label>
  );
}

export function FormSubmitButton({
  pending,
  idleLabel,
  pendingLabel,
  className,
}: {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  return (
    <>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        aria-busy={pending}
        aria-disabled={pending}
        data-pending={pending ? "true" : "false"}
        className={cn("w-full sm:w-auto", className)}
        data-slot="marketplace-form-submit"
        onClick={(event) => {
          // Block duplicate client submissions while a submit is in flight.
          if (pending) event.preventDefault();
        }}
      >
        {pending ? pendingLabel : idleLabel}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  );
}
