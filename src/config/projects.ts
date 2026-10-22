import type { Locale } from "@/i18n/config";
import type { ProductId } from "./products";

/**
 * Installation gallery ("Nos réalisations") — real photos supplied by the client.
 * Only set `city`, `product` or `date` when they are known for that installation.
 *
 * To add a project: put the photo in /public/images/projects/ and append an entry.
 */
export type ProjectSlot = {
  id: string;
  kind: "villa" | "home" | "residence" | "office" | "commercial" | "outdoor";
  /** Short description of the shot (used as alt text). */
  brief: Record<Locale, string>;
  image: { src: string; width: number; height: number } | null;
  title?: Record<Locale, string>;
  city?: string;
  product?: ProductId;
  date?: string; // "YYYY-MM"
};

const photo = (name: string) => ({ src: `/images/projects/${name}.webp`, width: 1500, height: 2000 });

export const projects: ProjectSlot[] = [
  {
    id: "villa-nora-2",
    kind: "villa",
    product: "nora",
    image: photo("villa-nora-2"),
    title: { fr: "NORA dans une villa, côté jardin", en: "NORA at a villa, garden side" },
    brief: {
      fr: "Borne RAEDIAN NORA façade bois installée à l’entrée d’une villa, au milieu du jardin",
      en: "RAEDIAN NORA wood-front charger installed at a villa entrance, in the garden",
    },
  },
  {
    id: "residence-parking-1",
    kind: "residence",
    image: photo("residence-parking-1"),
    title: { fr: "Parking souterrain de résidence", en: "Residential underground car park" },
    brief: {
      fr: "Borne RAEDIAN murale sur un pilier de parking souterrain, coffret de protection au-dessus, véhicule en charge",
      en: "Wall-mounted RAEDIAN charger on an underground car park pillar, protection box above, vehicle charging",
    },
  },
  {
    id: "bornes-sur-pied-1",
    kind: "commercial",
    image: photo("bornes-sur-pied-1"),
    title: { fr: "Deux bornes sur pied", en: "Two pedestal chargers" },
    brief: {
      fr: "Deux bornes RAEDIAN montées sur pieds noirs le long d’une haie de bambous",
      en: "Two RAEDIAN chargers mounted on black pedestals along a bamboo hedge",
    },
  },
  {
    id: "residence-neo-tableau",
    kind: "residence",
    image: photo("residence-neo-tableau"),
    title: { fr: "Borne et coffret de protection dédié", en: "Charger with dedicated protection box" },
    brief: {
      fr: "Borne RAEDIAN avec écran et lecteur de badge, coffret de protection et goulotte sur pilier",
      en: "RAEDIAN charger with screen and badge reader, protection box and cable trunking on a pillar",
    },
  },
  {
    id: "villa-nora-1",
    kind: "outdoor",
    product: "nora",
    image: photo("villa-nora-1"),
    title: { fr: "NORA sur prise industrielle", en: "NORA on an industrial socket" },
    brief: {
      fr: "Borne RAEDIAN NORA raccordée à un coffret avec prises industrielles, en extérieur",
      en: "RAEDIAN NORA connected to a box with industrial sockets, outdoors",
    },
  },
  {
    id: "residence-parking-2",
    kind: "residence",
    image: photo("residence-parking-2"),
    title: { fr: "Recharge sur place privative", en: "Charging on a private bay" },
    brief: {
      fr: "Véhicule en charge sur une place privative de parking souterrain équipée d’une borne RAEDIAN",
      en: "Vehicle charging on a private underground bay fitted with a RAEDIAN charger",
    },
  },
  {
    id: "bornes-sur-pied-2",
    kind: "commercial",
    image: photo("bornes-sur-pied-2"),
    title: { fr: "Bornes sur pied, vue de face", en: "Pedestal chargers, front view" },
    brief: {
      fr: "Deux bornes RAEDIAN sur pieds avec câbles enroulés, devant une haie de bambous",
      en: "Two RAEDIAN pedestal chargers with coiled cables, in front of a bamboo hedge",
    },
  },
  {
    id: "residence-parking-3",
    kind: "residence",
    image: photo("residence-parking-3"),
    title: { fr: "Installation soignée sur pilier", en: "Clean pillar installation" },
    brief: {
      fr: "Borne RAEDIAN à bandeau lumineux, coffret et passage de câble sous goulotte sur pilier de parking",
      en: "RAEDIAN charger with light bar, protection box and cable trunking on a car park pillar",
    },
  },
];

/** Shortcut used by the homepage and solutions. */
export const projectPhoto = (id: string) => projects.find((p) => p.id === id)!;
