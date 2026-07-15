import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  notice?: string;
  breadcrumbs?: BreadcrumbItem[];
};

export function PageShell({
  title,
  subtitle,
  children,
  notice,
  breadcrumbs,
}: PageShellProps) {
  return (
    <div className="ds-container ds-section">
      {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
      <header className="mb-8 max-w-3xl space-y-3">
        <h1 className="ds-h1">{title}</h1>
        {subtitle ? <p className="ds-body text-stone-600">{subtitle}</p> : null}
        {notice ? (
          <p className="text-sm text-[var(--brand)]">{notice}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
