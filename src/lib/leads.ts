/**
 * Lead schema + validation, shared by the forms (client) and /api/leads (server).
 * Error values are codes; the UI maps them to translated messages (dictionary `form.errors`).
 */

export type ErrorCode = "required" | "fullName" | "phone" | "email" | "choose" | "consent" | "year";
export type Errors<K extends string = string> = Partial<Record<K, ErrorCode>>;

export const productChoices = ["nora", "neo", "advice"] as const;
export const installationTypes = ["residential", "professional"] as const;
export const housingTypes = ["house", "villa", "apartment", "commercial", "other"] as const;
export const contactMethods = ["whatsapp", "phone"] as const;

export type ContactLead = {
  fullName: string;
  phone: string;
  city: string;
  installationType: string;
  vehicle: string;
  product: string;
  details: string;
};

export type QuoteLead = {
  // Step 1 — configuration
  product: string;
  services: string; // comma-separated service ids (see config/pricing.ts)
  cableLength: string; // metres
  housing: string;
  city: string;
  // Step 2 — contact
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactMethod: string;
};

export type Attribution = Partial<
  Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term" | "fbclid" | "landing", string>
>;

export type LeadPayload =
  | { kind: "contact"; lang: string; data: ContactLead; consent: boolean; attribution?: Attribution; website?: string }
  | { kind: "quote"; lang: string; data: QuoteLead; consent: boolean; attribution?: Attribution; website?: string };

const oneOf = (list: readonly string[], value: string) => list.includes(value);

/** Normalise a Moroccan or international phone number; returns null when invalid. */
export function normalizePhone(raw: string): string | null {
  const v = raw.replace(/[\s.\-()]/g, "");
  const ma = v.match(/^(?:\+212|00212|0)([5-7]\d{8})$/);
  if (ma) return `+212${ma[1]}`;
  const intl = v.match(/^(?:\+|00)([1-9]\d{7,14})$/);
  if (intl) return `+${intl[1]}`;
  return null;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(errors: Errors, key: string, value: string, required = true) {
  if (required && !value.trim()) errors[key] = "required";
}

function choice(errors: Errors, key: string, value: string, list: readonly string[], required = true) {
  if (!value) {
    if (required) errors[key] = "choose";
  } else if (!oneOf(list, value)) errors[key] = "choose";
}

export function validateName(errors: Errors, value: string) {
  if (!value.trim()) errors.fullName = "required";
  else if (value.trim().length < 3) errors.fullName = "fullName";
}

export function validatePhone(errors: Errors, value: string) {
  if (!value.trim()) errors.phone = "required";
  else if (!normalizePhone(value)) errors.phone = "phone";
}

export function validateContact(d: ContactLead, consent: boolean): Errors<keyof ContactLead | "consent"> {
  const e: Errors = {};
  validateName(e, d.fullName);
  validatePhone(e, d.phone);
  text(e, "city", d.city);
  choice(e, "installationType", d.installationType, installationTypes);
  choice(e, "product", d.product, productChoices);
  if (!consent) e.consent = "consent";
  return e;
}

/** Quote validation is split by step so the configurator can validate one step at a time. */
export const quoteSteps: (keyof QuoteLead)[][] = [
  ["product", "services", "cableLength", "housing", "city"],
  ["firstName", "lastName", "phone", "email", "contactMethod"],
];

export function validateQuoteStep(step: number, d: QuoteLead, consent: boolean): Errors<keyof QuoteLead | "consent"> {
  const e: Errors = {};
  if (step === 0) {
    choice(e, "product", d.product, productChoices);
    choice(e, "housing", d.housing, housingTypes);
    text(e, "city", d.city);
    const m = Number(d.cableLength);
    if (!Number.isFinite(m) || m < 1 || m > 200) e.cableLength = "required";
  }
  if (step === 1) {
    if (!d.firstName.trim()) e.firstName = "required";
    if (!d.lastName.trim()) e.lastName = "required";
    validatePhone(e, d.phone);
    if (d.email.trim() && !emailRe.test(d.email.trim())) e.email = "email";
    choice(e, "contactMethod", d.contactMethod, contactMethods);
    if (!consent) e.consent = "consent";
  }
  return e;
}

export function validateQuote(d: QuoteLead, consent: boolean) {
  return Object.assign({}, ...quoteSteps.map((_, i) => validateQuoteStep(i, d, consent))) as Errors;
}

export const hasErrors = (e: Errors) => Object.keys(e).length > 0;

/** Trim and cap every string field so the payload stays small and clean. */
export function sanitize<T extends Record<string, string>>(data: T, keys: (keyof T)[]): T {
  const out = {} as T;
  for (const k of keys) {
    const v = data?.[k];
    out[k] = (typeof v === "string" ? v.trim().slice(0, 1000) : "") as T[keyof T];
  }
  return out;
}

export const contactKeys: (keyof ContactLead)[] = [
  "fullName",
  "phone",
  "city",
  "installationType",
  "vehicle",
  "product",
  "details",
];
export const quoteKeys: (keyof QuoteLead)[] = quoteSteps.flat();

/** Return a copy of `errors` without `key` (used to clear a field's error as soon as it is edited). */
export function clearError(errors: Errors, key: string): Errors {
  const next = { ...errors };
  delete next[key];
  return next;
}
