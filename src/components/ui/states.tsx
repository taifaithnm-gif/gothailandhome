"use client";

import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { useEffect, useRef, type ReactNode, type Ref } from "react";

import { cn } from "@/lib/utils";

function useFocusTitle(
  enabled: boolean,
  externalRef: Ref<HTMLHeadingElement> | undefined,
) {
  const localRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const node =
      (typeof externalRef === "object" && externalRef?.current) ||
      localRef.current;
    node?.focus({ preventScroll: false });
  }, [enabled, externalRef]);

  return (node: HTMLHeadingElement | null) => {
    localRef.current = node;
    if (typeof externalRef === "function") {
      externalRef(node);
    } else if (externalRef && typeof externalRef === "object") {
      (externalRef as { current: HTMLHeadingElement | null }).current = node;
    }
  };
}


export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 rounded-[var(--card-radius)] border border-dashed border-[var(--brand-line)] bg-white/70 px-6 py-12 text-sm text-stone-600",
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin text-[var(--brand)]" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
  titleRef,
  focusTitle = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleRef?: Ref<HTMLHeadingElement>;
  focusTitle?: boolean;
}) {
  const setTitleRef = useFocusTitle(focusTitle, titleRef);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--card-radius)] border border-dashed border-[var(--brand-line)] bg-white/70 px-6 py-12 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Inbox className="size-8 text-[var(--brand)]/50" aria-hidden />
      <h2
        ref={setTitleRef}
        tabIndex={focusTitle ? -1 : undefined}
        className="ds-h3 text-lg outline-none"
      >
        {title}
      </h2>
      {description ? <p className="ds-body-sm max-w-md">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
  titleRef,
  focusTitle = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleRef?: Ref<HTMLHeadingElement>;
  focusTitle?: boolean;
}) {
  const setTitleRef = useFocusTitle(focusTitle, titleRef);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--card-radius)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-6 py-12 text-center",
        className,
      )}
    >
      <AlertCircle className="size-8 text-[var(--danger)]" aria-hidden />
      <h2
        ref={setTitleRef}
        tabIndex={focusTitle ? -1 : undefined}
        className="ds-h3 text-lg text-[var(--danger)] outline-none"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-md text-sm text-[var(--danger)]/80">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
