import type { Metadata } from "next";

import {
  documentBodyStyle,
  documentFontClassName,
  documentMetadata,
} from "@/lib/ui/document-fonts";

import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...documentMetadata,
  title: "Internal Review | GoThailandHome",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/**
 * Internal review shell — sibling of `[lang]` / `admin`.
 * Not linked from public nav or sitemap. Dev-gated at page level.
 */
export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={documentFontClassName}>
      <body className="min-h-full font-sans" style={documentBodyStyle}>
        {children}
      </body>
    </html>
  );
}
