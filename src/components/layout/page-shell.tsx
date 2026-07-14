import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  notice?: string;
};

export function PageShell({
  title,
  subtitle,
  children,
  notice,
}: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-3xl space-y-3">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--brand-deep)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base leading-relaxed text-stone-600 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
        {notice ? (
          <p className="text-sm text-[var(--brand)]">{notice}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
