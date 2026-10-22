import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { productList } from "@/config/products";
import { href, locales, routes, type RouteKey } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { key: RouteKey; rest?: string[] }[] = [
    ...(Object.keys(routes) as RouteKey[]).map((key) => ({ key })),
    ...productList.map((p) => ({ key: "chargers" as RouteKey, rest: [p.id] })),
  ];

  return entries.flatMap(({ key, rest = [] }) =>
    locales.map((lang) => ({
      url: new URL(href(lang, key, ...rest), site.url).toString(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, new URL(href(l, key, ...rest), site.url).toString()])),
      },
      priority: key === "home" ? 1 : key === "quote" || key === "chargers" ? 0.9 : 0.6,
    })),
  );
}
