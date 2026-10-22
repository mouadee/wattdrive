import Image from "next/image";
import type { ProjectSlot } from "@/config/projects";
import type { Locale } from "@/i18n/config";
import styles from "./PhotoMarquee.module.css";

/** Two rows of real installation photos drifting in opposite directions (pauses on hover). */
export function PhotoMarquee({ items, lang }: { items: ProjectSlot[]; lang: Locale }) {
  const withImg = items.filter((p) => p.image);
  const rows = [withImg.filter((_, i) => i % 2 === 0), withImg.filter((_, i) => i % 2 === 1)];
  return (
    <div className={styles.marquee}>
      {rows.map((row, r) => (
        <div key={r} className={styles.row} data-dir={r === 0 ? "left" : "right"}>
          <div className={styles.track}>
            {[...row, ...row, ...row].map((p, i) => (
              <figure key={`${p.id}-${i}`} className={styles.card} aria-hidden={i >= row.length || undefined}>
                <Image
                  src={p.image!.src}
                  alt={i < row.length ? p.brief[lang] : ""}
                  fill
                  sizes="(max-width: 640px) 40vw, 210px"
                  quality={75}
                />
                {p.title ? <figcaption>{p.title[lang]}</figcaption> : null}
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
