import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, href, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { projectPhoto, projects } from "@/config/projects";
import { productList } from "@/config/products";
import { pageMetadata } from "@/lib/metadata";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import { LeadForm } from "@/components/LeadForm";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { RotatingWords } from "@/components/home/RotatingWords";
import { PinnedShowcase } from "@/components/home/PinnedShowcase";
import { Timeline } from "@/components/home/Timeline";
import { SolutionTabs } from "@/components/home/SolutionTabs";
import { PhotoMarquee } from "@/components/home/PhotoMarquee";
import { ArrowRight, Check, Phone, Sparkle, WhatsApp } from "@/components/Icons";
import styles from "./home.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const meta = pageMetadata({
    lang,
    route: "home",
    title: t.meta.home.title,
    description: t.meta.home.description,
    image: { url: "/images/products/raedian-neo-original.webp", width: 1536, height: 1024, alt: "RAEDIAN NEO" },
  });
  return { ...meta, title: { absolute: `${t.meta.home.title} · ${site.name}` } };
}

// Real installation photos (config/projects.ts) illustrate each solution.
const solutionPhotos = {
  residential: projectPhoto("residence-parking-1"),
  villa: projectPhoto("villa-nora-1"),
  business: projectPhoto("bornes-sur-pied-1"),
  commercial: projectPhoto("residence-parking-3"),
};

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const t = getDictionary(lang);
  const L = t.landing;
  const h = t.home;
  const [nora, neo] = productList;

  return (
    <>
      <MotionReady />
      {/* ---------- Hero ---------- */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.aurora} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.grain} aria-hidden />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className={styles.pill}>
              <span className={styles.pulse} aria-hidden />
              {L.hero.pill}
            </p>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span className={styles.line}>{L.hero.titleA}</span>
              <RotatingWords words={L.hero.rotate} className={styles.rotate} />
            </h1>
            <p className={styles.heroLead}>{L.hero.lead}</p>
            <div className={styles.heroCtas}>
              <Magnetic>
                <Link href={href(lang, "quote")} className={`btn btn--primary ${styles.bigBtn}`}>
                  {t.common.cta.quote} <ArrowRight />
                </Link>
              </Magnetic>
              <a href={whatsappUrl(t.common.whatsapp.defaultMessage)} target="_blank" rel="noopener" className="btn btn--whatsapp">
                <WhatsApp /> WhatsApp
              </a>
            </div>
            <Link href={href(lang, "projects")} className={styles.proof}>
              <span className={styles.proofThumbs} aria-hidden>
                {["villa-nora-2", "residence-parking-1", "bornes-sur-pied-1"].map((id) => (
                  <Image key={id} src={projectPhoto(id).image!.src} alt="" width={96} height={96} quality={70} />
                ))}
              </span>
              <span>{L.hero.proof}</span>
              <ArrowRight size={16} />
            </Link>
            <ul className={styles.trust}>
              {L.hero.trust.map((x) => (
                <li key={x}>
                  <Check size={16} /> {x}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroShowcase}>
            <HeroShowcase
              lang={lang}
              t={{ pick: L.hero.pick, from: L.hero.from, quoteFor: t.common.cta.quoteFor, view: t.common.cta.seeProduct }}
            />
          </div>
        </div>
        <a href="#realisations" className={styles.scrollCue}>
          <span>{L.hero.scroll}</span>
          <i aria-hidden />
        </a>
      </section>

      {/* ---------- Ticker ---------- */}
      <div className={styles.ticker} aria-hidden>
        <div className={styles.tickerInner}>
          {[0, 1].map((k) => (
            <span key={k} className="ticker__track">
              {h.ticker.map((item) => (
                <span key={item} className={styles.tickerItem}>
                  {item}
                  <Sparkle />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Real installations ---------- */}
      <section className="section section--alt" id="realisations" aria-labelledby="projects-title">
        <div className="container">
          <div className={styles.headRow}>
            <div className={styles.head}>
              <p className="eyebrow" data-reveal>
                {L.projects.eyebrow}
              </p>
              <h2 id="projects-title" className="h2" data-split>
                {L.projects.title}
              </h2>
            </div>
            <Link href={href(lang, "projects")} className="btn btn--secondary" data-reveal>
              {L.projects.all} <ArrowRight />
            </Link>
          </div>
        </div>
        <div data-reveal>
          <PhotoMarquee items={projects} lang={lang} />
        </div>
      </section>

      {/* ---------- Pinned product showcase ---------- */}
      <section aria-labelledby="showcase-title">
        <div className={`container ${styles.head} ${styles.headCenter}`}>
          <p className="eyebrow" data-reveal>
            {L.showcase.eyebrow}
          </p>
          <h2 id="showcase-title" className="h2" data-split>
            {L.showcase.title}
          </h2>
        </div>
        <PinnedShowcase
          lang={lang}
          t={{
            from: L.hero.from,
            priceShort: t.common.priceShort,
            quoteFor: t.common.cta.quoteFor,
            view: t.common.cta.seeProduct,
            hint: L.showcase.hint,
          }}
        />
      </section>

      {/* ---------- Process timeline ---------- */}
      <section className="section" aria-labelledby="process-title">
        <div className="container">
          <div className={`${styles.head} ${styles.headCenter}`}>
            <p className="eyebrow" data-reveal>
              {L.process.eyebrow}
            </p>
            <h2 id="process-title" className="h2" data-split>
              {L.process.title}
            </h2>
          </div>
          <Timeline steps={h.process.steps} />
        </div>
      </section>

      {/* ---------- Solutions ---------- */}
      <section className="section section--alt" aria-labelledby="solutions-title">
        <div className="container">
          <div className={styles.head}>
            <p className="eyebrow" data-reveal>
              {L.solutions.eyebrow}
            </p>
            <h2 id="solutions-title" className="h2" data-split>
              {L.solutions.title}
            </h2>
          </div>
          <div data-reveal>
            <SolutionTabs
              more={t.common.cta.learnMore}
              items={(["residential", "villa", "business", "commercial"] as const).map((key) => ({
                key,
                title: h.solutions.items[key].title,
                text: h.solutions.items[key].text,
                href: `${href(lang, "solutions")}#${key}`,
                img: { src: solutionPhotos[key].image!.src, alt: solutionPhotos[key].brief[lang] },
              }))}
            />
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className={styles.cta} data-reveal>
            <div className={styles.ctaGlow} aria-hidden />
            <div className={styles.ctaText}>
              <p className={styles.ctaEyebrow}>{L.cta.eyebrow}</p>
              <h2 id="cta-title" className={styles.ctaTitle}>
                {L.cta.title}
              </h2>
              <p>{L.cta.text}</p>
              <div className="btn-row">
                <Magnetic>
                  <Link href={href(lang, "quote")} className={`btn btn--light ${styles.bigBtn}`}>
                    {L.cta.primary} <ArrowRight />
                  </Link>
                </Magnetic>
                <a href={whatsappUrl(t.common.whatsapp.defaultMessage)} target="_blank" rel="noopener" className="btn btn--outline-light">
                  <WhatsApp /> WhatsApp
                </a>
              </div>
            </div>
            <div className={styles.ctaProducts} aria-hidden>
              {[nora, neo].map((p, i) => (
                <div key={p.id} className={styles[`ctaProd${i}`]} data-parallax={i === 0 ? -18 : -8}>
                  <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} unoptimized />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Call-back form ---------- */}
      <section className="section section--alt" id="devis" aria-labelledby="quote-title">
        <div className={`container ${styles.quote}`}>
          <div className={styles.quoteIntro}>
            <p className="eyebrow" data-reveal>
              {h.quote.eyebrow}
            </p>
            <h2 id="quote-title" className="h2" data-split>
              {L.contact.title}
            </h2>
            <p className="lead" data-reveal>
              {L.contact.text}
            </p>
            <div className={styles.direct} data-reveal>
              <a href={telUrl} className={styles.directLink}>
                <span className={styles.directIcon}>
                  <Phone size={20} />
                </span>
                <span>
                  <span className="small muted">{t.common.cta.call}</span>
                  <strong>{site.contact.phoneDisplay}</strong>
                </span>
              </a>
              <a href={whatsappUrl(t.common.whatsapp.defaultMessage)} target="_blank" rel="noopener" className={styles.directLink}>
                <span className={styles.directIcon}>
                  <WhatsApp size={20} />
                </span>
                <span>
                  <span className="small muted">WhatsApp</span>
                  <strong>{t.common.cta.whatsapp}</strong>
                </span>
              </a>
            </div>
          </div>
          <div className={styles.quoteForm} data-reveal>
            <LeadForm lang={lang} t={t.form} whatsappDefault={t.common.whatsapp.defaultMessage} idPrefix="home" />
          </div>
        </div>
      </section>
    </>
  );
}
