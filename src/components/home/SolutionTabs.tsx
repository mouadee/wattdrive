"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "../Icons";
import styles from "./SolutionTabs.module.css";

type Item = { key: string; title: string; text: string; href: string; img: { src: string; alt: string } };

/** Accessible tabs; the photo cross-fades and zooms on change. Auto-advances until the visitor interacts. */
export function SolutionTabs({ items, more }: { items: Item[]; more: string }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % items.length), 5000);
    return () => window.clearInterval(id);
  }, [auto, items.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    setAuto(false);
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (active + dir + items.length) % items.length;
    setActive(next);
    document.getElementById(`sol-tab-${items[next].key}`)?.focus();
  };

  return (
    <div className={styles.wrap} onPointerEnter={() => setAuto(false)}>
      <div className={styles.list} role="tablist" aria-orientation="vertical" onKeyDown={onKey}>
        {items.map((it, i) => (
          <button
            key={it.key}
            id={`sol-tab-${it.key}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`sol-panel-${it.key}`}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => {
              setAuto(false);
              setActive(i);
            }}
          >
            <span className={styles.tabNum}>0{i + 1}</span>
            <span className={styles.tabBody}>
              <strong>{it.title}</strong>
              <span>{it.text}</span>
            </span>
            <span className={styles.bar} data-auto={auto} aria-hidden />
          </button>
        ))}
      </div>

      <div className={styles.media}>
        {items.map((it, i) => (
          <div
            key={it.key}
            id={`sol-panel-${it.key}`}
            role="tabpanel"
            aria-labelledby={`sol-tab-${it.key}`}
            hidden={i !== active}
            className={styles.panel}
          >
            <Image src={it.img.src} alt={it.img.alt} fill sizes="(max-width: 900px) 92vw, 55vw" quality={80} loading="eager" />
            <div className={styles.caption}>
              <strong>{it.title}</strong>
              <Link href={it.href} className={styles.more}>
                {more} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
