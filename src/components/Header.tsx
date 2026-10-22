"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { href, translatePath, type Locale, type RouteKey } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { ArrowRight, Close, Menu, Phone, WhatsApp } from "./Icons";
import styles from "./Header.module.css";

type Props = {
  lang: Locale;
  t: Pick<Dictionary["common"], "nav" | "language" | "cta" | "whatsapp">;
};

const navItems: RouteKey[] = ["chargers", "solutions", "projects", "contact"];

export function Header({ lang, t }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const otherLang: Locale = lang === "fr" ? "en" : "fr";
  const switchHref = translatePath(pathname, otherLang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (key: RouteKey) => pathname.startsWith(href(lang, key));

  return (
    <header className={styles.header} data-scrolled={scrolled || open}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.pill}>
        <Link href={href(lang, "home")} className={styles.logo} aria-label={`${site.name} — ${t.nav.home}`}>
          <Logo />
        </Link>

        <nav aria-label={t.nav.primary} className={styles.nav}>
          <ul>
            {navItems.map((key) => (
              <li key={key}>
                <Link
                  href={href(lang, key)}
                  className={styles.navLink}
                  aria-current={isActive(key) ? "page" : undefined}
                >
                  {t.nav[key as keyof typeof t.nav]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link
            href={switchHref}
            hrefLang={otherLang}
            lang={otherLang}
            className={styles.lang}
            aria-label={t.language.switchAria}
          >
            <span aria-hidden className={styles.langCurrent}>
              {lang.toUpperCase()}
            </span>
            <span aria-hidden className={styles.langSep}>
              /
            </span>
            <span aria-hidden>{t.language.switchToShort}</span>
          </Link>
          <Link href={href(lang, "quote")} className={`btn btn--green ${styles.cta} ${styles.ctaMobile}`}>
            {t.nav.quote}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close /> : <Menu />}
            <span className="sr-only">{open ? t.nav.closeMenu : t.nav.menu}</span>
          </button>
        </div>
        </div>
      </div>

      <div id="mobile-menu" ref={panelRef} className={styles.panel} hidden={!open}>
        <div className="container">
          <ul className={styles.panelNav}>
            {(["home", ...navItems] as RouteKey[]).map((key, i) => (
              <li key={key}>
                <Link href={href(lang, key)} aria-current={pathname === href(lang, key) ? "page" : undefined}>
                  <span className="mono muted">{String(i).padStart(2, "0")}</span>
                  {t.nav[key as keyof typeof t.nav]}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.panelActions}>
            <Link href={href(lang, "quote")} className="btn btn--primary btn--block">
              {t.cta.quote} <ArrowRight />
            </Link>
            <div className={styles.panelRow}>
              <a href={whatsappUrl(t.whatsapp.defaultMessage)} className="btn btn--whatsapp" target="_blank" rel="noopener">
                <WhatsApp /> WhatsApp
              </a>
              <a href={telUrl} className="btn btn--secondary">
                <Phone /> {t.cta.call}
              </a>
            </div>
            <Link href={switchHref} hrefLang={otherLang} lang={otherLang} className={styles.panelLang}>
              {t.language.switchTo}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
