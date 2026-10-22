import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, routes, type RouteKey } from "@/i18n/config";

const keys = Object.keys(routes) as RouteKey[];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, lang, first, ...rest] = pathname.split("/");

  // No locale prefix: French is the default language.
  if (!lang || !isLocale(lang)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!first) return NextResponse.next();

  const ownKey = keys.find((k) => routes[k][lang] === first);
  if (ownKey) {
    const folder = routes[ownKey].fr;
    if (folder === first) return NextResponse.next();
    // Localized slug -> internal (French) folder.
    const url = request.nextUrl.clone();
    url.pathname = "/" + [lang, folder, ...rest].join("/");
    return NextResponse.rewrite(url);
  }

  // A slug from the other language (e.g. /en/bornes): redirect to the canonical one.
  const otherKey = keys.find((k) => Object.values(routes[k]).includes(first as never));
  if (otherKey) {
    const url = request.nextUrl.clone();
    url.pathname = "/" + [lang, routes[otherKey][lang], ...rest].join("/");
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)"],
};
