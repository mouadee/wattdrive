import type { Locale } from "@/i18n/config";

/**
 * RAEDIAN product catalogue — the single source of truth for names, prices, images and specs.
 *
 * Rules for editing:
 *  - Only fill in values confirmed by the manufacturer's official datasheet.
 *  - A spec left as `null` is simply not displayed (never shown as "TBC").
 *  - Prices are in Moroccan dirhams and refer to the charging station only.
 */

type Localized<T = string> = Record<Locale, T>;

export type ProductId = "nora" | "neo";

export type SpecKey =
  | "power"
  | "supply"
  | "maxCurrent"
  | "connector"
  | "cable"
  | "display"
  | "access"
  | "connectivity"
  | "protection"
  | "dimensions"
  | "weight"
  | "operatingTemp"
  | "certifications"
  | "warranty";

export type ApplicationKey = "home" | "villa" | "business" | "commercial";

export type Product = {
  id: ProductId;
  name: string;
  /** Rated maximum power in kW, as advertised. */
  powerKw: number;
  /** Advertised starting price in DH (charging station only). */
  startingPrice: number;
  image: {
    src: string;
    width: number;
    height: number;
    /** Background of the original file, used to match the product stage. */
    background: "white" | "transparent";
    alt: Localized;
  };
  tagline: Localized;
  summary: Localized;
  /** Design points visible on the official photograph. Confirm wording with the supplier. */
  highlights: Localized<string[]>;
  /** Spec values; `null` = not yet confirmed, hidden on the site. */
  specs: Record<SpecKey, Localized | null>;
  applications: ApplicationKey[];
  /** Optional link to the official PDF datasheet placed in /public (e.g. "/docs/raedian-nora.pdf"). */
  datasheet: string | null;
};

export const products: Record<ProductId, Product> = {
  nora: {
    id: "nora",
    name: "RAEDIAN NORA",
    powerKw: 22,
    startingPrice: 7490,
    image: {
      src: "/images/products/raedian-nora.webp",
      width: 394,
      height: 511,
      background: "transparent",
      alt: {
        fr: "Borne de recharge RAEDIAN NORA, façade effet bois et prise de charge en partie basse",
        en: "RAEDIAN NORA charging station with a wood-effect front and charging socket at the bottom",
      },
    },
    tagline: {
      fr: "Une borne chaleureuse, pensée pour la maison.",
      en: "A warm-looking charger designed for the home.",
    },
    summary: {
      fr: "NORA associe une façade effet bois à un boîtier noir sobre. Elle s’intègre naturellement dans un garage, une entrée de villa ou un parking privé.",
      en: "NORA pairs a wood-effect front with a sober black housing. It sits naturally in a garage, a villa driveway or a private car park.",
    },
    highlights: {
      fr: ["Façade effet bois", "Prise de charge protégée par un volet", "Indicateurs lumineux en façade"],
      en: ["Wood-effect front panel", "Charging socket with protective cover", "Front status indicator lights"],
    },
    specs: {
      power: { fr: "Jusqu’à 22 kW", en: "Up to 22 kW" },
      supply: null,
      maxCurrent: null,
      connector: null,
      cable: null,
      display: null,
      access: null,
      connectivity: null,
      protection: null,
      dimensions: null,
      weight: null,
      operatingTemp: null,
      certifications: null,
      warranty: null,
    },
    applications: ["home", "villa", "business"],
    datasheet: null,
  },
  neo: {
    id: "neo",
    name: "RAEDIAN NEO",
    powerKw: 22,
    startingPrice: 9990,
    image: {
      // Background-removed version of the official photo (raedian-neo-original.webp), product untouched.
      src: "/images/products/raedian-neo-cutout.webp",
      width: 715,
      height: 851,
      background: "transparent",
      alt: {
        fr: "Borne de recharge RAEDIAN NEO noire avec écran intégré et câble de charge enroulé",
        en: "Black RAEDIAN NEO charging station with integrated screen and coiled charging cable",
      },
    },
    tagline: {
      fr: "Un boîtier noir épuré, écran intégré.",
      en: "A clean black unit with a built-in screen.",
    },
    summary: {
      fr: "NEO adopte un boîtier noir mat au dessin net, avec un écran d’information en façade et un câble de charge attaché. Une borne discrète pour la maison comme pour le parking professionnel.",
      en: "NEO features a matte black housing with crisp lines, a front information screen and an attached charging cable. A discreet charger for homes and professional car parks alike.",
    },
    highlights: {
      fr: ["Écran d’information en façade", "Câble de charge attaché", "Boîtier noir mat"],
      en: ["Front information screen", "Attached charging cable", "Matte black housing"],
    },
    specs: {
      power: { fr: "Jusqu’à 22 kW", en: "Up to 22 kW" },
      supply: null,
      maxCurrent: null,
      connector: null,
      cable: { fr: "Câble attaché", en: "Attached cable" },
      display: { fr: "Écran intégré", en: "Built-in screen" },
      access: null,
      connectivity: null,
      protection: null,
      dimensions: null,
      weight: null,
      operatingTemp: null,
      certifications: null,
      warranty: null,
    },
    applications: ["home", "villa", "business"],
    datasheet: null,
  },
};

export const productList: Product[] = [products.nora, products.neo];

export const specOrder: SpecKey[] = [
  "power",
  "supply",
  "maxCurrent",
  "connector",
  "cable",
  "display",
  "access",
  "connectivity",
  "protection",
  "dimensions",
  "weight",
  "operatingTemp",
  "certifications",
  "warranty",
];

export function isProductId(value: string): value is ProductId {
  return value in products;
}

/** "7 490 DH" — same notation in both languages, as used on the Moroccan market. */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00a0")}\u00a0DH`;
}
