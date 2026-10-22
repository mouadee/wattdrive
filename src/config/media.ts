import type { Locale } from "@/i18n/config";

/**
 * Editorial photography. All current images come from Unsplash (free licence, commercial use allowed).
 * To use your own photos: drop the file into /public/images/… and set `src` to "/images/…".
 * None of these photos show RAEDIAN products — product imagery lives in config/products.ts.
 */
export type Photo = {
  src: string;
  alt: Record<Locale, string>;
  credit?: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const media = {
  hero: {
    src: unsplash("1732194357689-0bc28399329b"),
    alt: {
      fr: "Voiture électrique blanche en charge, câble branché sur une borne murale",
      en: "White electric car charging, cable connected to a wall-mounted charger",
    },
  },
  plugIn: {
    src: unsplash("1745392842741-10dd83fa4dca"),
    alt: {
      fr: "Conducteur branchant le connecteur de recharge sur son véhicule électrique",
      en: "Driver plugging the charging connector into an electric vehicle",
    },
  },
  garage: {
    src: unsplash("1694889649834-91ff242d1763"),
    alt: {
      fr: "Voiture électrique blanche garée dans un garage privé moderne",
      en: "White electric car parked in a modern private garage",
    },
  },
  villa: {
    src: unsplash("1726220198700-9a50ee1afa6c"),
    alt: {
      fr: "Maison individuelle avec garage et panneaux solaires, voiture électrique stationnée devant",
      en: "Detached house with garage and solar panels, electric car parked in front",
    },
  },
  office: {
    src: unsplash("1782257399128-331f0f478abc"),
    alt: {
      fr: "Immeubles de bureaux modernes et parking extérieur",
      en: "Modern office buildings and outdoor car park",
    },
  },
  parking: {
    src: unsplash("1758448721043-2cc4eba0e483"),
    alt: {
      fr: "Parking souterrain d’une résidence avec places marquées",
      en: "Residential underground car park with marked bays",
    },
  },
  casablanca: {
    src: unsplash("1753880710301-d559119c3e92"),
    alt: {
      fr: "Rue de Casablanca bordée d’immeubles blancs et de palmiers",
      en: "Casablanca street lined with white buildings and palm trees",
    },
  },
  connectorDetail: {
    src: unsplash("1694889650671-23e4e76f9d0f"),
    alt: {
      fr: "Connecteur de recharge branché sur une voiture électrique, vue rapprochée",
      en: "Close-up of a charging connector plugged into an electric car",
    },
  },
} satisfies Record<string, Photo>;
