"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import { captureAttribution } from "@/lib/submit";
import { Phone, WhatsApp } from "./Icons";
import styles from "./ContactDock.module.css";

/**
 * Persistent contact access:
 *  - desktop: a discreet floating WhatsApp button
 *  - mobile: the same WhatsApp button plus a bottom dock (Quote · Call)
 * Hidden on the quotation page, which has its own sticky summary bar.
 */
export function ContactDock({ lang, t }: { lang: Locale; t: Dictionary["common"] }) {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, []);

  if (pathname.startsWith(href(lang, "quote"))) return null;

  const wa = whatsappUrl(t.whatsapp.defaultMessage);

  return (
    <>
      <a href={wa} target="_blank" rel="noopener" className={styles.float} aria-label={t.whatsapp.floatingLabel}>
        <WhatsApp size={26} />
        <span className={styles.floatLabel}>WhatsApp</span>
      </a>

      {/* Mobile: WhatsApp stays in the floating button above this bar. */}
      <nav className={styles.bar} aria-label={t.mobileBar.label}>
        <Link href={href(lang, "quote")} className={styles.primary}>
          {t.cta.quote}
        </Link>
        <a href={telUrl} className={styles.item}>
          <Phone size={18} /> {t.mobileBar.call}
        </a>
      </nav>
    </>
  );
}
