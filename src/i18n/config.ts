export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Localized URL segments. The app folders use the French slug;
 * `src/proxy.ts` rewrites the English slug to the French folder.
 */
export const routes = {
  home: { fr: "", en: "" },
  chargers: { fr: "bornes", en: "chargers" },
  solutions: { fr: "solutions", en: "solutions" },
  projects: { fr: "realisations", en: "projects" },
  quote: { fr: "devis", en: "quote" },
  contact: { fr: "contact", en: "contact" },
  privacy: { fr: "confidentialite", en: "privacy" },
} as const;

export type RouteKey = keyof typeof routes;

/** Build a localized href, e.g. href("en", "chargers", "nora") -> "/en/chargers/nora". */
export function href(lang: Locale, key: RouteKey, ...rest: string[]): string {
  const segment = routes[key][lang];
  return "/" + [lang, segment, ...rest].filter(Boolean).join("/");
}

/** Map a pathname from one locale to its equivalent in another (used by the language switcher). */
export function translatePath(pathname: string, to: Locale): string {
  const [, maybeLang, first, ...rest] = pathname.split("/");
  if (!maybeLang || !isLocale(maybeLang)) return "/" + to;
  const from = maybeLang;
  if (!first) return "/" + to;
  const key = (Object.keys(routes) as RouteKey[]).find((k) => routes[k][from] === first);
  if (!key) return "/" + to;
  return href(to, key, ...rest);
}

export const ogLocale: Record<Locale, string> = { fr: "fr_MA", en: "en_US" };
