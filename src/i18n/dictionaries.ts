import type { Locale } from "./config";
import fr, { type Dictionary } from "./dictionaries/fr";
import en from "./dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Replace {placeholders} in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export type { Dictionary };
