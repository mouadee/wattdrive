import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { media } from "@/config/media";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ArrowRight } from "@/components/Icons";
import styles from "./solutions.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/solutions">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({
    lang,
    route: "solutions",
    title: t.meta.solutions.title,
    description: t.meta.solutions.description,
    image: { url: `${media.villa.src}?w=1200&h=630&fit=crop&q=80&auto=format`, width: 1200, height: 630, alt: media.villa.alt[lang] },
  });
}

const sections = [
  { key: "residential", photo: media.garage },
  { key: "villa", photo: media.villa },
  { key: "business", photo: media.office },
  { key: "commercial", photo: media.parking },
] as const;

export default async function SolutionsPage({ params }: PageProps<"/[lang]/solutions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const s = t.solutions;

  return (
    <>
      <MotionReady />
      <PageIntro eyebrow={s.eyebrow} title={s.title} lead={s.lead} />

      <section className="container" aria-label={s.lead}>
        <ol className={styles.factors}>
          {s.factors.map((f, i) => (
            <li key={f.title} data-reveal>
              <span className="mono">{i + 1}</span>
              <h2 className={styles.factorTitle}>{f.title}</h2>
              <p className="muted">{f.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="section">
        {sections.map(({ key, photo }, i) => {
          const sec = s.sections[key];
          return (
            <section key={key} id={key} data-reveal className={`container ${styles.block}`} aria-labelledby={`${key}-title`}>
              <Photo
                photo={photo}
                lang={lang}
                sizes="(max-width: 900px) 92vw, 50vw"
                ratio="5 / 4"
                className={styles.photo}
              />
              <div className={styles.text}>
                <span className="mono muted">{String(i + 1).padStart(2, "0")} / 04</span>
                <h2 id={`${key}-title`} className="h2">
                  {sec.title}
                </h2>
                <p className="lead">{sec.text}</p>
                <div className={styles.points}>
                  <p className="eyebrow eyebrow--plain">{s.toConsider}</p>
                  <ul>
                    {sec.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
                <Link href={href(lang, "quote")} className="link-arrow">
                  {t.common.cta.quote} <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
