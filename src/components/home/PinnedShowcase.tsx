"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatPrice, productList } from "@/config/products";
import { href, type Locale } from "@/i18n/config";
import { ArrowRight } from "../Icons";
import styles from "./PinnedShowcase.module.css";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  lang: Locale;
  t: { from: string; priceShort: string; quoteFor: string; view: string; hint: string };
};

/**
 * Desktop: the section pins and scrolling swaps NORA → NEO (image, text, giant power figure).
 * Mobile / reduced motion: the same panels simply stack.
 */
export function PinnedShowcase({ lang, t }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const imgs = el.querySelectorAll<HTMLElement>("[data-img]");
      const panels = el.querySelectorAll<HTMLElement>("[data-panel]");
      const dots = el.querySelectorAll<HTMLElement>("[data-dot]");
      gsap.set(imgs[1], { autoAlpha: 0, xPercent: 40, rotate: 10, scale: 0.8 });
      gsap.set(panels[1], { autoAlpha: 0, y: 80 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=140%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            dots.forEach((d, i) => d.toggleAttribute("data-on", i === (self.progress > 0.5 ? 1 : 0)));
          },
        },
      });
      tl.to("[data-kw]", { xPercent: -35, ease: "none", duration: 1 }, 0)
        .to("[data-bg]", { backgroundPosition: "100% 0%", ease: "none", duration: 1 }, 0)
        .to(imgs[0], { autoAlpha: 0, xPercent: -40, rotate: -10, scale: 0.8, duration: 0.35, ease: "power2.in" }, 0.3)
        .to(panels[0], { autoAlpha: 0, y: -80, duration: 0.3, ease: "power2.in" }, 0.3)
        .to(imgs[1], { autoAlpha: 1, xPercent: 0, rotate: 0, scale: 1, duration: 0.4, ease: "power3.out" }, 0.55)
        .to(panels[1], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.6);
      return () => tl.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className={styles.root}>
      <div className={styles.bg} data-bg aria-hidden />
      <span className={styles.kw} data-kw aria-hidden>
        22kW · 22kW · 22kW
      </span>

      <div className={`container ${styles.grid}`}>
        <div className={styles.stage}>
          <div className={styles.halo} aria-hidden />
          {productList.map((p) => (
            <div key={p.id} className={styles.img} data-img>
              <Image src={p.image.src} alt={p.image.alt[lang]} width={p.image.width} height={p.image.height} unoptimized />
            </div>
          ))}
        </div>

        <div className={styles.panels}>
          {productList.map((p, i) => {
            const short = p.name.replace("RAEDIAN ", "");
            return (
              <article key={p.id} className={styles.panel} data-panel aria-labelledby={`pin-${p.id}`}>
                <div className={styles.mobileImg} aria-hidden>
                  <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} unoptimized />
                </div>
                <span className={styles.index}>0{i + 1} — RAEDIAN · {p.powerKw} kW</span>
                <h3 id={`pin-${p.id}`} className={styles.name}>
                  {short}
                </h3>
                <p className={styles.tagline}>{p.summary[lang]}</p>
                <ul className={styles.features}>
                  {p.highlights[lang].map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <p className={styles.price}>
                  <small>{t.from}</small> {formatPrice(p.startingPrice)}
                  <span>{t.priceShort}</span>
                </p>
                <div className="btn-row">
                  <Link href={`${href(lang, "quote")}?model=${p.id}`} className="btn btn--primary">
                    {t.quoteFor.replace("{product}", short)} <ArrowRight />
                  </Link>
                  <Link href={href(lang, "chargers", p.id)} className="btn btn--secondary">
                    {t.view}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.dots} aria-hidden>
        {productList.map((p, i) => (
          <span key={p.id} data-dot data-on={i === 0 ? "" : undefined} />
        ))}
        <em>{t.hint}</em>
      </div>
    </div>
  );
}
