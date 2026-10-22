import Image from "next/image";
import { products } from "@/config/products";
import type { ProjectSlot } from "@/config/projects";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./ProjectGallery.module.css";

type Props = { items: ProjectSlot[]; lang: Locale; t: Dictionary["projects"] };

function formatDate(value: string, lang: Locale) {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return value;
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

export function ProjectGallery({ items, lang, t }: Props) {
  return (
    <ul className={styles.grid}>
      {items.map((item, i) => {
        const kind = t.kinds[item.kind];
        const meta = [item.city, item.product ? products[item.product].name : null, item.date ? formatDate(item.date, lang) : null]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={item.id} data-reveal className={styles.item} data-shape={i % 3 === 0 ? "tall" : "base"}>
            <figure>
              {item.image ? (
                <div className={styles.media}>
                  <Image
                    src={item.image.src}
                    alt={item.title?.[lang] ?? item.brief[lang]}
                    fill
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
                    quality={80}
                  />
                </div>
              ) : (
                <div className={`${styles.media} ${styles.placeholder}`} role="img" aria-label={`${t.placeholder} — ${item.brief[lang]}`}>
                  <svg viewBox="0 0 48 64" width="40" aria-hidden focusable={false}>
                    <rect x="8" y="4" width="32" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="24" cy="33" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M24 44v8c0 6-8 6-8 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span className="mono">{t.placeholder}</span>
                  <span className={styles.brief}>{item.brief[lang]}</span>
                </div>
              )}
              <figcaption className={styles.caption}>
                <span className="mono muted">{kind}</span>
                {item.image && item.title ? <span className={styles.title}>{item.title[lang]}</span> : null}
                {item.image && meta ? <span className="small muted">{meta}</span> : null}
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
