import type { Locale } from "@/i18n/config";
import { products, isProductId } from "./products";

/**
 * Installation price list used by the quote configurator and the PDF estimate.
 *
 * ⚠️ TO CONFIRM: these amounts were taken from the reference quote page supplied by the client
 * (solarorksolution.com/devis-borne). Replace them with your own validated prices.
 * Amounts are in DH. `vatLabel` is printed next to prices (e.g. "TTC").
 */
export const pricing = {
  vatLabel: "TTC",
  /** Prices in this list are added only when the visitor keeps the line ticked. */
  services: [
    {
      id: "protection",
      kind: "fixed" as const,
      price: 860,
      label: { fr: "Protection borne", en: "Charger protection" },
      detail: {
        fr: "Disjoncteur magnétothermique et interrupteur différentiel 30 mA.",
        en: "Circuit breaker and 30 mA residual-current device.",
      },
    },
    {
      id: "cable",
      kind: "perMeter" as const,
      price: 80,
      label: { fr: "Câble 5G6 mm²", en: "5G6 mm² cable" },
      detail: {
        fr: "Câble R2V/RVK 5G6 mm², facturé au mètre linéaire.",
        en: "R2V/RVK 5G6 mm² cable, charged per linear metre.",
      },
    },
    {
      id: "installation",
      kind: "fixed" as const,
      price: 1250,
      label: { fr: "Forfait installation", en: "Installation package" },
      detail: {
        fr: "Pose complète et mise en service par nos techniciens.",
        en: "Full installation and commissioning by our technicians.",
      },
    },
  ],
  cable: { min: 1, max: 60, default: 10 },
} as const;

export type ServiceId = (typeof pricing.services)[number]["id"];
export const serviceIds = pricing.services.map((s) => s.id) as ServiceId[];

export type EstimateLine = {
  id: string;
  label: string;
  detail: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type Estimate = { lines: EstimateLine[]; total: number; complete: boolean };

/** Builds the itemised estimate. `complete` is false when no charger has been chosen yet. */
export function computeEstimate(
  input: { product: string; services: string[]; cableLength: number },
  lang: Locale,
): Estimate {
  const lines: EstimateLine[] = [];
  const product = isProductId(input.product) ? products[input.product] : null;
  if (product) {
    lines.push({
      id: product.id,
      label: `${lang === "fr" ? "Borne de recharge" : "EV charger"} ${product.name} ${product.powerKw} kW`,
      detail: product.tagline[lang],
      qty: 1,
      unit: "U",
      unitPrice: product.startingPrice,
      total: product.startingPrice,
    });
  }
  const meters = clampCable(input.cableLength);
  for (const s of pricing.services) {
    if (!input.services.includes(s.id)) continue;
    const qty = s.kind === "perMeter" ? meters : 1;
    lines.push({
      id: s.id,
      label: s.label[lang],
      detail: s.detail[lang],
      qty,
      unit: s.kind === "perMeter" ? "ml" : "U",
      unitPrice: s.price,
      total: s.price * qty,
    });
  }
  return { lines, total: lines.reduce((sum, l) => sum + l.total, 0), complete: Boolean(product) };
}

export function clampCable(value: number) {
  if (!Number.isFinite(value)) return pricing.cable.default;
  return Math.min(pricing.cable.max, Math.max(pricing.cable.min, Math.round(value)));
}

/** "1 250,00 DH" style used in the price list and PDF. */
export function formatAmount(amount: number, decimals = 0) {
  return (
    amount
      .toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      .replace(/\s/g, " ") + " DH"
  );
}
