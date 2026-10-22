import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { copyrightYear, site } from "@/config/site";
import { productList } from "@/config/products";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export function Footer({ lang, t }: { lang: Locale; t: Dictionary["common"] }) {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p>{t.footer.tagline}</p>
            <a
              href={whatsappUrl(t.whatsapp.defaultMessage)}
              className="btn btn--outline-light"
              target="_blank"
              rel="noopener"
            >
              {t.cta.whatsapp}
            </a>
          </div>

          <nav aria-label={t.footer.navTitle} className={styles.col}>
            <h2 className={styles.title}>{t.footer.navTitle}</h2>
            <ul>
              <li><Link href={href(lang, "chargers")}>{t.nav.chargers}</Link></li>
              <li><Link href={href(lang, "solutions")}>{t.nav.solutions}</Link></li>
              <li><Link href={href(lang, "projects")}>{t.nav.projects}</Link></li>
              <li><Link href={href(lang, "quote")}>{t.nav.quote}</Link></li>
              <li><Link href={href(lang, "contact")}>{t.nav.contact}</Link></li>
            </ul>
          </nav>

          <div className={styles.col}>
            <h2 className={styles.title}>{t.footer.productsTitle}</h2>
            <ul>
              {productList.map((p) => (
                <li key={p.id}>
                  <Link href={href(lang, "chargers", p.id)}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h2 className={styles.title}>{t.footer.contactTitle}</h2>
            <ul>
              <li>
                <a href={telUrl}>{site.contact.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </li>
              {site.contact.address ? <li>{site.contact.address}</li> : null}
              <li>{site.contact.city}, {lang === "fr" ? "Maroc" : "Morocco"}</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {copyrightYear} {site.name}. {t.footer.rights}
          </p>
          <p>{t.footer.photoCredit}</p>
          <Link href={href(lang, "privacy")}>{t.footer.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
