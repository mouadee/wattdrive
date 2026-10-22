import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { formatPrice, productList } from "@/config/products";
import { pageMetadata } from "@/lib/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageIntro } from "@/components/PageIntro";
import { ProductImage } from "@/components/ProductImage";
import { Comparison } from "@/components/Comparison";
import { ArrowRight, WhatsApp } from "@/components/Icons";
import styles from "./bornes.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/bornes">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({
    lang,
    route: "chargers",
    title: t.meta.chargers.title,
    description: t.meta.chargers.description,
    image: { url: "/images/products/raedian-neo-original.webp", width: 1536, height: 1024, alt: "RAEDIAN NEO" },
  });
}

export default async function ChargersPage({ params }: PageProps<"/[lang]/bornes">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <MotionReady />
      <PageIntro eyebrow={t.chargers.eyebrow} title={t.chargers.title} lead={t.chargers.lead} />

      <section className="container" aria-label={t.chargers.title}>
        <div className={styles.models}>
          {productList.map((p, i) => (
            <article key={p.id} data-reveal className={styles.model} aria-labelledby={`model-${p.id}`}>
              <Link href={href(lang, "chargers", p.id)} tabIndex={-1} aria-hidden className={styles.modelMedia}>
                <ProductImage product={p} lang={lang} sizes="(max-width: 900px) 92vw, 46vw" variant="hero" preload={i === 0} />
              </Link>
              <div className={styles.modelBody}>
                <span className="mono muted">
                  {String(i + 1).padStart(2, "0")} · {p.powerKw} kW
                </span>
                <h2 id={`model-${p.id}`} className="h2">
                  <Link href={href(lang, "chargers", p.id)}>{p.name}</Link>
                </h2>
                <p className="lead">{p.summary[lang]}</p>
                <ul className={styles.highlights}>
                  {p.highlights[lang].map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <div className={styles.modelFoot}>
                  <div className="price">
                    <span className="price__label">{t.common.from}</span>
                    <span className="price__value">{formatPrice(p.startingPrice)}</span>
                  </div>
                  <div className="btn-row">
                    <Link href={`${href(lang, "quote")}?model=${p.id}`} className="btn btn--primary">
                      {fill(t.common.cta.quoteFor, { product: p.name.replace("RAEDIAN ", "") })}
                    </Link>
                    <Link href={href(lang, "chargers", p.id)} className="btn btn--secondary">
                      {t.common.cta.seeProduct}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className={`small muted ${styles.note}`}>{t.common.priceNote}</p>
      </section>

      <section className="section" id="compare" aria-labelledby="compare-title">
        <div className={`container ${styles.compare}`}>
          <div className={styles.compareHead} data-reveal>
            <h2 id="compare-title" className="h2">
              {t.chargers.compare.title}
            </h2>
            <p className="muted">{t.chargers.compare.lead}</p>
          </div>
          <Comparison lang={lang} t={t} />
        </div>
      </section>

      <section className="section section--dark section--tight" aria-labelledby="help-title">
        <div className={`container ${styles.help}`}>
          <div>
            <h2 id="help-title" className="h2">
              {t.chargers.help.title}
            </h2>
            <p className="lead">{t.chargers.help.text}</p>
          </div>
          <div className="btn-row">
            <Link href={`${href(lang, "quote")}?model=advice`} className="btn btn--light">
              {t.common.cta.quote} <ArrowRight />
            </Link>
            <a
              href={whatsappUrl(t.common.whatsapp.defaultMessage)}
              target="_blank"
              rel="noopener"
              className="btn btn--outline-light"
            >
              <WhatsApp /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
