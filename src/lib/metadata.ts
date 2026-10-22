import type { Metadata } from "next";
import { site } from "@/config/site";
import { href, locales, ogLocale, type Locale, type RouteKey } from "@/i18n/config";

type Options = {
  lang: Locale;
  route: RouteKey;
  rest?: string[];
  title: string;
  description: string;
  /** Absolute or root-relative image used for Open Graph. */
  image?: { url: string; width?: number; height?: number; alt: string };
};

export function pageMetadata({ lang, route, rest = [], title, description, image }: Options): Metadata {
  const path = href(lang, route, ...rest);
  const languages = Object.fromEntries(locales.map((l) => [l, href(l, route, ...rest)]));
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { ...languages, "x-default": href("fr", route, ...rest) },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: path,
      title,
      description,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
