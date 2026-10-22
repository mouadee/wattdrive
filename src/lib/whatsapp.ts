import { site } from "@/config/site";

/** wa.me link with a prefilled message. Nothing is sent until the visitor confirms in WhatsApp. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const telUrl = `tel:${site.contact.phoneHref}`;
