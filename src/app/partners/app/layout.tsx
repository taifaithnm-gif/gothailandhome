import type { Metadata } from "next";

import {
  documentBodyStyle,
  documentFontClassName,
  documentMetadata,
} from "@/lib/ui/document-fonts";

import "../../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...documentMetadata,
  title: "Partner app | GoThailandHome",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PartnerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={documentFontClassName}>
      <body className="min-h-full font-sans" style={documentBodyStyle}>
        <div className="min-h-screen bg-[var(--brand-soft)] text-[var(--brand-deep)]">
          {children}
        </div>
      </body>
    </html>
  );
}
