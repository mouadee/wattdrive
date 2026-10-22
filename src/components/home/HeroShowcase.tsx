"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { formatPrice, productList } from "@/config/products";
import { href, type Locale } from "@/i18n/config";
import { ArrowRight } from "../Icons";
import styles from "./HeroShowcase.module.css";

type Props = { lang: Locale; t: { pick: string; from: string; quoteFor: string; view: string } };

/** Interactive NORA / NEO switcher: tabs, 3D tilt, animated swap, gentle autoplay until the visitor interacts. */
export function HeroShowcase({ lang, t }: Props) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const price = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const p = productList[active];
  const short = p.name.replace("RAEDIAN ", "");

  const [prev, setPrev] = useState<number | null>(null);

  // Price counts between the two values (GSAP, overwrite-safe). The image swap itself is pure CSS.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = price.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obj = { v: productList[active === 0 ? 1 : 0].startingPrice };
    const tween = gsap.to(obj, {
      v: productList[active].startingPrice,
      duration: 0.9,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => {
        el.textContent = formatPrice(Math.round(obj.v / 10) * 10);
      },
      onComplete: () => {
        el.textContent = formatPrice(productList[active].startingPrice);
      },
    });
    return () => {
      tween.kill();
      el.textContent = formatPrice(productList[active].startingPrice);
    };
  }, [active]);

  // Autoplay every 4.5s until the visitor interacts
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((a) => {
        setPrev(a);
        return (a + 1) % productList.length;
      });
    }, 4500);
    return () => window.clearInterval(id);
  }, [auto]);

  // 3D tilt
  useEffect(() => {
    const el = stage.current;
    const card = tilt.current;
    if (!el || !card || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      ry(x * 16);
      rx(-y * 12);
      el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const choose = useCallback((i: number) => {
    setAuto(false);
    setActive((a) => {
      if (a !== i) setPrev(a);
      return i;
    });
  }, []);

  return (
    <div className={styles.showcase}>
      <div className={styles.tabs} role="tablist" aria-label={t.pick}>
        <span className={styles.indicator} style={{ transform: `translateX(${active * 100}%)` }} aria-hidden />
        {productList.map((prod, i) => (
          <button
            key={prod.id}
            type="button"
            role="tab"
            id={`hero-tab-${prod.id}`}
            aria-selected={i === active}
            aria-controls="hero-panel"
            className={styles.tab}
            onClick={() => choose(i)}
          >
            {prod.name.replace("RAEDIAN ", "")}
          </button>
        ))}
      </div>

      <div
        ref={stage}
        className={styles.stage}
        id="hero-panel"
        role="tabpanel"
        aria-labelledby={`hero-tab-${p.id}`}
        onPointerEnter={() => setAuto(false)}
      >
        <div className={styles.ring} aria-hidden />
        <div className={styles.ring2} aria-hidden />
        <span className={styles.kw} aria-hidden>
          {p.powerKw}kW
        </span>
        <div ref={tilt} className={styles.tilt}>
          {productList.map((prod, i) => (
            <div
              key={prod.id}
              className={styles.img}
              data-state={i === active ? "in" : i === prev ? "out" : "idle"}
              aria-hidden={i !== active}
            >
              <Image
                src={prod.image.src}
                alt={prod.image.alt[lang]}
                width={prod.image.width}
                height={prod.image.height}
                unoptimized
                preload={i === 0}
              />
            </div>
          ))}
        </div>
        <ul className={styles.chips} key={p.id}>
          {p.highlights[lang].slice(0, 2).map((h, i) => (
            <li key={h} className={styles[`chip${i}`]}>
              {h}
            </li>
          ))}
        </ul>
        <div className={styles.progress} aria-hidden>
          {productList.map((prod, i) => (
            <span key={prod.id} data-active={i === active} data-auto={auto} />
          ))}
        </div>
      </div>

      <div className={styles.meta}>
        <div>
          <p className={styles.name}>{p.name}</p>
          <p className={styles.price}>
            <small>{t.from}</small> <span ref={price}>{formatPrice(p.startingPrice)}</span>
          </p>
        </div>
        <div className={styles.metaLinks}>
          <Link href={`${href(lang, "quote")}?model=${p.id}`} className="btn btn--primary">
            {t.quoteFor.replace("{product}", short)} <ArrowRight />
          </Link>
          <Link href={href(lang, "chargers", p.id)} className={styles.view}>
            {t.view}
          </Link>
        </div>
      </div>
    </div>
  );
}
