import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, isLocale, locales } from "@/config/locales";

function getPreferredLocale(request: NextRequest) {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const preferred = header.split(",").map((part) => {
    const [tag, qValue] = part.trim().split(";q=");
    return {
      tag: tag.toLowerCase(),
      quality: qValue ? Number(qValue) : 1,
    };
  });

  preferred.sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferred) {
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("th")) return "th";
    if (tag.startsWith("en")) return "en";
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/partners/app") ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    const maybeLocale = pathname.split("/")[1];
    if (maybeLocale && !isLocale(maybeLocale)) {
      return;
    }
    return;
  }

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
