/**
 * Business details — the single place to edit contact information.
 * TODO: replace every placeholder below with the real company details before going live.
 */
export const site = {
  name: "Wattdrive",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.wattdrive.ma", // TODO: final domain
  contact: {
    // Displayed phone number and the `tel:` link target (international format, no spaces).
    phoneDisplay: "06 98 77 09 23",
    phoneHref: "+212698770923",
    // WhatsApp number in international format, digits only (used for wa.me links).
    whatsapp: "212698770923",
    email: "contact@wattdrive.ma", // TODO
    city: "Agadir",
    address: "Hay Mohammadi" as string | null,
  },
  social: {
    facebook: null as string | null, // TODO: e.g. "https://www.facebook.com/…"
    instagram: null as string | null,
  },
} as const;

/** Suggestions offered in the city fields (free text is still accepted). */
export const moroccanCities = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "El Jadida",
  "Mohammedia",
  "Témara",
  "Salé",
  "Bouskoura",
  "Benslimane",
  "Essaouira",
  "Ifrane",
  "Nador",
  "Laâyoune",
  "Dakhla",
  "Safi",
  "Béni Mellal",
  "Settat",
  "Berrechid",
  "Dar Bouazza",
  "Ouarzazate",
  "Khouribga",
  "Taroudant",
  "Inezgane",
  "Tiznit",
];

/** Evaluated at build time (module scope), so pages stay fully static. */
export const copyrightYear = new Date().getFullYear();
