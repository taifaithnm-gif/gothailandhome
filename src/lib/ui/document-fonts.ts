import type { Metadata } from "next";
import {
  Geist_Mono,
  Noto_Sans_SC,
  Noto_Sans_Thai,
  Plus_Jakarta_Sans,
} from "next/font/google";
import type { CSSProperties } from "react";

import { siteConfig } from "@/config/site";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Shared font CSS variables for every root document shell. */
export const documentFontClassName = `${plusJakarta.variable} ${notoSansSc.variable} ${notoSansThai.variable} ${geistMono.variable} h-full antialiased`;

export const documentBodyStyle = {
  "--font-body":
    "var(--font-display), var(--font-cjk), var(--font-thai), ui-sans-serif, system-ui, sans-serif",
} as CSSProperties;

export const documentMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "Thailand property platform for buyers, sellers, and renters.",
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    images: [
      {
        url: "/og/default.svg",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/default.svg"],
  },
};
