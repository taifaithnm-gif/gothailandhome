import {
  documentBodyStyle,
  documentFontClassName,
  documentMetadata,
} from "@/lib/ui/document-fonts";

import "../globals.css";

export const metadata = documentMetadata;

/** Minimal document shell for `/auth/*` route handlers and any auth UI. */
export default function AuthLayout({
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
