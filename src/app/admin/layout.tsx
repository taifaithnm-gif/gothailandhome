import type { Metadata } from "next";
import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { getOptionalAdmin } from "@/lib/auth/admin";
import {
  documentBodyStyle,
  documentFontClassName,
  documentMetadata,
} from "@/lib/ui/document-fonts";

import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...documentMetadata,
  title: "Admin | GoThailandHome",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/**
 * Admin root layout — sibling of `[lang]` so localized pages can own `<html lang>`
 * without `headers()` (preserves ISR on public routes).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalAdmin();

  return (
    <html lang="en" className={documentFontClassName}>
      <body className="min-h-full font-sans" style={documentBodyStyle}>
        <div className="min-h-screen bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          <header className="border-b border-[var(--brand-line)] bg-[var(--brand-deep)] text-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="space-y-1">
                <Link
                  href="/admin"
                  className="font-heading text-lg tracking-tight"
                >
                  GoThailandHome Admin
                </Link>
                <p className="text-xs text-white/70">
                  Internal property management
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href="/en/properties"
                  className="text-white/80 hover:text-white"
                >
                  View site
                </Link>
                {session ? (
                  <form action={logoutAdmin}>
                    <button
                      type="submit"
                      className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
                    >
                      Sign out
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
